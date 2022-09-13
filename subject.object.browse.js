// @ts-check
import React from 'react';
import Explorer from 'ut-prime/core/Explorer';
import Navigator from 'ut-prime/core/Navigator';
import merge from 'ut-function.merge';
import lodashSet from 'lodash.set';

export default ({
    subject,
    object,
    keyField,
    nameField,
    tenantField,
    schema,
    cards,
    layouts,
    details,
    browser: {
        title,
        create,
        filter: defaultFilter,
        fetch,
        delete: remove,
        resultSet,
        navigator,
        toolbar,
        table,
        view,
        layout,
        permission: {
            browse: browsePermission,
            add: addPermission,
            edit: editPermission,
            delete: deletePermission
        }
    },
    methods: {
        fetch: fetchMethod = 'fetch',
        delete: deleteMethod = 'delete',
        navigatorFetch: navigatorFetchMethod = 'customerOrganizationGraphFetch'
    }
}) =>
    /** @type { import('ut-portal').pageFactory<{}, {}> } */
    function subjectObjectBrowse({
        utMeta,
        import: {
            handleTabShow,
            portalDropdownList,
            [navigatorFetchMethod]: navigatorFetch,
            [`component/${subject}.${object}.new`]: objectNew,
            [`component/${subject}.${object}.open`]: objectOpen,
            [fetchMethod]: objectFetch,
            [deleteMethod]: objectDelete
        },
        lib: {
            editors,
            [`${subject}Api`]: subjectApi
        }
    }) {
        const methods = arguments[0].import;
        const defaultSchema = {properties: {}};
        if (nameField) lodashSet(defaultSchema.properties, nameField.replace(/\./g, '.properties.'), {action: ({id}) => handleTabShow([objectOpen, {id}], utMeta())});
        if (keyField) lodashSet(defaultSchema.properties, keyField.replace(/\./g, '.properties.'), {action: ({id}) => handleTabShow([objectOpen, {id}], utMeta())});
        schema = merge(defaultSchema, schema);
        const columns = ((cards?.browse?.widgets) || [nameField]);
        const handleFetch = (typeof fetch === 'function') ? params => objectFetch(fetch(params), utMeta()) : params => objectFetch(params, utMeta());
        const handleNavigatorFetch = params => navigatorFetch(params, utMeta());
        function getActions(setFilter) {
            remove = remove || (instances => ({[keyField]: instances.map(instance => (instance[keyField]))}));
            const handleDelete = async({selected}) => {
                try {
                    return await objectDelete(remove(selected), utMeta());
                } finally {
                    setFilter(prev => ({...prev}));
                }
            };
            return [...create.map(({
                type,
                permission = addPermission,
                ...rest
            }) => ({
                action: () => type ? handleTabShow([objectNew, {type}], utMeta()) : handleTabShow(objectNew, utMeta()),
                permission,
                ...rest
            })), {
                title: 'Edit',
                permission: editPermission,
                enabled: 'current',
                action: ({id}) => handleTabShow([objectOpen, {id}], utMeta())
            }, {
                title: 'Delete',
                permission: deletePermission,
                enabled: 'selected',
                action: handleDelete
            }, ...toolbar.map(button => ({enabled: 'current', ...button}))];
        }
        const onDropdown = names => portalDropdownList(names, utMeta());
        const defaultProps = {
            resultSet: resultSet || object,
            keyField,
            columns,
            details,
            onDropdown,
            table,
            view,
            editors,
            cards,
            layouts
        };
        const BrowserComponent = async({layout: layoutName, ...pageFilter}) => {
            const api = await subjectApi(fetchMethod); // todo: call later
            const mergedSchema = merge({}, {properties: {[defaultProps.resultSet]: api?.result?.properties?.[defaultProps.resultSet]?.items}}, schema);
            const defaultPageFilter = merge({}, defaultFilter, {[defaultProps.resultSet]: pageFilter, layout: layoutName});
            function Browse(props) {
                const [tenant, setTenant] = React.useState(null);
                const [filter, setFilter] = React.useState(navigator ? lodashSet(defaultPageFilter, tenantField, tenant) : defaultPageFilter);
                const handleSelect = React.useCallback(value => {
                    setTenant(value);
                    setFilter(prev => lodashSet({...prev}, tenantField, value));
                }, [setTenant, setFilter]);
                const toolbar = React.useMemo(() => getActions(setFilter), [setFilter]);
                const explorerProps = React.useMemo(() => merge({schema: mergedSchema}, defaultProps, props), [props]);
                return (
                    <Explorer
                        fetch={(!navigator || tenant != null) && handleFetch}
                        filter={filter}
                        layout={layoutName || layout}
                        toolbar={toolbar}
                        methods={methods}
                        {...explorerProps}
                    >
                        {navigator && <Navigator
                            fetch={handleNavigatorFetch}
                            onSelect={handleSelect}
                            keyField={navigator?.key || 'id'}
                            field={navigator?.title || 'title'}
                            title={mergedSchema?.properties?.[tenantField]?.title || 'Tenant'}
                            resultSet={navigator?.resultSet || 'organization'}
                        />}
                    </Explorer>
                );
            }
            return Browse;
        };
        return {
            [`${subject}.${object}.browse`]: () => ({
                title,
                permission: browsePermission,
                component: BrowserComponent
            })
        };
    };
