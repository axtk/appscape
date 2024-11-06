import type {Request} from 'express';

export const cspNonce = (req: Request) => `'nonce-${req.ctx?.nonce}'`;
