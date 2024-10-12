import {STATUS_CODES} from 'node:http';
import type {Middleware} from '../types/Middleware';
import {emitLog} from '../utils/emitLog';

function getStatusMessage(statusCode: number) {
    return `[${statusCode}] ${STATUS_CODES[statusCode]}`;
}

export const requestEvents: Middleware = () => (req, res, next) => {
    let finished = false;

    res.on('finish', () => {
        finished = true;

        emitLog(req.app, getStatusMessage(res.statusCode), {
            req,
            res,
        });
    });

    res.on('close', () => {
        if (!finished)
            emitLog(req.app, `${getStatusMessage(res.statusCode)} (closed)`, {
                req,
                res,
            });
    });

    next();
};
