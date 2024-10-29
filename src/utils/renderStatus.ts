import {STATUS_CODES} from 'node:http';
import {RenderStatus} from '../types/RenderStatus';

export const renderStatus: RenderStatus = ({ctx = {}}, {statusCode}) => {
    let {id, nonce} = ctx;
    let statusText = `${statusCode} ${STATUS_CODES[statusCode]}`;
    let date = (new Date())
        .toISOString()
        .replace(/T/, ' ')
        .replace(/Z$/, '') + ' UTC';

    return '<!DOCTYPE html>' +
        '<html><head><meta charset="utf-8"/>' +
        '<meta name="viewport" content="width=device-width"/>' +
        `<title>${statusText}</title>` +
        `<style${nonce ? ` nonce="${nonce}"` : ''}>` +
        'main{text-align:center;}</style>' +
        `<body><main><h1>${statusText}</h1><hr/><p>` +
        (id ? `<code>ID: ${id}</code><br/>` : '') +
        `<code>${date}</code>` +
        '</p></main></body></html>';
}
