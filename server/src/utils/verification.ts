
import crypto from "crypto";

export const generateVerificationCode = (): string => {
    return crypto.randomInt(100000, 1000000).toString();
};

export const hashVerificationCode = (code: string): string => {
    return crypto
        .createHash("sha256")
        .update(code)
        .digest("hex");
};

export const verifyCodeHash = (
    code: string,
    storedHash: string
): boolean => {
    const inputHash = Buffer.from(hashVerificationCode(code), "hex");
    const savedHash = Buffer.from(storedHash, "hex");

    if (inputHash.length !== savedHash.length) {
        return false;
    }

    return crypto.timingSafeEqual(inputHash, savedHash);
};
