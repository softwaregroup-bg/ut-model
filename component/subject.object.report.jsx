// @ts-check
import React from 'react';
import Report from 'ut-prime/core/Report';
import merge from 'ut-function.merge';

export default ({
    subject,
    object,
    subjectObject,
    keyField,
    report: {
        noApi,
        title
    },
    reports,
    schema,
    cards,
    browser: {
        fetch
    },
    methods: {
        fetch: fetchMethod,
        export: exportMethod
    }
}) =>
    /** @type { import('ut-portal').pageFactory<{}, {}> } */
    function subjectObjectReport({
        utMeta,
        utMethod,
        import: {
            portalDropdownList
        },
        lib: {
            [`${subject}Api`]: subjectApi
        }
    }) {
        const methods = arguments[0].import;
        return {
            [`${subject}.${object}.report`]: () => ({
                title,
                permission: `${subject}.${object}.report`,
                component: async({id, ...init}) => {
                    const api = !noApi && await subjectApi(fetchMethod);
                    const resultSchema = merge({}, {properties: {[object]: api?.result?.properties?.[object]?.items}}, schema);
                    const paramsSchema = merge({}, {properties: {[object]: api?.params?.properties?.[object]}}, schema);
                    const method = reports?.[id]?.export || exportMethod;
                    const props = {
                        schema: {
                            properties: {
                                ...(api?.params?.type || api?.params?.properties || api?.params?.items) && {fetch: api?.params},
                                params: paramsSchema.properties[object],
                                result: resultSchema.properties[object]
                            }
                        },
                        name: subjectObject + 'Report',
                        params: reports[id]?.params,
                        validation: reports[id]?.validation,
                        columns: reports[id]?.columns || cards?.browse?.widgets,
                        resultSet: reports?.[id]?.resultSet == null ? object : reports[id].resultSet,
                        methods,
                        keyField: reports[id]?.keyField || keyField,
                        table: {
                            selectionMode: 'multiple',
                            ...reports[id]?.table
                        },
                        details: reports[id]?.details,
                        toolbar: [{
                            icon: 'pi pi-download',
                            permission: method,
                            method,
                            tooltip: 'Download',
                            reactTooltip: true
                        }].filter(item => item.method),
                        init,
                        filter: {layout: id},
                        onDropdown: names => portalDropdownList(names, utMeta()),
                        fetch: params => utMethod(reports?.[id]?.fetch || fetchMethod)((!reports?.[id]?.fetch && typeof fetch === 'function') ? fetch(params) : params, utMeta())
                    };
                    return function ReportComponent(tabParams) {
                        return <Report {...props} {...tabParams}/>;
                    };
                }
            })
        };
    };
