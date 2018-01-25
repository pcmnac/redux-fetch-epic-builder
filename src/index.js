import { Observable } from 'rxjs';
import queryString from 'query-string';

const SUCCESS_SUFFIX = '_SUCCESS';
const ERROR_SUFFIX = '_ERROR';

class FetchError extends Error {
    constructor(status, message, json) {
        super(message); // (1)
        this.name = "FetchError"; // (2)
        this.status = status;
        this.json = json;
        this.type = 'server-error';
    }
}

const doFetch = (
    { // action
        host, 
        mode, 
        method = 'get', 
        path = '', 
        query, 
        body, 
        contentType,
        includeJwtToken = true, 
        credentials,
    },
    { // options
        jwtGetter,
        defaultHost,
    }
) => {

    const headers = new Headers();
    let withHeader = false;

    if (includeJwtToken) {
        if (!jwtGetter) {
            throw Error('no jwtGetter provided!')
        }
        headers.append('Authorization', `Bearer ${jwtGetter()}`);
        withHeader = true;
    }

    if (contentType) {
        headers.append('Content-type', contentType);
        withHeader = true;
    }

    const options = {
        mode,
        credentials,
        method,
        body,
        headers: withHeader ? headers : undefined,
    };

    const finalHost = host ? host : defaultHost;
    const finalQuery = query ? ('?' + queryString.stringify(query)) : '';

    return fetch(`${finalHost}${path}${finalQuery}`, options)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new FetchError(
                response.status,
                'Server returned an error. ' + response.status + " - " + response.statusText,
                response.json().catch(() => ({ invalidJson: true })),
            );
        });
}

const defaultTransformer = action => action;

const forceObservable = transformed => {
    if (transformed instanceof Observable) {
        // console.log('transformed is already an observable');
    } else if (transformed instanceof Promise) {
        transformed = Observable.from(transformed);
    } else {
        transformed = Observable.of(transformed);
    }

    return transformed;
}

const fetchSuccess = (action, transformer = defaultTransformer) => result => {
    let transformed = transformer({
        type: successType(action.type),
        result,
        source: action,
    });

    return forceObservable(transformed);
};

const fetchError = (action, error, transformer = defaultTransformer) => {
    let transformed = transformer({
        type: errorType(action.type),
        error,
        source: action,
    });

    return forceObservable(transformed);
};

const successType = type => type + SUCCESS_SUFFIX;

const errorType = type => type + ERROR_SUFFIX;

const defaultOptions = {
    useMocks: false,
}

const createBuilder = options => doBuildEpic.bind(null, options);

const doBuildEpic = (options, type, mockFetch) => action$ => {

    const _fetch = (mockFetch && options.useMocks) ? mockFetch : doFetch;

    return action$.ofType(type)
        .mergeMap(action =>
            Observable.from(_fetch(action, { ...defaultOptions, ...options }))
                .mergeMap(fetchSuccess(action, options.successTransformer))
                .catch(error => fetchError(action, error, options.errorTransformer))
            );
}

export {
    createBuilder,
    successType,
    errorType,
}