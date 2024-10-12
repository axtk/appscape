#!/usr/bin/env node
import {rm} from 'node:fs/promises';
import {build} from './build';

async function clean() {
    return rm('dist', {recursive: true, force: true});
}

async function run() {
    let args = process.argv.slice(2);

    for (let arg of args) {
        switch (arg) {
            case '--build':
                await build();
                break;
            case '--clean':
                await clean();
                break;
        }
    }
}

(async () => {
    await run();
})();
