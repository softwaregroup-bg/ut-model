const subjectObjectValidation = require('./subjectObjectValidation');
const mapObjects = require('../mapObjects');

module.exports = (objects, lib) => [
    function validation(ut) {
        return [].concat(
            require('ut-function.common-joi'),
            lib,
            mapObjects(ut, objects, subjectObjectValidation)
        ).filter(Boolean);
    }
];
