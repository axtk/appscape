import {readFile} from 'node:fs/promises';
import {basename, extname} from 'node:path';
import type {Controller} from '../types/Controller';
import type {TransformContent} from '../types/TransformContent';
import {getFilePath, GetFilePathParams} from '../utils/getFilePath';
import {emitLog} from '../utils/emitLog';

type ZeroTransform = false | null | undefined;

export type DirParams = Partial<
    Pick<GetFilePathParams, 'name' | 'ext' | 'supportedLocales'>
> & {
    path: string;
    index?: string;
    transform?: TransformContent | ZeroTransform | (TransformContent | ZeroTransform)[];
    supportedLocales?: string[];
};

/**
 * Serves files from the specified directory path in a locale-aware
 * fashion after applying optional transforms.
 *
 * A file ending with `.<lang>.<ext>` is picked first if the `<lang>`
 * part matches `req.ctx.lang`. If the `supportedLocales` array is
 * provided, the `*.<lang>.<ext>` file is picked only if the given
 * array contains `req.ctx.lang`. Otherwise, a file without the locale
 * in its path (`*.<ext>`) is picked.
 */
export const dir: Controller<DirParams> = ({
    path,
    name,
    index,
    ext = ['html', 'htm'],
    transform,
    supportedLocales,
}) => {
    if (typeof path !== 'string')
        throw new Error(`'path' is not a string`);

    let transformSet = (Array.isArray(transform) ? transform : [transform])
        .filter(item => typeof item === 'function');

    return async (req, res) => {
        let fileName = (name ?? req.params.name) || index;

        emitLog(req.app, `Name: ${JSON.stringify(fileName)}`, {
            req,
            res,
        });

        if (!fileName) {
            res.status(404).send(
                await req.app.renderStatus?.(req, res),
            );

            return;
        }

        let filePath = await getFilePath({
            name: fileName,
            dir: path,
            ext,
            supportedLocales,
            lang: req.ctx?.lang,
        });

        emitLog(req.app, `Path: ${JSON.stringify(filePath)}`, {
            req,
            res,
        });

        if (!filePath) {
            res.status(404).send(
                await req.app.renderStatus?.(req, res),
            );

            return;
        }

        let content = (await readFile(filePath)).toString();

        for (let transformItem of transformSet)
            content = await transformItem(req, res, {
                content,
                path: filePath,
                name: basename(filePath, extname(filePath)),
            });

        let nonce = req.ctx?.nonce;

        if (nonce)
            content = content.replace(/\{\{nonce\}\}/g, nonce);

        res.send(content);
    };
};
