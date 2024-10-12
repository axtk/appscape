import {randomBytes} from 'node:crypto';
import type {Middleware} from '../types/Middleware';
import {emitLog} from '../utils/emitLog';

export const start: Middleware = () => (req, res, next) => {
    req.ctx = {
        ...req.ctx,
        id: randomBytes(16).toString('hex'),
        nonce: randomBytes(8).toString('hex'),
        startTime: Date.now(),
    };

    emitLog(req.app, 'Started', {
        req,
        res,
    });

    next();
};
