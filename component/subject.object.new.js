// @ts-check
export default ({subject, object, objectTitle}) =>
    /** @type { import('ut-portal').pageFactory<{}, {}> } */
    function subjectObjectNew({
        lib: {
            editor
        }
    }) {
        return {
            [`${subject}.${object}.new`]: () => ({
                title: `Create ${objectTitle}`,
                permission: `${subject}.${object}.add`,
                component: editor
            })
        };
    };
