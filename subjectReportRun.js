module.exports = ({
    subject
}) =>
    /** @type { import('ut-run').handlerFactory<{}, {}, {}> } */
    function subjectReportRun() {
        return {
            [`${subject}.report.run`]: () => ({result: [{}]})
        };
    };
