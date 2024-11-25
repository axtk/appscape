import type {Request, Response} from 'express';

type SendParam = Parameters<Response['send']>[0];

export type RenderStatus = (
    req: Request,
    res: Response,
    payload?: unknown,
) => Promise<SendParam>;
