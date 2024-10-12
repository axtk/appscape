/* eslint-disable @typescript-eslint/consistent-type-definitions */
import EventEmitter from 'node:events';
import type {ReqCtx} from './ReqCtx';

declare global {
    namespace Express {
        interface Request {
            ctx?: ReqCtx;
        }
        interface Application {
            events?: EventEmitter;
        }
    }
}
