export const LANGUAGE_ET = "EST";
export const LANGUAGE_EN = "ENG";
export const LANGUAGE_RU = "RUS";
export const LANGUAGE_LT = "LIT";

const LANGUAGES = [LANGUAGE_ET, LANGUAGE_EN, LANGUAGE_RU, LANGUAGE_LT];

const errorMessages = {
    user_cancel: {
        [LANGUAGE_ET]: "Allkirjastamine katkestati",
        [LANGUAGE_EN]: "Signing was cancelled",
        [LANGUAGE_LT]: "Pasirašymas nutrauktas",
        [LANGUAGE_RU]: "Подпись была отменена",
    },

    no_certificates: {
        [LANGUAGE_ET]: "Sertifikaate ei leitud",
        [LANGUAGE_EN]: "Certificate not found",
        [LANGUAGE_LT]: "Nerastas sertifikatas",
        [LANGUAGE_RU]: "Сертификат не найден",
    },

    invalid_argument: {
        [LANGUAGE_ET]: "Vigane sertifikaadi identifikaator",
        [LANGUAGE_EN]: "Invalid certificate identifier",
        [LANGUAGE_LT]: "Neteisingas sertifikato identifikatorius",
        [LANGUAGE_RU]: "Неверный идентификатор сертификата",
    },

    no_implementation: {
        [LANGUAGE_ET]: "Vajalik tarkvara on puudu",
        [LANGUAGE_EN]: "Unable to find software",
        [LANGUAGE_LT]: "Nerasta programinės įranga",
        [LANGUAGE_RU]: "Отсутствует необходимое программное обеспечение",
    },

    technical_error: {
        [LANGUAGE_ET]: "Tehniline viga",
        [LANGUAGE_EN]: "Technical error",
        [LANGUAGE_LT]: "Techninė klaida",
        [LANGUAGE_RU]: "Техническая ошибка",
    },

    not_allowed: {
        [LANGUAGE_ET]: "Veebis allkirjastamise käivitamine on võimalik vaid https aadressilt",
        [LANGUAGE_EN]: "Web signing is allowed only from https:// URL",
        [LANGUAGE_LT]: "Web signing is allowed only from https:// URL",
        [LANGUAGE_RU]: "Подпись в интернете возможна только с URL-ов, начинающихся с https://",
    },
};

class IdCardManager {
    constructor(language) {
        this.language = language || LANGUAGE_ET;

        this.certificate = null;
    }

    initializeIdCard() {
        return new Promise(function (resolve, reject) {
            if (window.hwcrypto.use("auto")) {
                resolve();
            } else {
                reject("Backend selection failed");
            }
        });
    }

    /**
     * Calls `window.hwcrypto.getCertificate()` with the selected language.
     * Resolves to a HEX-encoded certificate. The certificate is to be embedded into the XML signature
     * that is generated on the backend.
     *
     * `hwcrypto.getCertificate()` resolves to a certificate object ("handle"):
     * {
     *      encoded: UInt8Array, raw certificate
     *      hex: String, HEX-encoded certificate
     * }
     *
     * The "handle" is to be used in the sign() call. So we also store it on the instance.
     *
     * https://github.com/hwcrypto/hwcrypto.js/wiki/APIv2#getcertificate
     *
     * @returns {Promise<String>}
     */
    getCertificate() {
        return new Promise((resolve, reject) => {
            const lParam = { lang: this.language };

            window.hwcrypto.getCertificate(lParam).then(
                (rCert) => {
                    this.certificate = rCert;
                    resolve(rCert.hex);
                },
                (err) => {
                    reject(err);
                },
            );
        });
    }

    /**
     * Calls `window.hwcrypto.sign()` over a HEX-encoded data
     * Resolves to a HEX-encoded signature which is to be embedded into the XML signature
     * that is generated on the backend.
     *
     * Signing is performed using the certificate "handle" obtained by `getCertificate()`.
     *
     * `hwcrypto.sign()` resolves to a signature object:
     * {
     *      value: Uint8Array, raw signature;
     *      hex: String, HEX-encoded signature
     * }
     *
     * https://github.com/hwcrypto/hwcrypto.js/wiki/APIv2#sign
     *
     * @param hexData
     * @returns {Promise<String>}
     */
    signHexData(hexData) {
        return new Promise((resolve, reject) => {
            const lParam = { lang: this.language };

            window.hwcrypto.sign(this.certificate, { type: "SHA-256", hex: hexData }, lParam).then(
                (signature) => {
                    resolve(signature.hex);
                },
                (err) => {
                    reject(err);
                },
            );
        });
    }

    /* Language */

    get language() {
        return this._language;
    }

    set language(l) {
        if (LANGUAGES.indexOf(l) !== -1) {
            this._language = l;
        }
    }

    /* Errors */
    getError(err) {
        if (typeof errorMessages[err] === "undefined") {
            err = "technical_error";
        }

        return { error_code: err, message: errorMessages[err][this.language] };
    }
}

export default IdCardManager;
