import type {Middleware} from '../types/Middleware';
import {emitLog} from '../utils/emitLog';

export const requestEvents: Middleware = () => (req, res, next) => {
    let finished = false;

    res.on('finish', () => {
        finished = true;

        emitLog(req.app, `[${res.statusCode}] Finished`, {
            req,
            res,
        });
    });

    res.on('close', () => {
        if (!finished)
            emitLog(req.app, `[${res.statusCode}] Closed`, {
                req,
                res,
            });
    });

    next();
};
