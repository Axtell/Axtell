const Generator = Object.getPrototypeOf(function*(){});

Object.defineProperty(Generator.prototype, 'map', {
    value: function*(predicate) {
        let index = 0;
        for (const item of this) {
            yield predicate(item, index++);
        }
    }
});

Object.defineProperty(Generator.prototype, 'filter', {
    value: function*(predicate) {
        let index = 0;
        for (const item of this) {
            if (predicate(item, index++)) {
                yield item;
            }
        }
    }
});

Object.defineProperty(Generator.prototype, 'take', {
    value: function*(count) {
        for (let i = 0; i < count; i++) {
            const { value, done } = this.next();
            if (done === true) break;
            else yield value;
        }
    }
});
