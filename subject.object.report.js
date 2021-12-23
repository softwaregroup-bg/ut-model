// @ts-check
import React from 'react';
import Report from 'ut-front-devextreme/core/Report';

export default ({
    subject,
    object,
    report: {
        title
    },
    reports,
    schema,
    cards,
    browser: {
        fetch
    },
    methods: {
        fetch: fetchMethod
    }
}) =>
    /** @type { import('ut-portal').pageFactory<{}, {}> } */
    function subjectObjectReport({
        utMeta,
        utMethod,
        import: {
            portalDropdownList
        }
    }) {
        return {
            [`${subject}.${object}.report`]: () => ({
                title,
                permission: `${subject}.${object}.report`,
                component: async({id}) => {
                    const props = {
                        schema: {
                            properties: {
                                params: schema.properties[object],
                                result: schema.properties[object]
                            }
                        },
                        params: reports[id]?.params,
                        validation: reports[id]?.validation,
                        columns: reports[id]?.columns || cards?.browse?.widgets,
                        resultSet: reports?.[id]?.resultSet == null ? object : reports[id].resultSet,
                        onDropdown: names => portalDropdownList(names, utMeta()),
                        fetch: params => utMethod(reports?.[id]?.fetch || fetchMethod)((!reports?.[id]?.fetch && typeof fetch === 'function') ? fetch(params) : params, utMeta())
                    };
                    return function ReportComponent() {
                        return <Report {...props}/>;
                    };
                }
            })
        };
    };
