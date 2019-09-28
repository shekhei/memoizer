import { memoize } from "../src/memoize";
import { expect } from "chai"

describe('memoize', function () {
    it('simple fn', function () {
        const record: number[] = []
        const origFn = (i: number) => i+1
        const fn = memoize((i: number) => {
            if (record[i] === undefined) {
                record[i] = 0
            }
            record[i]++;
            return origFn(i)
        })
        for ( let i = 0; i < 1000; i++ ) {
            for ( let j = 0; j < 20; j++ ) {
                expect(fn(i)).eq(origFn(i))
            }
        }
        expect(record).to.have.lengthOf(1000)
        record.forEach(value => expect(value).eq(1));
    });
});