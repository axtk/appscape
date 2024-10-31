import {readFile} from 'node:fs/promises';
import type {Controller} from '../types/Controller';
import type {TransformContent} from '../types/TransformContent';
import {getFilePath, GetFilePathParams} from '../utils/getFilePath';
import {emitLog} from '../utils/emitLog';

export type HTMLParams = Partial<
    Pick<GetFilePathParams, 'dir' | 'name' | 'ext' | 'supportedLocales'>
> & {
    transform?: TransformContent | TransformContent[] | boolean | null | undefined;
    supportedLocales?: string[];
};

export const html: Controller<HTMLParams | void> = ({
    dir = '/dat/html',
    name,
    ext = ['html', 'htm'],
    transform,
    supportedLocales,
} = {}) => {
    let transformSet = (Array.isArray(transform) ? transform : [transform])
        .filter(item => typeof item === 'function');

    return async (req, res) => {
        let path = await getFilePath({
            name: name ?? req.params.name,
            dir,
            ext,
            supportedLocales,
            lang: req.ctx?.lang,
        });

        emitLog(req.app, `Path: ${path && `"${path}"`}`, {
            req,
            res,
        });

        if (!path) {
            res.status(404).send(
                req.app.renderStatus?.(req, res),
            );

            return;
        }

        let content = (await readFile(path)).toString();

        for (let transformItem of transformSet)
            content = await transformItem(req, res, content);

        let nonce = req.ctx?.nonce;

        if (nonce)
            content = content.replace(/\{\{nonce\}\}/g, nonce);

        res.send(content);
    };
};
