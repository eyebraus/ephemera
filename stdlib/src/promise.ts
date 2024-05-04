export const all = async <TAwaited>(...prosures: (() => Promise<TAwaited>)[]): Promise<TAwaited[]> =>
    await Promise.all(prosures.map((prosure) => prosure()));
