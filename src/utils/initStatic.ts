import {Application, static as expressStatic} from 'express';
import {getEntries} from './getEntries';

export async function initStatic(app: Application) {
    app.use('/', expressStatic('public'));

    let entries = await getEntries();

    for (let entry of entries)
        app.use(`/${entry}`, expressStatic(`src/entries/${entry}/public`));

    return app;
}
