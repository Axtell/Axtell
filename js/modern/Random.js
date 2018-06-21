// This is pretty small so we'll just keep it in the bundle
import getRandomValuesPolyfill from 'polyfill-crypto.getrandomvalues';

export const DEFAULT_SIZE = 8;
export const crypto = window.crypto || window.msCrypto;

export default class Random {
    static ofDefault() {
        return Random.ofLength(DEFAULT_SIZE);
    }

    static ofLength(length) {
        // Generate random bytes
        const bytes = new Uint8Array(Math.ceil(length / 2));

        if (crypto) {
            crypto.getRandomValues(bytes);
        } else {
            getRandomValuesPolyfill(bytes);
        }

        let outStr = "";

        for (let i = 0; i < bytes.length; i++) {
            if (i === bytes.length - 1 && length % 2 === 1) {
                outStr += bytes[i].toString(0x10)[0];
                break;
            }

            if (bytes[i] <= 0xF) {
                outStr += '0';
            }
            outStr += bytes[i].toString(0x10);
        }

        return outStr;
    }
}
