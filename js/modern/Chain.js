export default function Chain(funcs) {
    return (...args) => {
        let value;

        for (let i = 0; i < funcs.length; i++) {
            value = funcs[i](...args);
        }

        return value;
    };
}
