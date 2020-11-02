import IdCardManager from "./IdCardManager"

async function request(url, data, method = "POST") {
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            // we don't make use of GET currently, but let's add a check for that
            body: method === "GET" ? null : JSON.stringify(data || {}),
        })

        const body = await response.text()

        try {
            const data = JSON.parse(body)
            data.success = data.status === "success"
            data.pending = `${response.status}` === "202"
            return {
                data,
                ok: response.ok,
            }
        } catch (err) {
            console.log("Failed to parse response as JSON", body)
            return {}
        }
    } catch (err) {
        console.log(err)
        return {}
    }
}

class IdentificationManager {
    constructor({ language, idUrl, mobileIdUrl, smartIdUrl, csrfToken, pollInterval }) {
        // construct the idCardManager
        this.idCardManager = new IdCardManager(language)

        this.idUrl = idUrl
        this.mobileIdUrl = mobileIdUrl
        this.smartIdUrl = smartIdUrl
        this.csrfToken = csrfToken
        this.language = language
        this.pollInterval = pollInterval || 3000
    }

    checkStatus(endpoint, resolve, reject) {
        const pollInterval = this.pollInterval
        console.log("Status", endpoint)
        const doRequest = () => {
            request(endpoint, null, "PATCH")
                .then(({ ok, data }) => {
                    if (ok && data.pending) {
                        setTimeout(() => doRequest(), pollInterval)
                    } else if (ok && data.success) {
                        resolve(data)
                    } else {
                        reject(data)
                    }
                })
                .catch((err) => {
                    console.log("Status error", err)
                })
        }
        return doRequest()
    }

    signWithIdCard() {
        return new Promise((resolve, reject) => {
            this.__signHandleIdCard(resolve, reject)
        })
    }

    signWithMobileId({ idCode, phoneNumber }) {
        return new Promise((resolve, reject) => {
            this.__signHandleMid(idCode, phoneNumber, resolve, reject)
        })
    }

    signWithSmartId({ idCode, country }) {
        return new Promise((resolve, reject) => {
            this.__signHandleSmartid(idCode, country, resolve, reject)
        })
    }

    __signHandleIdCard(resolve, reject) {
        this.idCardManager.initializeIdCard().then(() => {
            this.idCardManager.getCertificate().then((certificate) => {
                request(this.idUrl, {
                    csrfmiddlewaretoken: this.csrfToken,
                    certificate: certificate,
                }).then(({ ok, data }) => {
                    if (ok && data.success) {
                        this.__doSign(data.digest, resolve, reject)
                    } else {
                        reject(data)
                    }
                })
            }, reject)
        }, reject)
    }

    __doSign(dataDigest, resolve, reject) {
        this.idCardManager.signHexData(dataDigest).then((signature) => {
            request(
                this.idUrl,
                {
                    csrfmiddlewaretoken: this.csrfToken,
                    signature_value: signature,
                },
                "PATCH"
            ).then(({ ok, data }) => {
                if (ok && data.success) {
                    resolve(data)
                } else {
                    reject(data)
                }
            })
        }, reject)
    }

    __signHandleMid(idCode, phoneNumber, resolve, reject) {
        request(this.mobileIdUrl, {
            id_code: idCode,
            phone_number: phoneNumber,
            language: this.language,
            csrfmiddlewaretoken: this.csrfToken,
        }).then(({ ok, data }) => {
            if (ok && data.success) {
                resolve(data)
            } else {
                reject(data)
            }
        })
    }

    midStatus() {
        return new Promise((resolve, reject) => {
            this.checkStatus(this.mobileIdUrl, resolve, reject)
        })
    }

    __signHandleSmartid(idCode, country, resolve, reject) {
        request(this.smartIdUrl, {
            id_code: idCode,
            country,
            csrfmiddlewaretoken: this.csrfToken,
        }).then(({ ok, data }) => {
            if (ok && data.success) {
                resolve(data)
            } else {
                reject(data)
            }
        })
    }

    smartidStatus() {
        return new Promise((resolve, reject) => {
            this.checkStatus(this.smartIdUrl, resolve, reject)
        })
    }

    getError(err) {
        return this.idCardManager.getError(err)
    }
}

export default IdentificationManager
