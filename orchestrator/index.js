const mapObjects = require('../mapObjects');
module.exports = (objects, lib = []) => [
    function model(api) {
        return [
            ...lib,
            require('./tsv2tsv'),
            require('./csv2tsv'),
            require('./xls2tsv'),
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
