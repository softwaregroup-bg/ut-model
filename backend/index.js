const subjectObjectExport = require('./subject.object.export');
const mapObjects = require('../mapObjects');

module.exports = (objects, lib, override) => [
    function backend(ut) {
        return [].concat(
            lib,
            mapObjects(ut, objects, params => [
                subjectObjectExport(params)
            ]).flat(1),
            override
        ).filter(Boolean);
    }
];
