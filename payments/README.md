# safex-payment-module

Safex-payment-module is NodeJS module for payments in Safex Cash cryptocurrency. Currently provided as node module.
Next steps will include standalone REST service with TLS connection.

# Requirements
-	Running safex daemon with rpc enabled in localhost
-	Running safex-wallet-rpc (with --disable-rpc-loging option) in localhost
-	View-only wallet file in specified path.

# Hints
-   It will work with full wallet file, but that is considered security risk.
-   Dont use .open call programatically if you have password protected wallet-file. Use curl.

# Test
In order to run test successfully, you will need to have test wallet for which test are currently written. Unfortunately that wallet is not available at the moment.

# Usage
Safex payments module can be used as REST service and/or nodeJS module.
-   node REST_service.js

https://itnext.io/node-express-letsencrypt-generate-a-free-ssl-certificate-and-run-an-https-server-in-5-minutes-a730fbe528ca
write extensive doc about API.
Change SHA1.