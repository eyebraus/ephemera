import { Task } from './types';

export class WorkBuilder<TProfileInstance extends NonNullable<unknown>> {
    tasks: Task<TProfileInstance>[];

    constructor() {
        this.tasks = [];
    }

    addTask(task: Task<TProfileInstance>): this {
        this.tasks.push(task);

        return this;
    }
}
