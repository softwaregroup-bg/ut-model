const subjectObjectStep = require('./subjectObjectStep');
const mapObjects = require('../mapObjects');

module.exports = (objects, lib) => [
    function steps(ut) {
        return [].concat(lib, mapObjects(ut, objects, subjectObjectStep)).filter(Boolean);
    }
];
