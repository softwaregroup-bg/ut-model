const {schema2joi} = require('./lib');

module.exports = ({
    object,
    keyField,
    schema,
    objectTitle,
    methods: {
        fetch,
        get,
        add,
        edit,
        remove,
        report
    }
}) =>
    /** @type { import('ut-run').validationFactory } */
    function subjectObjectValidation({joi, lib: {paging, orderBy, bigintNotNull}}) {
        // const fields = ;
        const single = schema2joi(joi, schema?.properties?.[object]?.properties);
        const filter = schema2joi(joi, schema?.properties?.[object]?.properties, 'optional');
        const multiple = joi.array().items(single);
        const pagination = joi.object().keys({recordsTotal: bigintNotNull});
        return {
            [fetch]: () => ({
                description: `Search ${objectTitle}`,
                params: joi.object().keys({
                    [object]: filter,
                    paging,
                    orderBy
                }),
                result: joi.object().keys({
                    [object]: multiple,
                    pagination
                })
            }),
            [get]: () => ({
                description: `Get ${objectTitle}`,
                params: joi.object().keys({
                    [keyField]: bigintNotNull
                }),
                result: joi.object().keys({
                    [object]: single
                })
            }),
            [add]: () => ({
                description: `Add ${objectTitle}`,
                params: joi.object().keys({
                    [object]: [single, multiple]
                }),
                result: joi.object().keys({
                    [object]: multiple
                })
            }),
            [edit]: () => ({
                description: `Update ${objectTitle}`,
                params: joi.object().keys({
                    [object]: [single, multiple]
                }),
                result: joi.object().keys({
                    [object]: multiple
                })
            }),
            [remove]: () => ({
                description: `Delete ${objectTitle}`,
                params: joi.object().keys({
                    [keyField]: joi.array().items(bigintNotNull)
                }),
                result: multiple
            }),
            [report]: () => ({
                description: `${objectTitle} Report`,
                params: joi.object().keys({
                    [object]: filter,
                    paging,
                    orderBy
                }),
                result: joi.object().keys({
                    [object]: multiple,
                    pagination
                })
            })
        };
    };
