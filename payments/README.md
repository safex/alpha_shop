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

Config json is main configuration file for SfxPaymentModule:
  "nodeRPCPort" => RPC Port for local node.
  "walletRPCPort" => RPC port for local safex-wallet-rpc
  "scanningSpan" => Number of blocks to be scanned from the end of blockchain.
  "listeningPeriod" => Time period on which scan is performed
  "port" => Listening port of REST Service

Every REST Service response has error and timestamp field by default. If error field is set to false, there will be result field with targeted data. Otherwise it will be error_msg indicating what was error which happened.
REST Service has next exposed endpoints

@IMPORTANT: Confirmations are calculated from last block which contains tx linked with given paymentId!!!

### **POST** /getpaymentinfo

##### Description: 
*Getting paymentinfo from internal book keeping of payment module. This is roughly around scanningSpan number of blocks.*

##### Request Data:
```json
{ "paymentId" : "a1b2c5d4e5e61236" }
```
##### Response:
```json
{
    "error": false,
    "result": {
        "paymentId": "a1b2c5d4e5e61236",
        "confirmations": 178,
        "totalAmount": 1500000000000
    },
    "timestamp": "2018-11-17T22:27:49.000Z"
}
```

#### **POST** /getpaymentinfowholebc

##### Description: 
*Getting payment info connected to paymentId scaning entire blockchain. Its intended for dispute solving and debugging.*

##### Request Data:

```json{ "paymentId" : "a1b2c5d4e5e61236" }```

##### Response:

```json
{
    "error": false,
    "result": {
        "paymentId": "a1b2c5d4e5e61236",
        "confirmations": 179,
        "totalAmount": 1500000000000
    },
    "timestamp": "2018-11-17T22:33:05.506Z"
}
```

#### **POST** /getintegratedaddress

##### Description: 
*Get integrated address based on given paymentId*

##### Request Data:

```json
{ "paymentId" : "a1b2c5d4e5e61236" }
```

##### Response:

```json
{
    "error": false,
    "result": {
        "integrated_address": "SFXti9o1apCRhgUEU4FVJjBkNS9sarNpbexP6YfZgDYv3bcSVwCZtm9PWnpkoRiifC3uMQJS9ihFmNTbUXr2eWgY7LUMiRvnD3RfTJin1xguGC"
    },
    "timestamp": "2018-11-17T22:34:40.828Z"
}
```

#### **POST** /splitintegratedaddress

##### Description: 
*For given integrated address returns paymentId and payment address.*

##### Request Data:

```json
{ "integratedAddress" : "SFXti9o1apCRhgUEU4FVJjBkNS9sarNpbexP6YfZgDYv3bcSVwCZtm9PWnpkoRiifC3uMQJS9ihFmNTbUXr2eWgY7LUMiRvnD3RfTJin1xguGC"
}
```

##### Response:

```json
{
    "error": false,
    "result": {
        "paymentId": "a1b2c5d4e5e61236",
        "address": "SFXtzWd5wWCRhgUEU4FVJjBkNS9sarNpbexP6YfZgDYv3bcSVwCZtm9PWnpkoRiifC3uMQJS9ihFmNTbUXr2eWgY7LUMiPBHFgq"
    },
    "timestamp": "2018-11-17T22:44:41.770Z"
}
```

#### **POST** /getpaymentaddress
##### Description: 

##### Request Data:
```json {}  ```

##### Response:

```json
{
    "error": false,
    "result": {
        "payment_address": "SFXtzWd5wWCRhgUEU4FVJjBkNS9sarNpbexP6YfZgDYv3bcSVwCZtm9PWnpkoRiifC3uMQJS9ihFmNTbUXr2eWgY7LUMiPBHFgq"
    },
    "timestamp": "2018-11-17T22:35:22.061Z"
}
```


#### **POST** /hardforkinfo

##### Description: 
*Getting some relevant information regarding hard fork. For more info see https://www.getmonero.org/resources/developer-guides/daemon-rpc.html#hard_fork_info*

##### Request Data:

```json {} ```

##### Response:

```json
{
    "error": false,
    "result": {
        "enabled": true,
        "state": 2,
        "status": "OK",
        "version": 2
    },
    "timestamp": "2018-11-17T22:37:14.282Z"
}
```

#### **POST** /nodeinfo

##### Description: 
*Getting some relevant (filtered) information regarding node. https://www.getmonero.org/resources/developer-guides/daemon-rpc.html#get_info*

##### Request Data:

```json {} ```

##### Request Data:

```json
{
    "error": false,
    "result": {
        "height": 45237,
        "free_space": 15625752576,
        "mainnet": false,
        "stagenet": false,
        "testnet": true,
        "status": "OK",
        "start_time": 1542493587
    },
    "timestamp": "2018-11-17T22:38:00.522Z"
}
```

#### **POST** /openwallet

##### Description: 
*Wallet file should be located in dir specified when starting walletRPC. Its intended for debugging purposes and for remote activating wallet file. Empty result means success.*

##### Request Data: 

```json { "filename" : "test.bin", "password" : "cicko" }```


##### Response:

```json
{
    "error": false,
    "result": {},
    "timestamp": "2018-11-17T22:51:37.838Z"
}
```

### Error example:

```json
{
    "error": true,
    "error_msg": "API Error: Failed to open wallet",
    "timestamp": "2018-11-17T22:56:34.735Z"
}
```
