const {schema2joi} = require('../lib');

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
        report,
        import: importMethod,
        start
    }
}) =>
    /** @type { import('ut-run').validationFactory } */
    function subjectObjectValidation({joi, lib: {paging, orderBy, bigintNotNull, bigintNull, stringNull}}) {
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
            }),
            [importMethod]: () => ({
                params: joi.object().keys({
                    batch: joi.object().keys({
                        file: joi.any(),
                        batchId: bigintNull,
                        description: joi.string(),
                        format: joi.string().valid('csv', 'tsv', 'xls', 'xlsx', 'txt'),
                        conversion: stringNull
                    }),
                    batchRow: joi.array().items(joi.object())
                }),
                body: {
                    output: 'stream',
                    parse: false,
                    allow: 'multipart/form-data'
                },
                result: joi.object().keys({
                    batch: joi.object(),
                    batchRow: joi.array(),
                    rows: joi.number().integer().label('Imported Rows'),
                    errors: joi.string().label('Import Errors').allow('', null),
                    pagination
                })
            }),
            [start]: () => ({
                params: joi.object().keys({
                    batchId: bigintNotNull
                }),
                result: joi.object().unknown(true)
            })
        };
    };
