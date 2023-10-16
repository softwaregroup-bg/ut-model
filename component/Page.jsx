// @ts-check
import React from 'react';
import {ProgressSpinner} from 'ut-prime/core/prime';

/** @type { import('ut-portal').libFactory } */
export default function(api) {
    const methods = api.import;
    return {
        Page: new Proxy({}, {
            get(target, key) {
                key = String(key);
                const method = methods[`component/${key.charAt(0).toLowerCase()}${key.slice(1)}`];
                // eslint-disable-next-line react/prop-types
                return function PageProxy({params, ...props}) {
                    const [Component, setComponent] = React.useState(null);
                    React.useEffect(() => {
                        method({}, api.utMeta())
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
