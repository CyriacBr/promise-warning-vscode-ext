import { getBar } from './sample2';

function wait(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

async function getFoo() {
    await wait(1000);
    return 'foo';
}

async function main() {
    let foo = await getFoo();
    let foops = await getFoo();

    let foo2 = null;
    //@promise-warning-ignore
    foo2 = getFoo();

    let foo3 = (async () => getFoo())();
}