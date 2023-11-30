const cache = {};

module.exports = ({
    subject
}) =>
    /** @type { import('ut-portal').libFactory } */
    function subjectApi({
        utMeta,
        import: {
            [`${subject}.api.get`]: subjectApiGet
        }
    }) {
        const fetchApi = async() => {
            const params = {};
            const api = await subjectApiGet({
                $http: {
                    httpMethod: 'GET',
                    uri: `/aa/api/${subject}/openapi.json`
                }
            }, utMeta());
            Object.values(api.paths).forEach(path =>
                Object.values(path).forEach(method => {
                    if (method.operationId) {
                        params[method.operationId] = {};
                        const schema = method?.requestBody?.content?.['application/json'];
                        if (schema?.schema?.properties?.jsonrpc) {
                            if (schema?.schema?.properties?.params) params[method.operationId].params = schema.schema.properties.params;
                        } else {
                            if (schema?.schema) params[method.operationId].params = schema.schema;
                        }
                        params[method.operationId].result = method?.responses?.['200']?.content?.['application/json'].schema?.properties?.result;
                    }
                })
            );
            return params;
        };
        return {
            [`${subject}Api`]: async(name) => {
                const params = cache[subject] = cache[subject] || fetchApi();
                return (await params)[name];
            }
        };
    };
