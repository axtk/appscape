import express from 'express';
import EventEmitter from 'node:events';
import {join} from 'node:path';
import {start} from '../middleware/start';
import {emitLog} from '../utils/emitLog';
import {log} from '../lib/logger/log';
import {LogEventPayload} from '../types/LogEventPayload';

export function setup() {
    let app = express();

    let host = process.env.APP_HOST || 'localhost';
    let port = Number(process.env.APP_PORT) || 80;

    let eventEmitter = new EventEmitter();

    if (process.env.NODE_ENV === 'development')
        eventEmitter.on('log', ({message, ...payload}: LogEventPayload) => {
            log(message, payload);
        });

    if (!app.events)
        app.events = eventEmitter;

    app.disable('x-powered-by');

    app.use(start());
    app.use(express.static(join(process.cwd(), './res')));

    app.listen(port, host, () => {
        let location = `http://${host}:${port}/`;
        let env = `NODE_ENV=${process.env.NODE_ENV}`;

        emitLog(app, `Server running on '${location}' (${env})`);
    });

    return app;
}
