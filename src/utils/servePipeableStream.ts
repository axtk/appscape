import {Request, Response} from 'express';
import type {PipeableStream} from 'react-dom/server';
import {emitLog} from './emitLog';
import {getStatusMessage} from './getStatusMessage';

export function servePipeableStream(req: Request, res: Response) {
    return ({pipe}: PipeableStream, error?: unknown) => {
        let statusCode = error ? 500 : 200;

        emitLog(req.app, getStatusMessage('Stream', statusCode), {
            req,
            level: error ? 'error' : undefined,
            data: error,
        });

        res.status(statusCode);

        if (statusCode >= 400) {
            res.send(req.app.renderStatus?.(req, res));
            return;
        }

        res.set('Content-Type', 'text/html');
        pipe(res);
    };
}
