// @ts-check
import React from 'react';
import Report from 'ut-prime/core/Report';

export default ({
    subject
}) =>
    /** @type { import('ut-portal/handlers').pageFactory<{}, {}> } */
    function subjectObjectReport({
        utMeta,
        utMethod,
        import: {
            [`${subject}.report.get`]: reportGet,
            portalDropdownList
        }
    }) {
        return {
            [`${subject}.report.open`]: () => ({
                title: 'Report',
                permission: `${subject}.report.open`,
                component: async({id: reportId}) => {
                    const {report} = await reportGet({reportId}, utMeta());
                    const resultSet = report?.resultSet || 'result';
                    const properties = report?.schema?.properties?.params?.properties;
                    const props = {
                        schema: report?.schema,
                        params: report?.params || Object.keys(report?.schema?.properties?.params?.properties).filter(name => !['pageNumber', 'pageSize'].includes(name)),
                        columns: report?.columns || Object.keys(report?.schema?.properties?.result?.properties),
                        resultSet,
                        onDropdown: names => portalDropdownList(names, utMeta()),
                        fetch: ({
                            paging,
                            orderBy,
                            ...params
                        }) => utMethod(report?.fetch || `${subject}.report.run`)({
                            ...params[resultSet],
                            ...properties?.pageNumber && {pageNumber: paging?.pageNumber},
                            ...properties?.pageSize && {pageSize: paging?.pageSize},
                            ...properties?.paging && {paging},
                            ...properties?.orderBy && {orderBy}
                        }, utMeta())
                    };
                    return function ReportComponent() {
                        return <Report {...props}/>;
                    };
                }
            })
        };
    };
