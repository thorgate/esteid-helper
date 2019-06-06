export const LANGUAGE_ET = 'EST';
export const LANGUAGE_EN = 'ENG';
export const LANGUAGE_RU = 'RUS';
export const LANGUAGE_LT = 'LIT';

const LANGUAGES = [
    LANGUAGE_ET,
    LANGUAGE_EN,
    LANGUAGE_RU,
    LANGUAGE_LT
];

let errorMessages = {
    user_cancel: {
        [LANGUAGE_ET]: 'Allkirjastamine katkestati',
        [LANGUAGE_EN]: 'Signing was cancelled',
        [LANGUAGE_LT]: 'Pasirašymas nutrauktas',
        [LANGUAGE_RU]: 'Подпись была отменена'
    },

    no_certificates: {
        [LANGUAGE_ET]: 'Sertifikaate ei leitud',
        [LANGUAGE_EN]: 'Certificate not found',
        [LANGUAGE_LT]: 'Nerastas sertifikatas',
        [LANGUAGE_RU]: 'Сертификат не найден'
    },

    invalid_argument: {
        [LANGUAGE_ET]: 'Vigane sertifikaadi identifikaator',
        [LANGUAGE_EN]: 'Invalid certificate identifier',
        [LANGUAGE_LT]: 'Neteisingas sertifikato identifikatorius',
        [LANGUAGE_RU]: 'Неверный идентификатор сертификата',
    },

    no_implementation: {
        [LANGUAGE_ET]: 'Vajalik tarkvara on puudu',
        [LANGUAGE_EN]: 'Unable to find software',
        [LANGUAGE_LT]: 'Nerasta programinės įranga',
        [LANGUAGE_RU]: 'Отсутствует необходимое программное обеспечение'
    },

    technical_error: {
        [LANGUAGE_ET]: 'Tehniline viga',
        [LANGUAGE_EN]: 'Technical error',
        [LANGUAGE_LT]: 'Techninė klaida',
        [LANGUAGE_RU]: 'Техническая ошибка'
    },

    not_allowed: {
        [LANGUAGE_ET]: 'Veebis allkirjastamise käivitamine on võimalik vaid https aadressilt',
        [LANGUAGE_EN]: 'Web signing is allowed only from https:// URL',
        [LANGUAGE_LT]: 'Web signing is allowed only from https:// URL',
        [LANGUAGE_RU]: 'Подпись в интернете возможна только с URL-ов, начинающихся с https://'
    },
};


class IdCardManager {
    constructor(language) {
        this.language = language || LANGUAGE_ET;

        this._cert = null;
    }

    initializeIdCard() {
        return new Promise(function (resolve, reject) {
            if (window.hwcrypto.use("auto")) {
                resolve();
            }

            else {
                reject("Backend selection failed");
            }
        });
    }

    getCertificate() {
        return new Promise((resolve, reject) => {
            let lParam = {lang: this.language};

            window.hwcrypto.getCertificate(lParam).then((rCert) => {
                this._cert = rCert;
                resolve();
            },

            (err) => {
                reject(err);
            });
        });
    }

    signHexData(hexData) {
        return new Promise((resolve, reject) => {
            let lParam = {lang: this.language};

            window.hwcrypto.sign(this._cert, {type: 'SHA-256', hex: hexData}, lParam)
                .then((response) => {
                    this._signature = response;
                    resolve();

                }, (err) => {
                    reject(err);
                });
        });
    }

    /* Sig data */

    get prepareSignatureData() {
        return {
            tokenId: null,
            certData: this._cert.hex
        };
    }

    get finalizeSignatureData() {
        return {
            tokenId: null,
            signature: this._signature.hex
        };
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
        if (typeof errorMessages[err] !== "undefined") {
            return {error_code: err, message: errorMessages[err][this.language]};
        }

        else {
            return {error_code: 'technical_error', message: errorMessages.technical_error[this.language]};
        }
    }
}

export default IdCardManager;
