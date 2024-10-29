/* eslint-disable @typescript-eslint/consistent-type-definitions */
import EventEmitter from 'node:events';
import type {RenderStatus} from '../types/RenderStatus';
import type {ReqCtx} from './ReqCtx';

declare global {
    namespace Express {
        interface Request {
            ctx?: ReqCtx;
        }
        interface Application {
            events?: EventEmitter;
            renderStatus?: RenderStatus;
        }
    }
}
