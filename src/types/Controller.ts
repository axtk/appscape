import type {RequestHandler} from 'express';

/** Defines a final request handler sending a response */
export type Controller<T = void> = (params: T) => RequestHandler;
