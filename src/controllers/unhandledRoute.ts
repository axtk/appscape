import type {Controller} from '../types/Controller';
import {emitLog} from '../utils/emitLog';

export const unhandledRoute: Controller = () => async (req, res) => {
    emitLog(req.app, 'Unhandled route', {
        level: 'debug',
        req,
        res,
    });

    res.status(404).send(
        await req.app.renderStatus?.(req, res, 'unhandled_route'),
    );
};
