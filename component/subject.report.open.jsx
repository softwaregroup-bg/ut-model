// @ts-check
import React from 'react';
import Report from 'ut-prime/core/Report';

const capital = string => string.charAt(0).toUpperCase() + string.slice(1);

export default ({
    subject
}) =>
    /** @type { import('ut-portal').pageFactory<{}, {}> } */
    function subjectObjectReport({
        utMeta,
        utMethod,
        import: {
            [`${subject}.report.get`]: reportGet,
            portalDropdownList
        }
    }) {
        const methods = arguments[0].import;
        return {
            [`${subject}.report.open`]: () => ({
                title: 'Report',
                permission: `${subject}.report.open`,
                component: async({id: reportId, ...init}) => {
                    const {report} = await reportGet({reportId}, utMeta());
                    const resultSet = report?.resultSet || 'result';
                    const properties = report?.schema?.properties?.params?.properties;
                    const props = {
                        name: `${capital(reportId)}Report`,
                        schema: report?.schema,
                        params: report?.params || Object.keys(report?.schema?.properties?.params?.properties).filter(name => !['pageNumber', 'pageSize', 'paging'].includes(name)),
                        columns: report?.columns || Object.keys(report?.schema?.properties?.result?.properties),
                        validation: report?.validation,
                        resultSet,
                        methods,
                        init,
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
                    return function ReportComponent(tabParams) {
                        return <Report {...props} {...tabParams}/>;
                    };
                }
            })
        };
    };
