import { Observable } from 'rxjs';
import queryString from 'query-string';

const SUCCESS_SUFFIX = '_SUCCESS';
const ERROR_SUFFIX = '_ERROR';

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
        useMocks = process.env.MOCKS_IN_PROD === 'true',
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

    return fetch(`${finalHost}${path}${finalQuery}`, 
        options).then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Server returned an error. ' + response.status + " - " + response.statusText);
        });
}

const fetchSuccess = (type, extra, alerts) => result => ({
    type: successType(type),
    result,
    extra,
    alert: alerts ? alerts.success : {},
});

export const successType = type => type + SUCCESS_SUFFIX;

export const errorType = type => type + ERROR_SUFFIX;

const defaultOptions = {
    useMocks: true,
}

export const createBuilder = options => doBuildEpic.bind(null, options);

const doBuildEpic = (options, type, mockFetch) => action$ => {

    const _fetch = mockFetch ? mockFetch : doFetch;

    return action$.ofType(type)
        .mergeMap(action =>
            Observable.from(_fetch(action, { ...defaultOptions, ...options }))
                .map(fetchSuccess(type, action.extra, action.alerts))
                .catch(error => Observable.of({
                    type: errorType(type),
                    result: error,
                    extra: action.extra,
                    alert: action.alerts ? action.alerts.error : undefined,
                }))
            );
}
