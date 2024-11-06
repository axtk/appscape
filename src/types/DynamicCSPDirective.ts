import {IncomingMessage, ServerResponse} from 'node:http';

export type DynamicCSPDirective = (req: IncomingMessage, res: ServerResponse) => string;
