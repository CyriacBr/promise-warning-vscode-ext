"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getBar() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('bar');
        }, 1000);
    });
}
exports.getBar = getBar;
//# sourceMappingURL=sample2.js.map