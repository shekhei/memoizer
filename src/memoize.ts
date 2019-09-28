import { UnaryFn } from "./common";

/**
 * 
 * @param f UnaryFn
 * @example
 * function sqrt(a) { return Math.sqrt(a); }
 * const memoizedSqrt = memoize(sqrt);
 * memorizedSqrt(4) // 2
 */
export function memoize<I, O>(f: UnaryFn<I, O>): UnaryFn<I, O> {
	const memo = new Map<I, O>();
	return (i: I) => {
		if (memo.has(i)) {
			return memo.get(i) as O;
		}
		const result = f(i);
		memo.set(i, result);
		return result;
	};
}