// @ts-check
export default ({subject, object}) =>
    /** @type { import('ut-portal/handlers').pageFactory<{}, {}> } */
    function subjectObjectOpen({
        lib: {
            editor
        }
    }) {
        return {
            [`${subject}.${object}.open`]: () => ({
                title: `Edit ${object}`,
                permission: `${subject}.${object}.get`,
                component: editor
            })
        };
    };
