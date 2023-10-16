// @ts-check
import React from 'react';
import Explorer from 'ut-prime/core/Explorer';
import Navigator from 'ut-prime/core/Navigator';
import merge from 'ut-function.merge';
import lodashSet from 'lodash.set';

export default ({
    subject,
    object,
    subjectObject,
    keyField,
    nameField,
    tenantField,
    schema,
    cards,
    browsers: layouts,
    browser: {
        noApi: browserNoApi,
        title,
        create: browserCreate,
        filter: browserFilter,
        fetch: browserFetch,
        delete: browserDelete,
        resultSet: browserResultSet,
        navigator: browserNavigator,
        toolbar: browserToolbar,
        layout: browserLayout,
        permission: {
            browse: browsePermission,
            add: addPermission,
            edit: editPermission,
            delete: deletePermission
        },
        ...explorer
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
        const handleFetch = params => objectFetch(params, utMeta());
        const handleNavigatorFetch = params => navigatorFetch(params, utMeta());
        function getActions(setFilter, remove, create, toolbar) {
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
                confirm: 'Do you confirm the deletion of the selected rows?',
                permission: deletePermission,
                enabled: 'selected',
                action: handleDelete
            }, ...toolbar.map(button => ({enabled: 'current', ...button}))];
        }
        const onDropdown = names => portalDropdownList(names, utMeta());
        const defaultProps = {
            // resultSet: resultSet || object,
            name: subjectObject + 'Browse',
            keyField,
            columns,
            onDropdown,
            editors,
            cards,
            layouts,
            ...explorer
        };
        const BrowserComponent = async({layout: layoutName, ...pageFilter}) => {
            const {
                noApi = browserNoApi,
                create = browserCreate,
                filter: defaultFilter = browserFilter,
                fetch = browserFetch,
                delete: remove = browserDelete,
                resultSet = browserResultSet || object,
                navigator = browserNavigator,
                toolbar = browserToolbar,
                layout = browserLayout,
                ...layoutProps
            } = (layoutName && layouts[layoutName]) || {};

            const api = !noApi && await subjectApi(fetchMethod); // todo: call later
            const mergedSchema = merge({}, {
                properties: {
                    ...(api?.params?.type || api?.params?.properties || api?.params?.items) && {fetch: api?.params},
                    [resultSet]: api?.result?.properties?.[resultSet]?.items
                }
            }, schema);
            const defaultPageFilter = merge({}, defaultFilter, {[resultSet]: pageFilter, layout: layoutName});
            function Browse(props) {
                const [tenant, setTenant] = React.useState(null);
                const [filter, setFilter] = React.useState(navigator ? lodashSet(defaultPageFilter, tenantField, tenant) : defaultPageFilter);
                const handleSelect = React.useCallback(value => {
                    setTenant(value);
                    setFilter(prev => lodashSet({...prev}, tenantField, value));
                }, [setTenant, setFilter]);
                const explorerToolbar = React.useMemo(() => toolbar && getActions(setFilter, remove, create, Array.isArray(toolbar) ? toolbar : []), [setFilter]);
                const explorerProps = React.useMemo(() => merge({schema: mergedSchema, resultSet}, defaultProps, props), [props]);
                return (
                    <Explorer
                        fetch={(!navigator || tenant != null) && handleFetch}
                        fetchTransform={fetch}
                        filter={filter}
                        layout={layoutName || layout}
                        toolbar={explorerToolbar}
                        methods={methods}
                        {...explorerProps}
                        {...layoutProps}
                    >
                        {navigator && <Navigator
                            fetch={handleNavigatorFetch}
                            onSelect={handleSelect}
                            keyField={navigator?.key || 'id'}
                            field={navigator?.title || 'title'}
                            parentField={navigator?.parentField || 'parents'}
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
