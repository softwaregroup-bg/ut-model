const xlsx = require.resolve('./xlsx.njs');
const exec = require('child_process').spawnSync;

// convert file from XLS format to TSV format
module.exports = () => ({
    xls2tsv(source, target, options) {
        const execResult = exec(process.argv[0], [
            xlsx,
            '--output',
            target,
            '--txt',
            source
        ]);
        if (execResult.error) throw execResult.error;
        const output = execResult.stdout.toString();
        if (execResult.status !== 0) throw new Error(output);
    }
});
