import EventEmitter from 'node:events';
import express from 'express';
import {start} from '../middleware/start';
import {requestEvents} from '../middleware/requestEvents';
import {log} from '../lib/logger/log';
import {LogEventPayload} from '../types/LogEventPayload';
import {emitLog} from './emitLog';
import {renderStatus} from './renderStatus';

export function setup(init?: () => void | Promise<void>) {
    let app = express();

    if (!app.events)
        app.events = new EventEmitter();

    let host = process.env.APP_HOST || 'localhost';
    let port = Number(process.env.APP_PORT) || 80;

    let listen = () => {
        app.listen(port, host, () => {
            let location = `http://${host}:${port}/`;
            let env = `NODE_ENV=${process.env.NODE_ENV}`;

            emitLog(app, `Server running at '${location}' (${env})`);
        });
    };

    if (process.env.NODE_ENV === 'development')
        app.events?.on('log', ({message, ...payload}: LogEventPayload) => {
            log(message, payload);
        });

    if (!app.renderStatus)
        app.renderStatus = renderStatus;

    app.disable('x-powered-by');
    app.use(start());
    app.use(requestEvents());

    app.use('/', express.static('public'));

    let initOutput = typeof init === 'function' ? init() : null;

    if (initOutput instanceof Promise)
        initOutput.then(listen);
    else listen();

    return app;
}
