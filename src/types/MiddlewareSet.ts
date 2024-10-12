import type {RequestHandler} from 'express';

export type MiddlewareSet<T = void> = (params: T) => RequestHandler[];
