const trees = require('./trees');

module.exports = ({
    object,
    subjectObject,
    keyField,
    nameField,
    tenantField,
    browser,
    editor,
    methods: {
        fetch: fetchMethod,
        get: getMethod,
        init,
        add,
        edit,
        delete: remove,
        report: reportMethod
    }
}) =>
    /** @type { import('ut-run').handlerFactory<{}, {}, {}> } */
    function subjectObjectMock({
        lib: {
            [subjectObject]: {
                objects: instances = trees({keyField, nameField: nameField.split('.').pop(), tenantField}),
                relations = [],
                layouts = {},
                fetch = null,
                get = null,
                report = null
            } = {}
        },
        config: {
            mock
        } = {}
    }) {
        if (mock !== true && !mock?.[subjectObject]) return {};
        const byKey = criteria => instance => String(instance[keyField]) === String(criteria[keyField]);
        const find = async(criteria, resultSet) => {
            await new Promise((resolve, reject) => setTimeout(resolve, 100));
            const found = instances.findIndex(byKey(criteria));
            if (found >= 0) {
                return resultSet ? {
                    [resultSet]: instances[found],
                    ...relations[found]
                } : instances[found];
            }
        };
        const compare = ({field, dir, smaller = {ASC: -1, DESC: 1}[dir]}) => function compare(a, b) {
            if (a[field] < b[field]) return smaller;
            if (a[field] > b[field]) return -smaller;
            return 0;
        };
        const filter = async criteria => {
            const condition = criteria && criteria[object] && Object.entries(criteria[object]);
            const where = criteria?.layout ? layouts?.[criteria?.layout] ?? instances : instances;
            const result = !condition ? where : where.filter(
                instance => condition.every(
                    ([name, value]) => value == null || instance[name] === value || String(instance[name]).toLowerCase().includes(String(value).toLowerCase())
                )
            );
            if (Array.isArray(criteria.orderBy) && criteria.orderBy.length) result.sort(compare(criteria.orderBy[0]));
            await new Promise((resolve, reject) => setTimeout(resolve, 100));
            return Promise.resolve({
                [browser.resultSet]: criteria.paging ? result.slice((criteria.paging.pageNumber - 1) * criteria.paging.pageSize, criteria.paging.pageNumber * criteria.paging.pageSize) : [...result],
                pagination: {
                    recordsTotal: result.length
                }
            });
        };
        let maxId = instances.reduce((max, instance) => Math.max(max, Number(instance[keyField])), 0);
        return {
            [fetchMethod]: fetch ? fetch(filter) : filter,
            [getMethod]: get ? get(find) : async criteria => await find(criteria, editor.resultSet),
            [init]: params => params,
            [add](msg) {
                const instance = msg?.payload?.jsonrpc ? msg.payload.params : msg;
                const objects = [].concat(instance[editor.resultSet]);
                const result = objects.map(obj => {
                    maxId += 1;
                    return {
                        [tenantField]: 100,
                        ...obj,
                        [keyField]: maxId
                    };
                });
                instances.push(...result);
                return {[editor.resultSet]: result};
            },
            async [edit](msg) {
                const edited = msg?.payload?.jsonrpc ? msg.payload.params : msg;
                const objects = [].concat(edited[editor.resultSet]);
                const result = await Promise.all(objects.map(async i => {
                    const instance = await find({[keyField]: i[keyField]});
                    if (instance) return Object.assign(instance, i);
                }));
                return {[editor.resultSet]: result.filter(Boolean)};
            },
            [remove](msg) {
                const deleted = msg?.payload?.jsonrpc ? msg.payload.params : msg;
                const result = [];
                for (const item of deleted[keyField]) {
                    const found = instances.findIndex(byKey({[keyField]: item}));
                    result.push(found >= 0 ? result[found] : null);
                    if (found >= 0) instances.splice(found, 1);
                }
                return result;
            },
            [reportMethod]: report ? report(filter) : filter
        };
    };
