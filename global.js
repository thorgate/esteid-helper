import lib, { IdentificationManager, Languages, LegacyIdentificationManager } from "./lib.js";

const globalObject =
    typeof globalThis !== "undefined"
        ? globalThis
        : typeof self !== "undefined"
        ? self
        : typeof window !== "undefined"
        ? window
        : typeof global !== "undefined"
        ? global
        : {};

globalObject.Esteid = lib;

export { IdentificationManager, Languages, LegacyIdentificationManager };

export default lib;
