import {STATUS_CODES} from 'node:http';
import {RenderStatus} from '../types/RenderStatus';

export const renderStatus: RenderStatus = async (req, res) => {
    let {id, nonce} = req.ctx;
    let statusText = `${res.statusCode} ${STATUS_CODES[res.statusCode]}`;
    let date = (new Date())
        .toISOString()
        .replace(/T/, ' ')
        .replace(/Z$/, '') + ' UTC';

    return '<!DOCTYPE html>' +
        '<html><head><meta charset="utf-8"/>' +
        '<meta name="viewport" content="width=device-width"/>' +
        `<title>${statusText}</title>` +
        `<style${nonce ? ` nonce="${nonce}"` : ''}>` +
        'body{text-align:center;}</style></head>' +
        `<body><h1>${statusText}</h1><hr/><p>` +
        (id ? `<code>ID: ${id}</code><br/>` : '') +
        `<code>${date}</code></p></body></html>`;
}
