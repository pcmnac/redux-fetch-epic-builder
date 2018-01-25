import { Subject } from 'rxjs';
import { ActionsObservable } from 'redux-observable';
import { expect } from 'chai';
import { createBuilder, successType, errorType } from '../src';
import { async } from './utils';

const buildEpic = createBuilder({
    useMocks: true,
});

const TEST_ACTION = 'TEST_ACTION';
const TEST_ACTION_SUCCESS = successType(TEST_ACTION);
const TEST_ACTION_ERROR = errorType(TEST_ACTION);

describe('test success', function () {
    it('should emit a success action', function (done) {

        const action = {
            type: TEST_ACTION,
            param: 123,
        };

        const expectedResult = { data: 456 };

        const successMock = action => Promise.resolve(expectedResult);

        const $store = new Subject();
        const $actions = new ActionsObservable($store);

        const epic = buildEpic(TEST_ACTION, successMock);

        const $results = epic($actions);

        $store.subscribe(data => console.log(data));
        $results.subscribe((data) => {
            async(() => {
                expect(data).to.deep.equal({
                    type: TEST_ACTION_SUCCESS,
                    result: expectedResult,
                    source: action,
                });
            }, done);
        });

        $store.next(action);
    });
});

// describe('test error', function () {
//     it('should emit a success action', function (done) {

//         const action = {
//             type: TEST_ACTION,
//             path: '/404',
//             param: 123,
//         };

//         const expectedResult = { data: 456 };

//         const successMock = action => Promise.resolve(expectedResult);

//         const $store = new Subject();
//         const $actions = new ActionsObservable($store);

//         const epic = buildEpic(TEST_ACTION);

//         const $results = epic($actions);

//         $store.subscribe(data => console.log(data));
//         $results.subscribe((data) => {
//             async(() => {
//                 expect(data).to.deep.equal({
//                     type: TEST_ACTION_SUCCESS,
//                     result: expectedResult,
//                     source: action,
//                 });
//             }, done);
//         });

//         $store.next(action);
//     });
// });
