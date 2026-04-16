import '@testing-library/jest-dom';

// Pointer Events API が JSDOM に無いため、ダミー実装を追加
const noop = () => {};

// 戻り値が必要な関数は false を返す
if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false;
}

// 副作用系は noop でOK
if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = noop;
}

if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = noop;
}

window.HTMLElement.prototype.scrollIntoView = function() {};
