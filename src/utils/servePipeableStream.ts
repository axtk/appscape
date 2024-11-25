import {Request, Response} from 'express';
import {emitLog} from './emitLog';
import {getStatusMessage} from './getStatusMessage';

type PipeableStream = {
    pipe: <Writable extends NodeJS.WritableStream>(destination: Writable) => Writable;
};

export function servePipeableStream(req: Request, res: Response) {
    return async ({pipe}: PipeableStream, error?: unknown) => {
        let statusCode = error ? 500 : 200;

        emitLog(req.app, getStatusMessage('Stream', statusCode), {
            level: error ? 'error' : undefined,
            req,
            res,
            data: error,
        });

        res.status(statusCode);

        if (statusCode >= 400) {
            res.send(await req.app.renderStatus?.(req, res));
            return;
        }

        res.set('Content-Type', 'text/html');
        pipe(res);
    };
}
