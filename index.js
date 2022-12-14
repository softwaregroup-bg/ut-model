const subjectObjectStep = require('./subjectObjectStep');
const subjectObjectValidation = require('./subjectObjectValidation');
const mapObjects = require('./mapObjects');

module.exports.steps = (objects, lib) => [
    function steps(ut) {
        return [].concat(lib, mapObjects(ut, objects, subjectObjectStep)).filter(Boolean);
    }
];

module.exports.validation = (objects, lib) => [
    function validation(ut) {
        return [].concat(
            require('ut-function.common-joi'),
            lib,
            mapObjects(ut, objects, subjectObjectValidation)
        ).filter(Boolean);
    }
];

module.exports.orchestrator = require('./orchestrator')(mapObjects);
