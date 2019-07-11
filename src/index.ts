class END { }
const endInstance = new END;

type Fn<I, O> = (...args: I[]) => O;
type UnaryFn<I, O> = (arg: I) => O;
type UnaryArrFn<I, O> = (arg: I[]) => O;

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

export function curryAndMemoize<I, O>(f: Fn<I, O>, depth: 0): UnaryFn<I, O>
export function curryAndMemoize<I, O>(f: Fn<I, O>, depth: number): UnaryFn<I, Fn<I, O>>

/**
 * 
 * @param f function to memoize and curried
 * @param n the number of times memoized and curried, normally equals to number of parameters
 * 
 * 
 * @example
 * const addition = (a, b) => a + b 
 */
export function curryAndMemoize<I, O>(f: Fn<I, O>, depth: number) {
	if (depth < 0 || isNaN(depth)) {
		throw new Error("depth must be a number and at least 0")
	}
	if (depth === 0) {
		return memoize(f);
	}
	const nextDepth = depth - 1;
	return memoize<I, UnaryFn<I, Fn<I, O>>>(x => curryAndMemoize<I, O>(f.bind(null, x), nextDepth));
}

/**
 * A helper function used by memoizeByKeys.
  */
function memoizeByKeysCurry<I, O>(f: Fn<I, O>, resultResolver: () => O, depth: number): any {
	const a = f;
	if (depth === 0) {
		return memoize(resultResolver);
	}
	return memoize((x: I) => memoizeByKeysCurry(a.bind(null, x), resultResolver, depth - 1));
}

interface IndexableType {
	[key: string]: any
}

/**
 * 
 * @param f function to be memoized
 * @param keys keys to be used for memoization
 * 
 * Memoize an unary function that accepts an indexable, basically a js object as input. 
 * You must specify the keys, comparision is shallow
 * 
 * If the memoized function is called with "undefined" or "null", it will memoize with
 * with a special "undefined" case
 * 
 * @example
 * const multiply = ({ a, b }) => a * b
 * const memoizedMultiply = memoizeByKeys(multiply, ["a", "b"])
 * memoizedMultiply({ a: 2, b: 3 }) // 6
 */
export function memoizeByKeys<I, O>(f: UnaryFn<IndexableType, O>, keys: string[]): UnaryFn<IndexableType, O> {
	let args: IndexableType;
	const g = memoizeByKeysCurry(f, () => f(args), keys.length - 1);
	return (a: IndexableType) => {
		if (!a) {
			let next = g;
			keys.forEach(() => {
				next = next(undefined);
			});
			return next;
		}
		args = a;
		let c = g;
		keys.forEach(k => {
			c = c(args[k]);
		})
		return c;
	}
}

function memoizedPartialApplyVarArgFn<I, O>(f: Fn<I, O>): UnaryFn<I | END, any> {
	const _fn = (x: END | I) => {
		if (x instanceof END) {
			return f();
		}
		return memoizedPartialApplyVarArgFn<I, O>(f.bind(null, x))
	}
	return memoize(_fn)
}

/**
 * 
 * @param f a single array as parameter function
 * 
 * @example
 * const multiply = numbers => numbers.reduce((result, num) => result * num)
 * const memoizedMultiply = memoizeArrayFn(multiply)
 * memoizedMultiply([2, 3, 4]) // 24
 */
export function memoizeArrayFn<I, O>(f: UnaryArrFn<I, O>): UnaryArrFn<I, O> {
	const memoized = memoizedPartialApplyVarArgFn((...args: I[]) => f(args));
	return vals => {
		let g = memoized;
		vals.forEach(v => {
			g = g(v);
		});
		return g(endInstance);
	}
}
