import type {ErrorController} from '../types/ErrorController';
import {emitLog} from '../utils/emitLog';

export const unhandledError: ErrorController = () => async (err, req, res) => {
    emitLog(req.app, 'Unhandled error', {
        level: 'error',
        data: err,
        req,
        res,
    });

    res.status(500).send(
        await req.app.renderStatus?.(req, res, 'unhandled_error'),
    );
};
