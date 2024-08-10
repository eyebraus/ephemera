/**
 * A {@link Promise} whose awaited result is deferred until the invocation of a function. Useful when trying to defer an
 * asynchronous procedure until later.
 */
export type Prosure<TAwaited> = () => Promise<TAwaited>;

/**
 * Awaits the result of multiple {@link Prosure}s in the manner of {@link Promise.all}.
 * @param prosures One or more {@link Prosure}s.
 * @returns An array containing the awaited results of all the given {@link Prosure}s.
 */
export const all = async <TAwaited>(...prosures: Prosure<TAwaited>[]): Promise<TAwaited[]> =>
    await Promise.all(prosures.map((prosure) => prosure()));
