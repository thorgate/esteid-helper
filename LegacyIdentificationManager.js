import IdCardManager from "./IdCardManager";

function postForm(url, data) {
    const formData = Object.entries(data)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");

    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
    }).then(
        (response) => {
            return response.json().then((data) => {
                return {
                    data,
                    ok: response.ok,
                };
            });
        },
        (err) => {
            console.log(err);
            return {};
        },
    );
}

class LegacyIdentificationManager {
    constructor(kwargs) {
        const data = {
            language: null,

            idEndpoints: {
                start: null,
                finish: null,
                finalize: null,
            },

            midEndpoints: {
                start: null,
                status: null,
                finalize: null,
            },

            smartidEndpoints: {
                start: null,
                status: null,
                finalize: null,
            },

            ...kwargs,
        };

        // construct the idCardManager
        this.idCardManager = new IdCardManager(data.language);

        this.idEndpoints = data.idEndpoints;
        this.midEndpoints = data.midEndpoints;
        this.smartidEndpoints = data.smartidEndpoints;
    }

    checkStatus(endpoint, extraData, resolve, reject) {
        const doRequest = () => {
            postForm(endpoint, extraData).then(({ ok, data }) => {
                if (ok && data.pending) {
                    setTimeout(() => doRequest(), 1000);
                } else if (ok && data.success) {
                    resolve(data);
                } else {
                    reject(data);
                }
            });
        };
        return doRequest;
    }

    signWithIdCard(extraData) {
        return new Promise((resolve, reject) => {
            this.__signHandleId(extraData, resolve, reject);
        });
    }

    signWithMobileId(extraData) {
        return new Promise((resolve, reject) => {
            this.__signHandleMid(extraData, resolve, reject);
        });
    }

    signWithSmartId(extraData) {
        return new Promise((resolve, reject) => {
            this.__signHandleSmartid(extraData, resolve, reject);
        });
    }

    sign(signType, extraData) {
        // Legacy API
        if (signType === LegacyIdentificationManager.SIGN_ID) {
            return this.signWithIdCard(extraData);
        } else if (signType === LegacyIdentificationManager.SIGN_MOBILE) {
            return this.signWithMobileId(extraData);
        } else if (signType === LegacyIdentificationManager.SIGN_SMARTID) {
            return this.signWithSmartId(extraData);
        } else {
            throw new TypeError("LegacyIdentificationManager: Bad signType");
        }
    }

    __signHandleId(extraData, resolve, reject) {
        this.idCardManager.initializeIdCard().then(() => {
            this.idCardManager.getCertificate().then((certificate) => {
                postForm(this.idEndpoints.start, {
                    ...extraData,
                    certificate: certificate,
                }).then(({ ok, data }) => {
                    if (ok && data.success) {
                        this.__doSign(data.digest, extraData, resolve, reject);
                    } else {
                        reject(data);
                    }
                });
            }, reject);
        }, reject);
    }

    __doSign(dataDigest, extraData, resolve, reject) {
        this.idCardManager.signHexData(dataDigest).then((signature) => {
            postForm(this.idEndpoints.finish, {
                ...extraData,
                signature_value: signature,
            }).then(({ ok, data }) => {
                if (ok && data.success) {
                    resolve(data);
                } else {
                    reject(data);
                }
            });
        }, reject);
    }

    __signHandleMid(extraData, resolve, reject) {
        postForm(this.midEndpoints.start, extraData).then(({ ok, data }) => {
            if (ok && data.success) {
                resolve(data);
            } else {
                reject(data);
            }
        });
    }

    midStatus(extraData) {
        return new Promise((resolve, reject) => {
            const checkStatus = this.checkStatus(this.midEndpoints.status, extraData, resolve, reject);
            checkStatus();
        });
    }

    __signHandleSmartid(extraData, resolve, reject) {
        postForm(this.smartidEndpoints.start, extraData).then(({ ok, data }) => {
            if (ok && data.success) {
                resolve(data);
            } else {
                reject(data);
            }
        });
    }

    smartidStatus(extraData) {
        return new Promise((resolve, reject) => {
            const checkStatus = this.checkStatus(this.smartidEndpoints.status, extraData, resolve, reject);
            checkStatus();
        });
    }

    getError(err) {
        return this.idCardManager.getError(err);
    }
}

LegacyIdentificationManager.SIGN_ID = "id";
LegacyIdentificationManager.SIGN_MOBILE = "mid";
LegacyIdentificationManager.SIGN_SMARTID = "smartid";

export default LegacyIdentificationManager;