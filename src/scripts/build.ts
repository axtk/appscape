import {access, copyFile, lstat, mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import esbuild, {type BuildOptions} from 'esbuild';
import {formatDuration} from 'dtfm';

const entryExtensions = ['js', 'jsx', 'ts', 'tsx'];

const dev = process.env.NODE_ENV === 'development';
const cwd = process.cwd();

type EntryPoint = {
    in: string;
    out: string;
};

async function getEntries() {
    let list = await readdir(join(cwd, 'src/entries'));

    let dirs = await Promise.all(
        list.map(async name => {
            return await lstat(join(cwd, 'src/entries', name)) ? name : undefined;
        }),
    );

    return dirs.filter(dir => dir !== undefined);
}

async function getFirstAvailable(dirPath: string, name: string | string[]) {
    let names = Array.isArray(name) ? name : [name];

    for (let fileName of names) {
        for (let ext of entryExtensions) {
            let path = join(cwd, dirPath, `${fileName}.${ext}`);

            try {
                await access(path);
                return path;
            }
            catch {}
        }
    }
}

async function getEntryPoints(name: string | string[]): Promise<EntryPoint[]> {
    let entries = await getEntries();
    let buildEntries = await Promise.all(
        entries.map(async entry => {
            let path = await getFirstAvailable(`src/entries/${entry}`, name);
            return path ? [path, entry] : undefined;
        }),
    );

    return buildEntries
        .filter(item => item !== undefined)
        .map(([path, entry]) => ({in: path, out: entry}));
}

async function getClientEntryPoints() {
    return getEntryPoints([
        'index',
        'client',
        'csr',
        'client/index',
        'csr/index',
    ]);
}

async function getServerEntryPoints() {
    return getEntryPoints([
        'server',
        'ssr',
        'server/index',
        'ssr/index',
    ]);
}

const commonBuildOptions: Partial<BuildOptions> = {
    jsx: 'automatic',
    jsxDev: dev,
    loader: {
        '.png': 'dataurl',
        '.svg': 'dataurl',
        '.html': 'text',
        '.txt': 'text',
    },
};

async function setup() {
    let dirs = ['res/-', 'dist/server', 'dist/entries'];

    await Promise.all(
        dirs.map(dir => rm(dir, {force: true, recursive: true})),
    );
}

async function buildServer() {
    await esbuild.build({
        entryPoints: ['src/app/index.ts'],
        bundle: true,
        outdir: 'dist/app',
        platform: 'node',
        legalComments: dev ? undefined : 'none',
        ...commonBuildOptions,
    });
}

async function buildClient() {
    let entryPoints = await getClientEntryPoints();

    await esbuild.build({
        entryPoints,
        bundle: true,
        splitting: true,
        format: 'esm',
        outdir: 'res/-',
        minify: !dev,
        legalComments: dev ? undefined : 'none',
        ...commonBuildOptions,
    });
}

async function buildServerCSS() {
    let entryPoints = await getServerEntryPoints()

    await esbuild.build({
        entryPoints,
        bundle: true,
        outdir: 'dist/entries',
        platform: 'node',
        legalComments: dev ? undefined : 'none',
        ...commonBuildOptions,
    });

    let files = (await readdir('dist/entries'))
        .filter(name => name.endsWith('.css'));

    if (files.length === 0)
        return;

    try {
        await access('res/-');
    }
    catch {
        await mkdir('res/-');
    }

    await Promise.all(
        files.map(name => copyFile(`dist/entries/${name}`, `res/-/${name}`)),
    );
}

function toCamelCase(s: string) {
    return s
        .replace(/(^[\s_-]|[\s_-]$)/g, '')
        .replace(/[\s_-](\w)/g, (_, c) => c.toUpperCase());
}

function toEntryImport(name: string) {
    return `import {router as ${toCamelCase(name)}} from '~/src/entries/${name}/server';`;
}

function toEntryExportItem(name: string) {
    return `    ${toCamelCase(name)},`;
}

async function buildEntryIndex() {
    let indexPath = 'src/entries/index.ts';
    let contents = (await readFile(indexPath)).toString();

    let entries = await getEntries();
    let publicEntries = entries.filter(name => !name.startsWith('_'));

    let nextContents = '// Generated automatically during the build phase\n' +
        `${publicEntries.map(toEntryImport).join('\n')}\n\n` +
        `export const routers = [\n${publicEntries.map(toEntryExportItem).join('\n')}\n];\n`;

    if (nextContents === contents)
        return;

    return writeFile(indexPath, nextContents);
}

export type BuildParams = {
    silent?: boolean;
};

export async function build({silent}: BuildParams | void = {}) {
    let log = silent ? (() => {}) : console.log;
    let startTime = Date.now();

    log('Build started');

    await setup();
    await buildEntryIndex();
    await buildServerCSS();
    await Promise.all([
        buildServer(),
        buildClient(),
    ]);

    log(`Build completed (build time: ${formatDuration(Date.now() - startTime)})`);
}
