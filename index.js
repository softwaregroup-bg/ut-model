// @ts-check
const merge = require('ut-function.merge');

const {capital} = require('./lib');

const subjectObjectStep = require('./subjectObjectStep');
const subjectObjectValidation = require('./subjectObjectValidation');
const subjectObjectMock = require('./subjectObjectMock');
const subjectReportRun = require('./subjectReportRun');
const subjectApi = require('./subjectApi');
const subjectApiMock = require('./subjectApiMock');

const defaults = (joi, {
    subject,
    object,
    subjectObject = `${subject}${capital(object)}`,
    objectTitle = capital(object),
    keyField = `${object}Id`,
    nameField = `${object}.${object}Name`,
    descriptionField = `${object}Description`,
    tenantField = `${object}.businessUnitId`,
    ...rest
}) => merge({
    cards: {
        edit: {title: object, widgets: [nameField, descriptionField]},
        history: {
            className: 'col-12',
            widgets: ['history']
        },
        hidden: {
            hidden: true,
            label: 'Hidden fields',
            widgets: [`${object}.${keyField}`]
        }
    },
    schema: {
        properties: {
            [object]: {
                properties: {
                    [keyField]: {validation: joi && joi.any()},
                    [tenantField]: {title: 'Tenant', validation: joi && joi.any()},
                    [nameField.split('.').pop()]: {title: `${capital(object)} Name`, filter: true, sort: true},
                    [descriptionField]: {title: `${capital(object)} Description`, filter: true, editor: {type: 'text'}}
                }
            },
            history: {
                widget: {
                    type: 'page',
                    page: 'history.history.browse',
                    params: {object, id: `\${${object}.${keyField}}`}
                }
            }
        }
    },
    methods: {
        fetch: `${subject}.${object}.fetch`,
        add: `${subject}.${object}.add`,
        delete: `${subject}.${object}.delete`,
        get: `${subject}.${object}.get`,
        edit: `${subject}.${object}.edit`,
        report: `${subject}.${object}.report`
    },
    report: {
        title: `${objectTitle} Report`
    },
    browser: {
        title: rest.cards?.browse?.title || `${objectTitle} list`,
        resultSet: object,
        create: [{
            title: 'Create'
        }],
        toolbar: [],
        permission: {
            browse: `${subject}.${object}.browse`,
            add: `${subject}.${object}.add`,
            delete: `${subject}.${object}.delete`,
            edit: `${subject}.${object}.edit`
        }
    },
    layouts: {
        edit: ['hidden', 'edit']
    },
    reports: {},
    editor: {
        resultSet: object
    }
}, {
    subject,
    object,
    subjectObject,
    objectTitle,
    keyField,
    nameField,
    descriptionField,
    tenantField,
    ...rest
});

const mapObjects = (ut, objects, mapper) => [].concat(objects).map(item => defaults(ut.joi, item(ut))).map(mapper);

module.exports.backendMock = (objects, lib, api) => ({
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

module.exports.orchestratorMock = (objects, lib) => [
    function mock(ut) {
        return [].concat(lib, mapObjects(ut, objects, subjectObjectMock)).filter(Boolean);
    }
];

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

module.exports.component = (objects, lib, override) => [
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
