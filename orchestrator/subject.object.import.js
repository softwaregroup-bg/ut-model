const {extname, basename, dirname, join} = require('path');
const fs = require('fs');

module.exports = ({subject, object}) =>
    /** @type { import('ut-run').handlers<any> } */
    ({
        import: {
            [`db/${subject}.${object}.clear`]: clear,
            [`db/${subject}.${object}.convert`]: convert,
            [`db/${subject}.${object}Row.fetch`]: fetch,
            [`db/${subject}.${object}.add`]: add,
            [`db/${subject}.${object}RowStaging.import`]: stagingImport,
            [`db/${subject}.${object}RowNgrams.import`]: ngramsImport
        },
        lib: {
            txt2tsv,
            tsv2tsv,
            csv2tsv,
            xls2tsv
        }
    }) => ({
        async [`${subject}.${object}.import`]({
            [`${object}`]: {
                file,
                conversion,
                format,
                ...objectRest
            },
            ...rest
        }, $meta) {
            let importResult;
            const batchRow = {};
            if (file?.originalFilename) {
                format = format || extname(file?.originalFilename)?.slice(1) || 'csv';
                await clear(objectRest, $meta);
                const filename = file.filename;

                const baseFileName = basename(filename);
                const dir = dirname(filename);
                const parts = baseFileName.split('.');
                const ngramFilename = join(dir, `${parts[0]}-ngrams`);
                let tsv = filename + '.tsv';
                const options = {object, conversion, ngramFilename};
                try {
                    const convert = {
                        txt: txt2tsv,
                        tsv: tsv2tsv,
                        csv: csv2tsv,
                        xls: xls2tsv,
                        xlsx: xls2tsv
                    }[format];
                    if (!convert) throw new Error('Unknown extension ' + format);
                    await convert(filename, tsv, $meta.auth?.actorId, options, $meta);
                    if (['xls', 'xlsx'].includes(format)) {
                        await tsv2tsv(tsv, tsv + '_', $meta.auth?.actorId, options, $meta);
                        try {
                            fs.unlinkSync(tsv);
                        } catch (e) {
                            this.error(e, $meta);
                        }
                        tsv = `${tsv}_`;
                    }
                } finally {
                    try {
                        fs.unlinkSync(filename);
                    } catch (e) {
                        this.error(e, $meta);
                    }
                }
                try {
                    importResult = await stagingImport({file: tsv}, $meta);
                    await ngramsImport({file: ngramFilename}, $meta);
                } finally {
                    try {
                        fs.unlinkSync(tsv);
                        if (fs.existsSync(ngramFilename)) fs.unlinkSync(ngramFilename);
                    } catch (e) {
                        this.error(e, $meta);
                    }
                }
                batchRow.batchId = (await convert({
                    ...objectRest,
                    fileName: file?.originalFilename
                }, $meta))?.batch?.batchId;
            } else {
                batchRow.batchId = (await add({objectRest, ...rest}, $meta))?.batch?.batchId;
            }
            return {
                ...await fetch({batchRow}, $meta),
                ...importResult
            };
        }
    });
