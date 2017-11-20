export default {
    silent(error, message, ...args) {
        console.error(`%cError:%c ${message}`, 'font-weight: 700', '', ...args);
    }
}
