# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)


## [0.6.0] - 2025-04-04
### Added
- Retry requests on network error and on HTTP 410 Gone response send by backend, which 
  allows to implement more robust behavior on mobile devices (long polling requests 
  to status endpoints are known to fail with network error when browser is in background,
  and browser does go to background when SmartID app pops up).

### Changed
- use `web-eid` instead of legacy `hwcrypto`

[0.6.0]: https://github.com/thorgate/esteid-helper/compare/0.4.0...0.6.0
