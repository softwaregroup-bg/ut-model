const mapObjects = require('./mapObjects');
module.exports = (objects, lib = []) => [
    function model(api) {
        return [
            ...lib,
            require('./lib/tsv2tsv'),
            require('./lib/csv2tsv'),
            require('./lib/xls2tsv'),
            ...mapObjects(
                api,
                objects,
                params => [
                    require('./subject.object.import')
                ].map(item => item(params))
            ).flat(1)
        ];
    }
];
