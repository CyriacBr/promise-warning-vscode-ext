export function getBar() {
    return new Promise<'bar'>((resolve, reject) => {
        setTimeout(() => {
            resolve('bar');
        }, 1000);
    });
}