import _ from 'lodash';
import request from 'superagent';

import IdCardManager from './IdCardManager';


class IdentificationManager {
    constructor(kwargs) {
        kwargs = _.extend({
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
            }

        }, kwargs);

        // construct the idCardManager
        this.idCardManager = new IdCardManager(
            kwargs.language,
            this.onIdCardReady.bind(this),
            this.onIdCardReceiveCertificate.bind(this),
            this.onIdCardSigned.bind(this),
            this.onIdCardError.bind(this)
        );

        this.idEndpoints = kwargs.idEndpoints;
        this.midEndpoints = kwargs.midEndpoints;
    }

    sign(signType, extraData, callBack) {
        if (signType === IdentificationManager.SIGN_ID) {
            this._idExtraData = extraData;
            this._idCallBack = callBack;

            // Init id-card plugin
            this.idCardManager.initializeIdCard();
        }

        else if (signType === IdentificationManager.SIGN_MOBILE) {
            request
                .post(this.midEndpoints.start)
                .type('form')
                .send(extraData)
                .end(function (err, res) {
                    callBack(res.ok, res.body);
                });
        }

        else {
            console.error('IdentificationManager: Bad signType');
        }
    }

    midStatus(challengeId, extraData, callBack) {
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
                                    callBack(res.ok, res.body);
                                }
                            }

                            else {
                                // Process complete
                                callBack(res.ok, res.body);
                            }

                        } else {
                            // Got a failure, lets notify the requester
                            callBack(res.ok, res.body);
                        }
                    });
            };

            doRequest();
        }
    }

    onIdCardReady() {
        // Call getCertificate
        this.idCardManager.getCertificate();
    }

    onIdCardReceiveCertificate() {
        let prepareData = this.idCardManager.prepareSignatureData;

        request
            .post(this.idEndpoints.start)
            .type('form')
            .send({certificate: prepareData.certData, token_id: prepareData.tokenId})
            .send(this._idExtraData)
            .end((err, res) => {
                if (res.ok && res.body.success) {
                    this.attemptSign(res.body.id, res.body.digest);
                }

                else {
                    this.onIdCardError(res.body);
                }
            });
    }

    attemptSign(signatureId, signatureDigest) {
        this._signatureId = signatureId;
        this.idCardManager.signHexData(signatureDigest);
    }

    onIdCardSigned() {
        let finalizeData = this.idCardManager.finalizeSignatureData;

        request
            .post(this.idEndpoints.finish)
            .type('form')
            .send({signature_value: finalizeData.signature, signature_id: this._signatureId})
            .send(this._idExtraData)
            .end((err, res) => {
                if (res.ok && res.body.success) {
                    this._idCallBack(res.ok, res.body);
                }

                else {
                    this.onIdCardError(res.body);
                }
            });
    }

    onIdCardError(ex) {
        this._idCallBack(false, ex);
    }
}

IdentificationManager.SIGN_ID = 'id';
IdentificationManager.SIGN_MOBILE = 'mid';


export default IdentificationManager;
