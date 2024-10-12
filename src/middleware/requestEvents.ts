import type {Middleware} from '../types/Middleware';
import {emitLog} from '../utils/emitLog';

export const requestEvents: Middleware = () => (req, res, next) => {
    res.on('finish', () => {
        emitLog(req.app, `[${res.statusCode}] Finished`, {
            req,
            res,
        });
    });

    res.on('close', () => {
        emitLog(req.app, `[${res.statusCode}] Closed`, {
            req,
            res,
        });
    });

    next();
};
