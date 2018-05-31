# react-fetch-epic-builder

An utilitary lib for build "fetch actions" and generic EPICs handled by redux-observable.

**Installation**

npm i -S react-fetch-epic-builder

**Example**

Follow an example of use based on ducks structure.

```javascript
import { createBuilder, successType, errorType } from 'react-fetch-epic-builder';
import store from './store/configureStore';

const buildEpic = createBuilder({
    jwtGetter: () => store.getState().app.jwt,
});

// action types
const GET_COMMENTS = 'posts/GET_COMMENTS';
const GET_COMMENTS_SUCCESS = successType(GET_COMMENTS);
const GET_COMMENTS_ERROR = errorType(GET_COMMENTS);

const actionTypes = {
    GET_COMMENTS,
    GET_COMMENTS_SUCCESS,
    GET_COMMENTS_ERROR,
}

// reducer example
function reducer(state = {}, action) {
    switch (action.type) {
        case GET_COMMENTS_SUCCESS:
            return {
                ...state,
                comments: action.result.data,
            }
        case GET_COMMENTS_ERROR:
            return {
                ...state,
                comments: [],
            }
    }

    return state;
}

//action creators

// get comments from a post
const getComments = (id, page = 1) => ({
    type: GET_COMMENTS, // (required) action type
    host: 'http://myblog.com', // (optional, if a default was configured)
    path: `/posts/${id}/comments`, // (optional) destination path
    query: { // (optional) query parameter object
        page,
    },
})

const actionCreators = {
    getComments,
}

// epics
const epics = [
    buildEpic(GET_COMMENTS),
]

export default reducer;

export {
    actionTypes,
    actionCreators,
    epics,
}
```
*posts.js*

```javascript
import { combineEpics } from 'redux-observable';
import { epics as posts } from 'ducks/posts';

const rootEpic = combineEpics(...[
    ...posts,
]);

export default rootEpic;
```
*epics/index.js*
