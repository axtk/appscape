import {existsSync, lstatSync, readdirSync} from 'node:fs';
import {copyFile, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
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

let entries = readdirSync(join(cwd, 'src/entries'))
    .filter(name => lstatSync(join(cwd, 'src/entries', name)).isDirectory());

function getFirstAvailable(dirPath: string, name: string | string[]) {
    let names = Array.isArray(name) ? name : [name];

    for (let fileName of names) {
        for (let ext of entryExtensions) {
            let path = join(cwd, dirPath, `${fileName}.${ext}`);

            if (existsSync(path))
                return path;
        }
    }
}

function getClientEntryPoints() {
    return entries.reduce<EntryPoint[]>((entryPoints, entryName) => {
        let path = getFirstAvailable(`src/entries/${entryName}`, [
            'index',
            'client',
            'csr',
            'client/index',
            'csr/index',
        ]);

        if (path)
            entryPoints.push({in: path, out: entryName});

        return entryPoints;
    }, []);
}

function getServerEntryPoints() {
    return entries.reduce<EntryPoint[]>((entryPoints, entryName) => {
        let path = getFirstAvailable(`src/entries/${entryName}`, [
            'server',
            'ssr',
            'server/index',
            'ssr/index',
        ]);

        if (path)
            entryPoints.push({in: path, out: entryName});

        return entryPoints;
    }, []);
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
    await Promise.all([
        rm('res/-', {force: true, recursive: true}),
        rm('dist/server', {force: true, recursive: true}),
        rm('dist/entries', {force: true, recursive: true}),
    ]);
}

async function buildServer() {
    await esbuild.build({
        entryPoints: ['src/server/app.ts'],
        bundle: true,
        outdir: 'dist/server',
        platform: 'node',
        legalComments: dev ? undefined : 'none',
        ...commonBuildOptions,
    });
}

async function buildClient() {
    await esbuild.build({
        entryPoints: getClientEntryPoints(),
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
    await esbuild.build({
        entryPoints: getServerEntryPoints(),
        bundle: true,
        outdir: 'dist/entries',
        platform: 'node',
        legalComments: dev ? undefined : 'none',
        ...commonBuildOptions,
    });

    if (!existsSync('res/-'))
        await mkdir('res/-');

    await Promise.all(
        readdirSync('dist/entries')
            .filter(name => name.endsWith('.css'))
            .map(name => copyFile(`dist/entries/${name}`, `res/-/${name}`)),
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
    let publicEntries = entries.filter(name => !name.startsWith('_'));

    let nextContents = '// Generated automatically during the build phase\n' +
        `${publicEntries.map(toEntryImport).join('\n')}\n\n` +
        `export const routers = [\n${publicEntries.map(toEntryExportItem).join('\n')}\n];\n`;

    if (nextContents === contents)
        return;

    return writeFile(indexPath, nextContents);
}

export async function build() {
    let startTime = Date.now();

    console.log('Build started');

    await setup();
    await buildEntryIndex();
    await buildServerCSS();
    await Promise.all([
        buildServer(),
        buildClient(),
    ]);

    console.log(`Build completed (build time: ${formatDuration(Date.now() - startTime)})`);
}
