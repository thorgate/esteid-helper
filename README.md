# esteid-helper

### Configure

```
IdentificationManager({
    idUrl: "the url that is used for ID Card signing",
    mobileIdUrl: "the url that is used for MobileID signing",
    smartIdUrl: "the url that is used for SmartID signing",
    language: "A language supported by *ID, one of ENG, EST, LIT, RUS",
    csrfToken: "the Django csrf token to add to POST/PATCH requests",
})
```

### Initialize signing

- ID card: `manager.signWithIdCard().then(() => {})`;
- MobileID: `manager.signWithMobileId({idCode, phoneNumber}).then(() => {})`;
- SmartID: `manager.signWithSmartId({idCode}).then(() => {})`.

The methods accept an object with required data and the `csrfMiddlewareToken` 
for POST/PATCH requests to succeed, and return a Promise.

The methods issue a signature preparation request to the backend with payload dependent on the signature provider.
- ID card: `certificate`: hex-encoded signer certificate obtained from the ID card through the `hwcrypto.js` library;
- MobileID: `id_code`, `phone_number` obtained from user input;
- SmartID: `id_code` obtained from user input.

### Status

- ID card: not necessary. 
- MobileID: `manager.midStatus()`
- SmartID: `manager.smartidStatus()`

The methods return a Promise that resolves with a `data` object obtained from the final status response.
The response is expected to contain a `status` property which will also be translated to a `success` property
of the `data` object. Besides, it may any data that the backend and frontend agree upon.

The methods issue a signature finalization request to the backend with payload dependent on the signature provider.
- ID card: `signature_value`: hex-encoded signature obtained from the ID card through the `hwcrypto.js` library;
- MobileID: no data;
- SmartID: no data.

If the finalization request results in a `202 Accepted` HTTP response, the request will be repeated after a timeout.
