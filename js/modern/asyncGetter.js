export function asyncGetter(target, name, descriptor) {
    let getter = descriptor.get, storedValue;
    descriptor.get = function() {
        if (storedValue) return Promise.resolve(storedValue);
        return new Promise((resolve, reject) => {
            getter().then((value) => {
                storedValue = value;
                resolve(value);
            }).catch(reject);
        });
    };
}
