import express from 'express';
import {join} from 'node:path';
import {start} from '../middleware/start';
import {requestEvents} from '../middleware/requestEvents';
import {log} from '../lib/logger/log';
import {LogEventPayload} from '../types/LogEventPayload';
import {init} from './init';
import {emitLog} from './emitLog';
import {renderStatus} from './renderStatus';

export function setup() {
    let app = init(express());

    let host = process.env.APP_HOST || 'localhost';
    let port = Number(process.env.APP_PORT) || 80;

    if (process.env.NODE_ENV === 'development')
        app.events?.on('log', ({message, ...payload}: LogEventPayload) => {
            log(message, payload);
        });

    if (!app.renderStatus)
        app.renderStatus = renderStatus;

    app.disable('x-powered-by');
    app.use(start());
    app.use(requestEvents());
    app.use(express.static(join(process.cwd(), './res')));

    app.listen(port, host, () => {
        let location = `http://${host}:${port}/`;
        let env = `NODE_ENV=${process.env.NODE_ENV}`;

        emitLog(app, `Server running on '${location}' (${env})`);
    });

    return app;
}
