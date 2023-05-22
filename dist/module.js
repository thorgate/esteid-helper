var $parcel$global =
typeof globalThis !== 'undefined'
  ? globalThis
  : typeof self !== 'undefined'
  ? self
  : typeof window !== 'undefined'
  ? window
  : typeof global !== 'undefined'
  ? global
  : {};
const $5e8e457e33c20981$export$216983ec6089ef64 = "EST";
const $5e8e457e33c20981$export$449b009f68cc9554 = "ENG";
const $5e8e457e33c20981$export$3d353c79207db73 = "RUS";
const $5e8e457e33c20981$export$1ed6e4462bf475ae = "LIT";
const $5e8e457e33c20981$var$LANGUAGES = [
    $5e8e457e33c20981$export$216983ec6089ef64,
    $5e8e457e33c20981$export$449b009f68cc9554,
    $5e8e457e33c20981$export$3d353c79207db73,
    $5e8e457e33c20981$export$1ed6e4462bf475ae
];
const $5e8e457e33c20981$var$errorMessages = {
    user_cancel: {
        [$5e8e457e33c20981$export$216983ec6089ef64]: "Allkirjastamine katkestati",
        [$5e8e457e33c20981$export$449b009f68cc9554]: "Signing was cancelled",
        [$5e8e457e33c20981$export$1ed6e4462bf475ae]: "Pasirašymas nutrauktas",
        [$5e8e457e33c20981$export$3d353c79207db73]: "Подпись была отменена"
    },
    no_certificates: {
        [$5e8e457e33c20981$export$216983ec6089ef64]: "Sertifikaate ei leitud",
        [$5e8e457e33c20981$export$449b009f68cc9554]: "Certificate not found",
        [$5e8e457e33c20981$export$1ed6e4462bf475ae]: "Nerastas sertifikatas",
        [$5e8e457e33c20981$export$3d353c79207db73]: "Сертификат не найден"
    },
    invalid_argument: {
        [$5e8e457e33c20981$export$216983ec6089ef64]: "Vigane sertifikaadi identifikaator",
        [$5e8e457e33c20981$export$449b009f68cc9554]: "Invalid certificate identifier",
        [$5e8e457e33c20981$export$1ed6e4462bf475ae]: "Neteisingas sertifikato identifikatorius",
        [$5e8e457e33c20981$export$3d353c79207db73]: "Неверный идентификатор сертификата"
    },
    no_implementation: {
        [$5e8e457e33c20981$export$216983ec6089ef64]: "Vajalik tarkvara on puudu",
        [$5e8e457e33c20981$export$449b009f68cc9554]: "Unable to find software",
        [$5e8e457e33c20981$export$1ed6e4462bf475ae]: "Nerasta programinės įranga",
        [$5e8e457e33c20981$export$3d353c79207db73]: "Отсутствует необходимое программное обеспечение"
    },
    technical_error: {
        [$5e8e457e33c20981$export$216983ec6089ef64]: "Tehniline viga",
        [$5e8e457e33c20981$export$449b009f68cc9554]: "Technical error",
        [$5e8e457e33c20981$export$1ed6e4462bf475ae]: "Techninė klaida",
        [$5e8e457e33c20981$export$3d353c79207db73]: "Техническая ошибка"
    },
    not_allowed: {
        [$5e8e457e33c20981$export$216983ec6089ef64]: "Veebis allkirjastamise k\xe4ivitamine on v\xf5imalik vaid https aadressilt",
        [$5e8e457e33c20981$export$449b009f68cc9554]: "Web signing is allowed only from https:// URL",
        [$5e8e457e33c20981$export$1ed6e4462bf475ae]: "Web signing is allowed only from https:// URL",
        [$5e8e457e33c20981$export$3d353c79207db73]: "Подпись в интернете возможна только с URL-ов, начинающихся с https://"
    }
};
class $5e8e457e33c20981$var$IdCardManager {
    constructor(language){
        this.language = language || $5e8e457e33c20981$export$216983ec6089ef64;
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
         */ return new Promise(function(resolve, reject) {
            if (typeof window.webeid !== "undefined") resolve("web-eid");
            else if (typeof window.hwcrypto !== "undefined" && window.hwcrypto.use("auto")) resolve("hwcrypto");
            else reject("Backend selection failed");
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
     */ getCertificate() {
        return new Promise((resolve, reject)=>{
            const options = {
                lang: this.language
            };
            window.webeid.getSigningCertificate(options).then(({ certificate: certificate , supportedSignatureAlgorithms: supportedSignatureAlgorithms  })=>{
                this.certificate = certificate;
                this.supportedSignatureAlgorithms = supportedSignatureAlgorithms;
                resolve(certificate);
            }, (err)=>{
                reject(err);
            });
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
     */ signHexData(data, hashFunction = "SHA-256") {
        return new Promise((resolve, reject)=>{
            const options = {
                lang: this.language
            };
            window.webeid.sign(this.certificate, data, hashFunction, options).then((signResponse)=>{
                this.signatureAlgorithm = signResponse.signatureAlgorithm;
                resolve(signResponse.signature);
            }, (err)=>{
                reject(err);
            });
        });
    }
    /* Language */ get language() {
        return this._language;
    }
    set language(l) {
        if ($5e8e457e33c20981$var$LANGUAGES.indexOf(l) !== -1) this._language = l;
    }
    /* Errors */ getError(err) {
        // TODO: mapping for web-eid errors too
        //
        // https://github.com/web-eid/web-eid.js#error-codes
        if (typeof $5e8e457e33c20981$var$errorMessages[err] === "undefined") err = "technical_error";
        return {
            error_code: err,
            message: $5e8e457e33c20981$var$errorMessages[err][this.language]
        };
    }
}
var $5e8e457e33c20981$export$2e2bcd8739ae039 = $5e8e457e33c20981$var$IdCardManager;


const $1d20638d290f5332$var$request = async (url, data, method = "POST")=>{
    const headers = {
        "Content-Type": "application/json"
    };
    let body = null;
    if (method !== "GET") {
        // we don't make use of GET currently, but let's add a check for that
        headers["X-CSRFToken"] = data.csrfmiddlewaretoken;
        body = JSON.stringify(data || {});
    }
    try {
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body
        });
        const responseText = await response.text();
        try {
            const data = JSON.parse(responseText);
            data.success = data.status === "success";
            data.pending = `${response.status}` === "202";
            return {
                data: data,
                ok: response.ok
            };
        } catch (err) {
            console.log("Failed to parse response as JSON", responseText);
            return {};
        }
    } catch (err) {
        console.log(err);
        return {};
    }
};
class $1d20638d290f5332$var$IdentificationManager {
    constructor({ language: language , idUrl: idUrl , mobileIdUrl: mobileIdUrl , smartIdUrl: smartIdUrl , csrfToken: csrfToken , pollInterval: pollInterval  }){
        // construct the idCardManager
        this.idCardManager = new (0, $5e8e457e33c20981$export$2e2bcd8739ae039)(language);
        this.idUrl = idUrl;
        this.mobileIdUrl = mobileIdUrl;
        this.smartIdUrl = smartIdUrl;
        this.csrfToken = csrfToken;
        this.language = language;
        this.pollInterval = pollInterval || 3000;
    }
    checkStatus(endpoint, resolve, reject) {
        const pollInterval = this.pollInterval;
        const csrfmiddlewaretoken = this.csrfToken;
        const doRequest = ()=>{
            $1d20638d290f5332$var$request(endpoint, {
                csrfmiddlewaretoken: csrfmiddlewaretoken
            }, "PATCH").then(({ ok: ok , data: data  })=>{
                if (ok && data.pending) setTimeout(()=>doRequest(), pollInterval);
                else if (ok && data.success) resolve(data);
                else reject(data);
            }).catch((err)=>{
                console.log("Status error", err);
            });
        };
        return doRequest();
    }
    signWithIdCard() {
        return new Promise((resolve, reject)=>{
            this.__signHandleIdCard(resolve, reject);
        });
    }
    signWithMobileId({ idCode: idCode , phoneNumber: phoneNumber  }) {
        return new Promise((resolve, reject)=>{
            this.__signHandleMid(idCode, phoneNumber, resolve, reject);
        });
    }
    signWithSmartId({ idCode: idCode , country: country  }) {
        return new Promise((resolve, reject)=>{
            this.__signHandleSmartid(idCode, country, resolve, reject);
        });
    }
    __signHandleIdCard(resolve, reject) {
        this.idCardManager.initializeIdCard().then(()=>{
            this.idCardManager.getCertificate().then((certificate)=>{
                $1d20638d290f5332$var$request(this.idUrl, {
                    csrfmiddlewaretoken: this.csrfToken,
                    certificate: certificate
                }).then(({ ok: ok , data: data  })=>{
                    if (ok && data.success) this.__doSign(data.digest, resolve, reject);
                    else reject(data);
                });
            }, reject);
        }, reject);
    }
    __doSign(dataDigest, resolve, reject) {
        this.idCardManager.signHexData(dataDigest).then((signature)=>{
            $1d20638d290f5332$var$request(this.idUrl, {
                csrfmiddlewaretoken: this.csrfToken,
                signature_value: signature
            }, "PATCH").then(({ ok: ok , data: data  })=>{
                if (ok && data.success) resolve(data);
                else reject(data);
            });
        }, reject);
    }
    __signHandleMid(idCode, phoneNumber, resolve, reject) {
        $1d20638d290f5332$var$request(this.mobileIdUrl, {
            id_code: idCode,
            phone_number: phoneNumber,
            language: this.language,
            csrfmiddlewaretoken: this.csrfToken
        }).then(({ ok: ok , data: data  })=>{
            if (ok && data.success) resolve(data);
            else reject(data);
        });
    }
    midStatus() {
        return new Promise((resolve, reject)=>{
            this.checkStatus(this.mobileIdUrl, resolve, reject);
        });
    }
    __signHandleSmartid(idCode, country, resolve, reject) {
        $1d20638d290f5332$var$request(this.smartIdUrl, {
            id_code: idCode,
            country: country,
            csrfmiddlewaretoken: this.csrfToken
        }).then(({ ok: ok , data: data  })=>{
            if (ok && data.success) resolve(data);
            else reject(data);
        });
    }
    smartidStatus() {
        return new Promise((resolve, reject)=>{
            this.checkStatus(this.smartIdUrl, resolve, reject);
        });
    }
    getError(err) {
        return this.idCardManager.getError(err);
    }
}
var $1d20638d290f5332$export$2e2bcd8739ae039 = $1d20638d290f5332$var$IdentificationManager;



var $db3fe735658ff64c$export$2e2bcd8739ae039 = {
    IdentificationManager: (0, $1d20638d290f5332$export$2e2bcd8739ae039),
    Languages: {
        ET: (0, $5e8e457e33c20981$export$216983ec6089ef64),
        EN: (0, $5e8e457e33c20981$export$449b009f68cc9554),
        RU: (0, $5e8e457e33c20981$export$3d353c79207db73),
        LT: (0, $5e8e457e33c20981$export$1ed6e4462bf475ae)
    }
};


const $0dba17e9e38b844e$var$globalObject = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof $parcel$global !== "undefined" ? $parcel$global : {};
$0dba17e9e38b844e$var$globalObject.Esteid = (0, $db3fe735658ff64c$export$2e2bcd8739ae039);
var $0dba17e9e38b844e$export$2e2bcd8739ae039 = (0, $db3fe735658ff64c$export$2e2bcd8739ae039);


export {$0dba17e9e38b844e$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=module.js.map
