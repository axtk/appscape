import {STATUS_CODES} from 'node:http';
import {readFile} from 'node:fs/promises';
import type {Request, Response} from 'express';
import type {Controller} from '../types/Controller';
import {getFilePath} from '../utils/getFilePath';
import {emitLog} from '../utils/emitLog';

export type HTMLParams = {
    dir?: string;
    name?: string;
    transform?: (req: Request, res: Response, content: string) => string | Promise<string>;
    supportedLocales?: string[];
};

export const html: Controller<HTMLParams | void> = ({
    dir = '/dat/html',
    name,
    transform,
    supportedLocales,
} = {}) => {
    return async (req, res) => {
        let path = await getFilePath({
            name: name ?? req.params.name,
            dir,
            ext: 'html',
            supportedLocales,
            lang: req.ctx?.lang,
        });

        emitLog(req.app, `Path: ${path && `"${path}"`}`, {
            req,
            res,
        });

        if (!path) {
            res.status(404).send(STATUS_CODES[404]);
            return;
        }

        let content = (await readFile(path)).toString();

        if (transform)
            content = await transform(req, res, content);

        let nonce = req.ctx?.nonce;

        if (nonce)
            content = content.replace(/\{\{nonce\}\}/g, nonce);

        res.type('text/html').send(content);
    };
};
