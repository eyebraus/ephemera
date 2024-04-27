import { all, isArray, isObject } from '@ephemera/stdlib';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { parse } from 'yaml';
import { Configuration } from './types';

const merge = (first: Configuration, second: Configuration): Configuration => {
    const result: Configuration = { ...first };

    Object.keys(second).forEach((key) => {
        const firstValue = first[key];
        const secondValue = second[key];

        // Both values are arrays: concatenate
        if (isArray(firstValue) && isArray(secondValue)) {
            result[key] = [...firstValue, ...secondValue];
            return;
        }

        // Both values are objects: recursively merge
        if (isObject(firstValue) && isObject(secondValue)) {
            result[key] = merge(firstValue, secondValue);
            return;
        }

        // Otherwise: overwrite
        result[key] = secondValue;
    });

    return result;
};

export const build = async (builder: ConfigurationBuilder): Promise<Configuration> => {
    const configurations = await all(...builder.configurers);

    return configurations.reduce((source, target) => merge(source, target), {});
};

export class ConfigurationBuilder {
    configurers: (() => Promise<Configuration>)[];

    constructor() {
        this.configurers = [];
    }

    addYamlFile(path: string): this {
        this.configurers.push(async () => {
            const fullPath = resolve(path);
            const contents = await readFile(fullPath, { encoding: 'utf-8' });

            return parse(contents) as Configuration;
        });

        return this;
    }
}
