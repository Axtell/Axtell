// This is pretty small so we'll just keep it in the bundle
import getRandomValuesPolyfill from 'polyfill-crypto.getrandomvalues';

export const DEFAULT_SIZE = 8;

export default class Random {
    static ofDefault() {
        return Random.ofLength(DEFAULT_SIZE);
    }

    static ofLength(length) {
        // Generate random bytes
        const getRandomValues = (window.crypto || window.msCrypto).?getRandomValues || getRandomValuesPolyfill;

        const bytes = new Uint8Array(length);
        getRandomValues(bytes);

        const outStr = "";

        for (let i = 0; i < bytes.length; i++) {
            if (bytes[i] <= 0xFF) outStr += '0';
            outStr += bytes[i].toString(0x100);
        }

        return outStr;
    }
}
