const fs = require('fs');
const {parse} = require('csv-parse');
const {transform} = require('stream-transform');

module.exports = ({
    lib: {
        convert
    }
}) => ({
    // convert file from TSV format to TSV format without embedded tabs
    /**
     * @param {fs.PathLike} source
     * @param {fs.PathLike} target
     * @param {string} actorId
     */
    async tsv2tsv(source, target, actorId, {conversion = undefined, ...options} = {}) {
        let rows = 0;

        const transformer = transform(function(record, callback) {
            rows++;
            convert?.(record, conversion);
            callback(null, actorId + '\t' + record.join('\t') + '\n');
        });

        const rd = fs.createReadStream(source);
        const wr = fs.createWriteStream(target, {encoding: 'utf16le'});
        try {
            return await new Promise(function(resolve, reject) {
                const parser = parse({
                    delimiter: '\t',
                    relax_column_count: true,
                    ...options
                });
                transformer.on('error', reject);
                parser.on('error', reject);
                rd.on('error', reject);
                wr.on('error', reject);
                wr.on('finish', () => resolve(rows));
                rd.pipe(parser).pipe(transformer).pipe(wr);
            });
        } catch (error) {
            rd.destroy();
            wr.end();
            throw error;
        }
    }
});
