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


class IdCardManager {
    constructor(language, onReady, onStoreCertificate, onSigned, onError) {
        if (onReady) {
            this.onReady = onReady;
        }

        if (onError) {
            this.onError = onError;
        }

        if (onStoreCertificate) {
            this.onStoreCertificate = onStoreCertificate;
        }

        if (onSigned) {
            this.onSigned = onSigned;
        }

        this.language = language || LANGUAGE_ET;

        this._version = null;
        this._libaryVersion = libraryVersion;

        this._pluginHandler = null;
        this._cert = null;
        this._signature = null;
    }

    initializeIdCard() {
        if (typeof document !== 'undefined') {
            if (!document.getElementById('pluginLocation')) {
                let node = document.createElement('div');
                node.setAttribute('id', 'pluginLocation');
                document.body.appendChild(node);
            }
        }

        try {
            loadSigningPlugin(this.language.toLowerCase());

            this._pluginHandler = new IdCardPluginHandler(this.language.toLowerCase());

            this._pluginHandler.getVersion(this._storeVersion.bind(this), this.onError);

        } catch (e) {
            this.onError(e);
        }
    }

    getCertificate() {
        this._pluginHandler.getCertificate(this._storeCertificate.bind(this), this.onError);
    }

    signHexData(hexData) {
        this._pluginHandler.sign(this._cert.id, hexData, this._onSigned.bind(this), this.onError);
    }

    /* Getters/ setters */

    get prepareSignatureData() {
        return {
            tokenId: this._cert.id,
            certData: this._cert.cert
        };
    }

    get finalizeSignatureData() {
        return {
            tokenId: this._cert.id,
            signature: this._signature
        };
    }

    get version() {
        return [this._version, this._libaryVersion];
    }

    get language() {
        return this._language;
    }

    set language(l) {
        if (LANGUAGES.indexOf(l) !== -1) {
            this._language = l;
        }
    }

    /* internal event handlers */

    _storeVersion(version) {
        this._version = version;

        this.onReady();
    }

    _storeCertificate(cert) {
        this._cert = cert;

        this.onStoreCertificate();
    }

    _onSigned(signature) {
        this._signature = signature;

        this.onSigned();
    }

    /* Event handlers */

    onReady() {
        console.log('onReady, version: ', this.version);
    }

    onStoreCertificate() {
        console.log('CERT ID', this._cert.id);
        console.log('CERT HEX', this._cert.cert);
    }

    onSigned() {
        console.log('SIGNATURE', this._signature);
    }

    onError(ex) {
        if (ex instanceof IdCardException) {
            console.error('[Error code: ' + ex.returnCode + '; Error: ' + ex.message + ']');
        } else {
            console.error(ex.message !== undefined ? ex.message : ex);
        }
    }
}

export default IdCardManager;
