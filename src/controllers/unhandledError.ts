import type {ErrorController} from '../types/ErrorController';
import {emitLog} from '../utils/emitLog';

export const unhandledError: ErrorController = () => (err, req, res) => {
    emitLog(req.app, 'Unhandled error', {
        level: 'error',
        data: err,
        req,
        res,
    });

    res.status(500).send('Internal server error');
};
