const {extname} = require('path');
const fs = require('fs');

module.exports = ({subject, object}) =>
    /** @type { import('ut-run').handlers<any> } */
    ({
        import: {
            [`db/${subject}.${object}.clear`]: clear,
            [`db/${subject}.${object}.import`]: convert,
            [`db/${subject}.${object}.fetch`]: fetch,
            [`db/${subject}.${object}Staging.import`]: stagingImport
        },
        lib: {
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
            if (file?.originalFilename) {
                format = format || extname(file?.originalFilename)?.slice(1) || 'csv';
                objectRest.filename = file?.originalFilename;
                await clear(objectRest, $meta);
                const filename = file.filename;
                let tsv = filename + '.tsv';
                const options = {conversion};
                try {
                    const convert = {
                        tsv: tsv2tsv,
                        csv: csv2tsv,
                        xls: xls2tsv,
                        xlsx: xls2tsv
                    }[format];
                    if (!convert) throw new Error('Unknown extension ' + format);
                    await convert(filename, tsv, $meta.auth?.actorId, options);
                    if (['xls', 'xlsx'].includes(format)) {
                        await tsv2tsv(tsv, tsv + '_', $meta.auth?.actorId, options);
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
                } finally {
                    try {
                        fs.unlinkSync(tsv);
                    } catch (e) {
                        this.error(e, $meta);
                    }
                }
                await convert(objectRest, $meta);
            }
            return {
                ...await fetch({reconciliation: objectRest, ...rest}, $meta),
                ...importResult
            };
        }
    });
