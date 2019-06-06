import request from 'superagent';

import IdCardManager from './IdCardManager';


class IdentificationManager {
    constructor(kwargs) {
        const data = {
            language: null,

            idEndpoints: {
                start: null,
                finish: null,
                finalize: null
            },

            midEndpoints: {
                start: null,
                status: null,
                finalize: null
            },
            ...kwargs
        };

        // construct the idCardManager
        this.idCardManager = new IdCardManager(data.language);

        this.idEndpoints = data.idEndpoints;
        this.midEndpoints = data.midEndpoints;
    }

    sign(signType, extraData, callBack) {
        return new Promise((resolve, reject) => {
            if (signType === IdentificationManager.SIGN_ID) {
                this.__signHandleId(extraData, resolve, reject);
            }

            else if (signType === IdentificationManager.SIGN_MOBILE) {
                this.__signHandleMid(extraData, resolve, reject);
            }

            else {
                reject('IdentificationManager: Bad signType');
            }
        });
    }

    __signHandleId(extraData, resolve, reject) {
        this.idCardManager.initializeIdCard().then(() => {
            this.idCardManager.getCertificate().then(() => {
                let prepareData = this.idCardManager.prepareSignatureData;

                request
                    .post(this.idEndpoints.start)
                    .type('form')
                    .send({certificate: prepareData.certData, token_id: prepareData.tokenId})
                    .send(extraData)
                    .end((err, res) => {
                        if (res.ok && res.body.success) {
                            this.__attemptSign(res.body.id, res.body.digest, extraData, resolve, reject);
                        }

                        else {
                            reject(res.body);
                        }
                    });

            }, reject);

        }, reject);
    }

    __attemptSign(signatureId, signatureDigest, extraData, resolve, reject) {
        this.idCardManager.signHexData(signatureDigest).then(() => {
            let finalizeData = this.idCardManager.finalizeSignatureData;
            request
                .post(this.idEndpoints.finish)
                .type('form')
                .send({signature_value: finalizeData.signature, signature_id: signatureId})
                .send(extraData)
                .end((err, res) => {
                    if (res.ok && res.body.success) {
                        resolve(res.body);
                    }

                    else {
                        reject(res.body);
                    }
                });

        }, reject);
    }

    __signHandleMid(extraData, resolve, reject) {
        request
            .post(this.midEndpoints.start)
            .type('form')
            .send(extraData)
            .end(function (err, res) {
                if (res.ok && res.body.success) {
                    resolve(res.body);
                }

                else {
                    reject(res.body);
                }
            });
    }

    midStatus(challengeId, extraData) {
        return new Promise((resolve, reject) => {
            if (challengeId) {
                var doRequest = () => {
                    request
                        .post(this.midEndpoints.status)
                        .type('form')
                        .send(extraData)
                        .end((err, res) => {
                            if (res.ok) {
                                if (!res.body.success) {
                                    if (res.body.pending) {
                                        // Still pending, try again in 1s
                                        setTimeout(doRequest, 1000);
                                    }

                                    else {
                                        // Got a failure, lets notify the requester
                                        reject(res.body);
                                    }
                                }

                                else {
                                    // Process complete
                                    resolve(res.body);
                                }

                            } else {
                                // Got a failure, lets notify the requester
                                reject(res.body);
                            }
                        });
                };

                doRequest();

            } else {
                reject("skipped");
            }
        });
    }

    getError(err) {
        return this.idCardManager.getError(err);
    }
}

IdentificationManager.SIGN_ID = 'id';
IdentificationManager.SIGN_MOBILE = 'mid';


export default IdentificationManager;
