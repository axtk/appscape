import {IncomingMessage} from 'node:http';
import type {Request} from 'express';

export const cspNonce = (req: IncomingMessage) => {
    return `'nonce-${(req as Request).ctx?.nonce}'`;
}
