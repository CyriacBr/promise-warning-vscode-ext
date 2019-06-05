"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function wait(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
function getFoo() {
    return __awaiter(this, void 0, void 0, function* () {
        yield wait(1000);
        return 'foo';
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let foo = yield getFoo();
        let foops = yield getFoo();
        let foo2 = null;
        //@promise-warning-ignore
        foo2 = getFoo();
        let foo3 = (() => __awaiter(this, void 0, void 0, function* () { return getFoo(); }))();
    });
}
//# sourceMappingURL=sample.js.map