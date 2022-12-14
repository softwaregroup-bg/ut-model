const merge = require('ut-function.merge');

const {capital} = require('./lib');

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
            widgets: [{
                name: '',
                type: 'page',
                page: 'history.history.browse',
                params: {object, id: `\${${object}.${keyField}}`}
            }]
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

module.exports = (ut, objects, mapper) => [].concat(objects).map(item => defaults(ut.joi, item(ut))).map(mapper);
