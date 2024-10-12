import {STATUS_CODES} from 'node:http';
import {Request, Response} from 'express';

export function renderStatus(req: Request, {statusCode}: Response) {
    let content = `<h1>${statusCode} ${STATUS_CODES[statusCode]}</h1>`;
    let id = req.ctx?.id;

    if (id)
        content += `\n<pre>ID: ${id}</pre>`;

    return content;
}
