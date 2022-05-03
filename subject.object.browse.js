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
    details,
    browser: {
        title,
        create,
        filter: defaultFilter,
        fetch,
        delete: remove,
        resultSet,
        navigator,
        permission: {
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
    /** @type { import('ut-portal/handlers').pageFactory<{}, {}> } */
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
            [`${subject}Api`]: subjectApi
        }
    }) {
        schema = merge({
            properties: lodashSet({}, nameField.replace(/\./g, '.properties.'), {action: ({id}) => handleTabShow([objectOpen, {id}], utMeta())})
        }, schema);
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
            }];
        }
        const onDropdown = names => portalDropdownList(names, utMeta());
        const BrowserComponent = async(pageFilter) => {
            const api = await subjectApi(fetchMethod);
            const resultSetName = resultSet || object;
            const mergedSchema = merge({}, {properties: {[resultSetName]: api?.result?.properties?.[resultSetName]?.items}}, schema);
            const defaultPageFilter = merge({}, defaultFilter, {[resultSetName]: pageFilter});
            function Browse() {
                const [tenant, setTenant] = React.useState(null);
                const [filter, setFilter] = React.useState(navigator ? lodashSet(defaultPageFilter, tenantField, tenant) : defaultPageFilter);
                const handleSelect = React.useCallback(value => {
                    setTenant(value);
                    setFilter(prev => lodashSet({...prev}, tenantField, value));
                }, [setTenant, setFilter]);
                const actions = React.useMemo(() => getActions(setFilter), [setFilter]);
                return (
                    <Explorer
                        fetch={(!navigator || tenant != null) && handleFetch}
                        resultSet={resultSetName}
                        keyField={keyField}
                        schema={mergedSchema}
                        columns={columns}
                        details={details}
                        filter={filter}
                        actions={actions}
                        onDropdown={onDropdown}
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
            };
            return Browse;
        };
        return {
            [`${subject}.${object}.browse`]: () => ({
                title,
                permission: `${subject}.${object}.browse`,
                component: BrowserComponent
            })
        };
    };
