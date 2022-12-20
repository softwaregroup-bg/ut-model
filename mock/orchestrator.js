const subjectObjectMock = require('./subjectObjectMock');
const mapObjects = require('../mapObjects');

module.exports = (objects, lib) => [
    function mock(ut) {
        return [].concat(lib, mapObjects(ut, objects, subjectObjectMock)).filter(Boolean);
    }
];
