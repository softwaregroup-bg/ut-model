module.exports = ({subject, object, reports}) =>
    /** @type { import('ut-run').handlers<any> } */
    api => ({
        async [`${subject}.${object}.export.request.send`](params, $meta) {
            return await super.send({
                $http: {blob: true},
                format: 'csv',
                columnConfig: [],
                filterConfig: [],
                reportName: `${object}.export.csv`,
                reportTitle: `${object}`,
                filters: {
                    pageNumber: 1,
                    pageSize: 10000,
                    timeZoneOffset: new Date().getTimezoneOffset(),
                    ...params.params
                }
            }, $meta);
        }
    });
