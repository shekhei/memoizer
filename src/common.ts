export type Fn<I, O> = (...args: I[]) => O;
export type UnaryFn<I, O> = (arg: I) => O;
export type UnaryArrFn<I, O> = (arg: I[]) => O;
