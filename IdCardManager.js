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

    version_mismatch: {
        [LANGUAGE_ET]:
            "Allkirjastamise tarkvara ja brauseri laienduse versioonid ei ühti. Palun uuendage oma id-kaardi tarkvara.",
        [LANGUAGE_EN]:
            "The versions of the signing software and browser extension do not match." +
            " Please update your ID card software.",
        [LANGUAGE_LT]:
            "Parakstīšanas programmas un pārlūka paplašinājuma versijas nesakrīt. Lūdzu, " +
            "atjauniniet savu ID kartes programmatūru.",
        [LANGUAGE_RU]:
            "Версии программы для подписания и расширения браузера не совпадают. Пожалуйста, " +
            "обновите программное обеспечение для вашей идентификационной карты.",
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

        // filled after a successful getCertificate() call
        this.certificate = null;
        this.supportedSignatureAlgorithms = null;

        // filled after a successful sign() call
        this.signatureAlgorithm = null;
    }

    initializeIdCard() {
        /**
         * Use the first available global backend in the order of preference:
         *
         * 1. web-eid
         * 2. hwcrypto
         *
         * The backend should be included in the page and should expose a global object.
         *
         * - hwcrypto.js - does it out of the box
         * - web-eid.js - one needs to include the dist/iife build, see
         *    https://github.com/web-eid/web-eid.js#without-a-module-system
         */
        return new Promise(function (resolve, reject) {
            if (typeof window.webeid !== "undefined") {
                resolve("web-eid");
            } else if (typeof window.hwcrypto !== "undefined" && window.hwcrypto.use("auto")) {
                resolve("hwcrypto");
            } else {
                reject("Backend selection failed");
            }
        });
    }

    /**
     * Requests the Web-eID browser extension to retrieve the signing certificate of the user with the
     * selected language. The certificate must be sent to the back end for preparing the
     * digital signature container and passed to sign() as the first parameter (hence why we also cache it
     * on the instance).
     *
     * see more - https://github.com/web-eid/web-eid.js#get-signing-certificate
     *
     * Note: SupportedSignatureAlgorithms are available on the instance after the promise resolves.
     *
     * @returns {Promise<String>}
     */
    getCertificate() {
        return new Promise((resolve, reject) => {
            const options = { lang: this.language };

            window.webeid.getSigningCertificate(options).then(
                ({ certificate, supportedSignatureAlgorithms }) => {
                    this.certificate = certificate;
                    this.supportedSignatureAlgorithms = supportedSignatureAlgorithms;

                    resolve(certificate);
                },
                (err) => {
                    reject(err);
                },
            );
        });
    }

    /**
     * Requests the Web-eID browser extension to sign a document hash. The certificate must be retrieved
     * using getCertificate method above (getSigningCertificate in web-eid) and the hash must be retrieved
     * from the back end creating the container and its nested XML signatures.
     *
     * Returns a LibrarySignResponse object:
     *
     * interface LibrarySignResponse {
     *   // Signature algorithm
     *   signatureAlgorithm: SignatureAlgorithm;
     *
     *   // The base64-encoded signature
     *   signature: string;
     * }
     *
     * The known valid hashFunction values are:
     * SHA-224, SHA-256, SHA-384, SHA-512, SHA3-224, SHA3-256, SHA3-384 and SHA3-512.
     *
     * see more - https://github.com/web-eid/web-eid.js#get-signing-certificate
     *
     * @param data - base64 encoded hash of the data to be signed
     * @param hashFunction - one of the supported hash functions. Defaults to SHA-256.
     * @returns {Promise<String>}
     */
    signHexData(data, hashFunction = "SHA-256") {
        return new Promise((resolve, reject) => {
            const options = { lang: this.language };

            window.webeid.sign(this.certificate, data, hashFunction, options).then(
                (signResponse) => {
                    this.signatureAlgorithm = signResponse.signatureAlgorithm;
                    resolve(signResponse.signature);
                },
                (err) => {
                    reject(err);
                },
            );
        });
    }

    /**
     * Requests the Web-eID browser extension to authenticate the user. The nonce must be recently retrieved
     *  from the back end. The result contains the Web eID authentication token that must be sent to the
     *  back end for validation.
     *
     * @param {string} nonce - base64 encoded nonce, generated by the back end, at least 256 bits of entropy
     * @param {object} options
     * @param {string} options.lang - ISO 639-1 two-letter language code to specify the Web-eID native application's user interface language
     * @param {number} options.timeout - user interaction timeout in milliseconds. Default: 120000 (2 minutes)
     * @returns {Promise<LibraryAuthenticateResponse>}
     *
     * Ref: https://github.com/web-eid/web-eid.js#authenticate-result
     *
     * interface LibraryAuthenticateResponse {
     *     // base64-encoded DER encoded authentication certificate of the user
     *     unverifiedCertificate: string;
     *
     *     // algorithm used to produce the authentication signature
     *     algorithm:
     *         | "ES256" | "ES384" | "ES512"  // ECDSA
     *         | "PS256" | "PS384" | "PS512"  // RSASSA-PSS
     *         | "RS256" | "RS384" | "RS512"; // RSASSA-PKCS1-v1_5
     *
     *     // base64-encoded signature of the token
     *     signature: string;
     *
     *     // type identifier and version of the token format separated by a colon character.
     *     //  example "web-eid:1.0"
     *     format: string
     *
     *     // URL identifying the name and version of the application that issued the token
     *     //  example "https://web-eid.eu/web-eid-app/releases/2.0.0+0"
     *     appVersion: string;
     */
    authenticate(nonce, options) {
        const authOptions = { lang: this.language, ...options };

        return new Promise((resolve, reject) => {
            return window.webeid.authenticate(nonce, authOptions).then(
                (authResponse) => {
                    resolve(authResponse);
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

    getWebeidErrorMapping(error) {
        // ref: https://github.com/web-eid/web-eid.js#error-codes
        const errorCode = (error ? error.code : null) || null;

        switch (errorCode) {
            case "ERR_WEBEID_CONTEXT_INSECURE":
                return "not_allowed";

            case "ERR_WEBEID_ACTION_TIMEOUT":
                return "technical_error";

            case "ERR_WEBEID_USER_CANCELLED":
            case "ERR_WEBEID_USER_TIMEOUT":
                return "user_cancel";

            case "ERR_WEBEID_VERSION_MISMATCH":
            case "ERR_WEBEID_VERSION_INVALID":
                return "version_mismatch";

            case "ERR_WEBEID_EXTENSION_UNAVAILABLE":
            case "ERR_WEBEID_NATIVE_UNAVAILABLE":
                return "no_implementation";

            case "ERR_WEBEID_NATIVE_FATAL": {
                if (error.message.includes("https")) {
                    return "not_allowed";
                }

                return "technical_error";
            }

            default:
            case "ERR_WEBEID_UNKNOWN_ERROR":
            case "ERR_WEBEID_NATIVE_INVALID_ARGUMENT":
            case "ERR_WEBEID_ACTION_PENDING":
            case "ERR_WEBEID_MISSING_PARAMETER":
                return "technical_error";
        }
    }

    /* Errors */
    getError(err) {
        let errorCode;

        if (typeof errorMessages[err] === "undefined") {
            errorCode = this.getWebeidErrorMapping(err) || "technical_error";
        } else {
            errorCode = err;
        }

        return { error_code: errorCode, message: errorMessages[errorCode][this.language], raw: err };
    }
}

export default IdCardManager;
