esteid-helper
=============

### Configure

Pass the backend URLs to `IdentificationManager()`

### Initialize signing 

* ID card: `manager.signWithIdCard()`
* MobileID: `manager.signWithMobileId()`
* SmartID: `manager.signWithSmartId()`

The methods accept an object with required data and the `csrfMiddlewareToken` for POST requests to succeed, and return a Promise.
Data varies depending on what the backend expects.

### Status

* MobileID: `manager.midStatus()`
* SmartID: `manager.smartidStatus()`

The methods accept an object with required data and the `csrfMiddlewareToken` for POST requests to succeed, and return a Promise.
