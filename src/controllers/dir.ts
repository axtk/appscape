import {readFile} from 'node:fs/promises';
import type {Controller} from '../types/Controller';
import type {TransformContent} from '../types/TransformContent';
import {getFilePath, GetFilePathParams} from '../utils/getFilePath';
import {emitLog} from '../utils/emitLog';

type ZeroTransform = false | null | undefined;

export type DirParams = Partial<
    Pick<GetFilePathParams, 'name' | 'ext' | 'supportedLocales'>
> & {
    path: string;
    transform?: TransformContent | ZeroTransform | (TransformContent | ZeroTransform)[];
    supportedLocales?: string[];
};

export const dir: Controller<DirParams> = ({
    path,
    name,
    ext = ['html', 'htm'],
    transform,
    supportedLocales,
}) => {
    if (typeof path !== 'string')
        throw new Error(`'path' is not a string`);

    let transformSet = (Array.isArray(transform) ? transform : [transform])
        .filter(item => typeof item === 'function');

    return async (req, res) => {
        let filePath = await getFilePath({
            name: name ?? req.params.name,
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
            });

        let nonce = req.ctx?.nonce;

        if (nonce)
            content = content.replace(/\{\{nonce\}\}/g, nonce);

        res.send(content);
    };
};
