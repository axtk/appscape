import EventEmitter from 'node:events';
import type {Application} from 'express';

export function init(app: Application) {
    if (!app.events)
        app.events = new EventEmitter();

    return app;
}
