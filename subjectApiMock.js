module.exports = ({
    subject
}) =>
    /** @type { import('ut-run').handlerFactory<{}, {}, {}> } */
    function subjectApiMock({
        config: {
            mock
        } = {}
    }) {
        if (mock !== true && !mock?.[subject]) return {};
        return {
            [`${subject}.api.get`]: () => ({paths: {}})
        };
    };
