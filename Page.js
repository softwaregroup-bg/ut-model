// @ts-check
import React from 'react';
import {ProgressSpinner} from 'ut-prime/core/prime';

/** @type { import('ut-portal').libFactory } */
export default function(api) {
    const methods = api.import;
    return {
        Page: new Proxy({}, {
            get(target, key) {
                // eslint-disable-next-line react/prop-types
                return function PageProxy({params, ...props}) {
                    const [Component, setComponent] = React.useState(null);
                    React.useEffect(() => {
                        methods[`component/${String(key)}`]({}, api.utMeta())
                            .then(({component}) => component(params || {}))
                            .then(value => {
                                return setComponent(() => value);
                            })
                            .catch(error => setComponent(() => function PageError() {
                                return <div>{error.message}</div>;
                            }));
                    }, [setComponent, params]);
                    return Component ? <Component {...props} /> : <ProgressSpinner />;
                };
            }
        })
    };
};
