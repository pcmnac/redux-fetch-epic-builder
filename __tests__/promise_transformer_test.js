import { Subject } from 'rxjs';
import { ActionsObservable } from 'redux-observable';
import { expect } from 'chai';
import { createBuilder, successType, errorType } from '../src';
import { async } from './utils';

const transformer = action => {
    return Promise.resolve({
        ...action,
        transformed: true,
    });
}

const buildEpic = createBuilder({
    useMocks: true,
    successTransformer: transformer,
    errorTransformer: transformer,
});

const TEST_ACTION = 'TEST_ACTION';
const TEST_ACTION_SUCCESS = successType(TEST_ACTION);
const TEST_ACTION_ERROR = errorType(TEST_ACTION);

describe('test success with promise transformer', function () {
    it('should emit a success action transformed', function (done) {

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

        $results.subscribe((data) => {
            async(() => {
                expect(data).to.deep.equal({
                    type: TEST_ACTION_SUCCESS,
                    result: expectedResult,
                    source: action,
                    transformed: true,
                });
            }, done);
        });

        $store.next(action);
    });
});
