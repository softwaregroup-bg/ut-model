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
        init: initMethod,
        add,
        edit,
        get
    },
    ...rest
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
            async editor({id, type, layout: layoutName = type, ...init}) {
                const api = await subjectApi(get);
                const mergedSchema = merge({}, {
                    properties: {
                        [resultSet]: api?.result?.properties?.[resultSet]?.items
                    }
                }, api?.result, schema);
                const layoutMethods = layoutName && rest[`${layoutName}Methods`];
                const handleAdd = layoutMethods?.add ? methods[layoutMethods.add] : objectAdd;
                const handleGet = layoutMethods?.get ? methods[layoutMethods.get] : objectGet;
                const handleEdit = layoutMethods?.edit ? methods[layoutMethods.edit] : objectEdit;
                const handleInit = layoutMethods?.init ? methods[layoutMethods?.init] : initMethod && methods[initMethod];
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
                    init,
                    onDropdown: names => portalDropdownList(names, utMeta()),
                    onInit: handleInit ? params => handleInit(params, utMeta()) : undefined,
                    onAdd: params => handleAdd(params, utMeta()),
                    onGet: params => handleGet(params, utMeta()),
                    onEdit: params => handleEdit(params, utMeta())
                };
                return function Edit() {
                    return <Editor {...props}/>;
                };
            }
        };
    };
