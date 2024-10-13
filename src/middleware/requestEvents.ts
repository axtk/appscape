import type {Middleware} from '../types/Middleware';
import {emitLog} from '../utils/emitLog';
import {getStatusMessage} from '../utils/getStatusMessage';

export const requestEvents: Middleware = () => (req, res, next) => {
    let finished = false;

    res.on('finish', () => {
        finished = true;

        emitLog(req.app, getStatusMessage('Finished', res.statusCode), {
            req,
            res,
        });
    });

    res.on('close', () => {
        if (!finished)
            emitLog(req.app, getStatusMessage('Closed', res.statusCode), {
                req,
                res,
            });
    });

    next();
};
