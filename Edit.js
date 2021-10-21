// @ts-check
import React from 'react';
import Editor from 'ut-front-devextreme/core/Editor';

export default ({
    subject,
    object,
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
    /** @type { import('ut-portal').libFactory } */
    function ObjectEditor({
        utMeta,
        import: {
            [add]: objectAdd,
            [edit]: objectEdit,
            [get]: objectGet,
            portalDropdownList
        },
        lib: {
            editors
        }
    }) {
        return {
            editor({id, type, layout: layoutName = type}) {
                const props = {
                    object,
                    id,
                    schema,
                    editors,
                    type,
                    typeField,
                    cards,
                    layouts,
                    layoutName,
                    keyField,
                    resultSet,
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
