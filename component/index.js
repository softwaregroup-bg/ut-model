const subjectApi = require('./subjectApi');
const mapObjects = require('../mapObjects');

module.exports = (objects, lib, override) => [
    function component(ut) {
        const Edit = require('./Edit').default;
        const page = require('./Page').default;
        const subjectObjectBrowse = require('./subject.object.browse').default;
        const subjectObjectOpen = require('./subject.object.open').default;
        const subjectObjectNew = require('./subject.object.new').default;
        const subjectObjectReport = require('./subject.object.report').default;
        const subjectReportOpen = require('./subject.report.open').default;
        const namespace = Array.from(new Set(mapObjects(ut, objects, param => 'component/' + param.subject)));
        const subjects = Array.from(new Set(mapObjects(ut, objects, param => param.subject)));
        return [
            page
        ].concat(
            subjects.map(subject => subjectApi({subject}))
        ).concat(
            () => ({namespace}),
            lib,
            mapObjects(ut, objects, params => [
                Edit(params),
                subjectObjectBrowse(params),
                subjectObjectOpen(params),
                subjectObjectNew(params),
                subjectObjectReport(params)
            ]).flat(1),
            override
        ).concat(
            subjects.map(subject => subjectReportOpen({subject}))
        ).filter(Boolean);
    }
];