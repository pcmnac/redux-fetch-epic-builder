import { expect } from 'chai';

export const async = (check, done) => {
    try {
        check();
        done();
    } catch (err) {
        done(err);
    }
}

describe('Boilerplate', function () {
    it('should do boilerplate things', function () {
        // TODO: test something now
        expect(true).to.equal(true);
    });
});