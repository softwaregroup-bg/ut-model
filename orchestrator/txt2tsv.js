const fs = require('fs');
const {parse} = require('csv-parse');
const {transform} = require('stream-transform');

module.exports = ({
    lib: {
        convert
    }
}) => ({
    // convert file from TXT format to TSV format without embedded tabs
    /**
     * @param {fs.PathLike} source
     * @param {fs.PathLike} target
     * @param {string} actorId
     */
    async txt2tsv(source, target, actorId, {object = undefined, conversion = undefined, ngramFilename = undefined, ...options} = {}, $meta) {
        const context = {rows: 0, ngramFilename};

        const transformer = transform(async function(record, callback) {
            try {
                context.rows++;
                record = await convert(record, object, conversion, context, $meta);
                if (record) {
                    callback(null, actorId + '\t' + record.join('\t') + '\n');
                } else callback(null);
            } catch (error) {
                callback(error);
            }
        });

        const rd = fs.createReadStream(source);
        const wr = fs.createWriteStream(target, {encoding: 'utf16le'});
        try {
            return await new Promise(function(resolve, reject) {
                const parser = parse({
                    delimiter: '\r',
                    relax_column_count: true,
                    bom: true,
                    ...options
                });
                transformer.on('error', reject);
                parser.on('error', reject);
                rd.on('error', reject);
                wr.on('error', reject);
                wr.on('finish', () => resolve(context));
                rd.pipe(parser).pipe(transformer).pipe(wr);
            });
        } catch (error) {
            rd.destroy();
            wr.end();
            throw error;
        }
    }
});
