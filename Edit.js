// @ts-check
import React from 'react';
import Editor from 'ut-prime/core/Editor';
import merge from 'ut-function.merge';

export default ({
    subject,
    object,
    subjectObject,
    keyField,
    typeField,
    schema,
    cards,
    layouts,
    editor: {
        resultSet
    },
    methods: {
        add,
        edit,
        get
    }
}) =>
    /** @type { import('ut-portal/handlers').libFactory } */
    function ObjectEditor({
        utMeta,
        import: {
            [add]: objectAdd,
            [edit]: objectEdit,
            [get]: objectGet,
            portalDropdownList
        },
        lib: {
            [`${subject}Api`]: subjectApi,
            editors
        }
    }) {
        const methods = arguments[0].import;
        return {
            async editor({id, type, layout: layoutName = type}) {
                const api = await subjectApi(get);
                const mergedSchema = merge({}, {
                    properties: {
                        [resultSet]: api?.result?.properties?.[resultSet]?.items
                    }
                }, api?.result, schema);
                const props = {
                    object,
                    id,
                    schema: mergedSchema,
                    editors,
                    type,
                    typeField,
                    cards,
                    layouts,
                    layoutName,
                    keyField,
                    resultSet,
                    name: subjectObject,
                    methods,
                    onDropdown: names => portalDropdownList(names, utMeta()),
                    onAdd: params => objectAdd(params, utMeta()),
                    onGet: params => objectGet(params, utMeta()),
                    onEdit: params => objectEdit(params, utMeta())
                };
                return function Edit() {
                    return <Editor {...props}/>;
                };
            }
        };
    };
