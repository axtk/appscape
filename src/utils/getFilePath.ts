import {join} from 'node:path';
import {access} from 'node:fs/promises';
import {toLanguage} from '../lib/lang/toLanguage';

export type GetFilePathParams = {
    name: string;
    dir?: string;
    lang?: string;
    supportedLocales?: string[];
    ext?: string;
};

export async function getFilePath({
    name,
    dir = '.',
    lang,
    supportedLocales = [],
    ext = '',
}: GetFilePathParams) {
    let cwd = process.cwd();

    let localeSet = new Set(supportedLocales);
    let langSet = new Set(supportedLocales.map(toLanguage));

    let names = new Set(
        lang && (!supportedLocales.length || localeSet.has(lang) || langSet.has(lang)) 
            ? [`${name}.${lang}`, `${name}.${toLanguage(lang)}`, name, `${name}.en`]
            : [name, ...[...localeSet, ...langSet].map(item => `${name}.${item}`)],
    );

    for (let item of names) {
        let path = join(cwd, dir, ext ? `${item}.${ext}` : item);

        try {
            await access(path);
            return path;
        }
        catch {}
    }
}
