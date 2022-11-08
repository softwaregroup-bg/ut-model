// @ts-check
export default ({subject, object, objectTitle}) =>
    /** @type { import('ut-portal').pageFactory<{}, {}> } */
    function subjectObjectOpen({
        lib: {
            editor
        }
    }) {
        return {
            [`${subject}.${object}.open`]: () => ({
                title: `Edit ${objectTitle}`,
                permission: `${subject}.${object}.get`,
                component: editor
            })
        };
    };
