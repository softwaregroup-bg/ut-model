const subjectReportRun = require('./subject.report.run');
const subjectApiMock = require('./subject.api.get');
const subjectObjectMock = require('./subjectObjectMock');
const mapObjects = require('../mapObjects');

module.exports = (objects, lib, api) => ({
    browser: () => [
        function backend(ut) {
            const subjects = Array.from(new Set(mapObjects(ut, objects, param => param.subject)));
            return [lib]
                .concat(mapObjects(ut, objects, subjectObjectMock)).filter(Boolean)
                .concat(subjects.map(subject => subjectReportRun({subject})))
                .concat(subjects.map(subject => subjectApiMock({subject}, api)));
        }
    ]
});
