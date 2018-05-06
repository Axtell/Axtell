import crypto from 'crypto';

export const DEFAULT_SIZE = 8;

export default class HexBytes {
    static ofDefault() {
        return HexBytes.ofLength(DEFAULT_SIZE);
    }

    static ofLength(length) {
        return crypto.randomBytes(length >> 1).toString('hex');
    }
}
