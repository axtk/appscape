import type {Controller} from '../types/Controller';
import {emitLog} from '../utils/emitLog';

export const unhandledRoute: Controller = () => (req, res) => {
    emitLog(req.app, 'Unhandled route', {
        level: 'debug',
        req,
        res,
    });

    res.status(404).send(
        req.app.renderStatus?.(404, 'unhandled_route'),
    );
};
