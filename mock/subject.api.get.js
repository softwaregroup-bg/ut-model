module.exports = ({
    subject
}, api) =>
    /** @type { import('ut-run').handlerFactory<{}, {}, {}> } */
    function subjectApiMock({
        config: {
            mock
        } = {}
    }) {
        if (mock !== true && !mock?.[subject]) return {};
        return {
            [`${subject}.api.get`]: () => api || ({paths: {}})
        };
    };
