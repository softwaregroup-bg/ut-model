module.exports = mapObjects => (objects, lib) => () => [].concat(
    function model(api) {
        return [
            require('./lib/tsv2tsv'),
            require('./lib/csv2tsv'),
            require('./lib/xls2tsv'),
            ...mapObjects(api, objects, params => [
                require('./subject.object.import')
            ].map(item => item(params))).flat(1)
        ];
    },
    lib
);
