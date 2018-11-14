const request = require('request');
const colors = require('colors');

let debugRPCCall = false;

async function executeMethod(rpcEndpoint, methodName, params) {
    return new Promise(function (resolve, reject) {
        var json_data = {
            jsonrpc: "2.0",
            id: 0,
            method: methodName,
            params: params
        };
        if(debugRPCCall) {
            console.log('====================== REQ ===================================='.yellow);
            console.log('#DEBUG: Host: '.magenta + rpcEndpoint);
            console.log('#DEBUG: Method: '.magenta + methodName);
            console.log('#DEBUG: Request body: '.magenta + JSON.stringify(json_data));
            console.log('==============================================================='.yellow);
        }
        request.post(rpcEndpoint, {json: json_data}, (error, res, body) => {
            if (error) {
                reject('Request ' + error.toString());
                return;
            }
            if(typeof body === 'string') {
                body = JSON.parse(body);
            }

            if (body.error) {
                if(debugRPCCall) {
                    console.log('====================== REQ ERR ================================'.red);
                    console.log('#DEBUG: Method: '.yellow + methodName);
                    console.log('#DEBUG: '.yellow + JSON.stringify(body));
                    console.log('==============================================================='.red);
                }
                reject('API Error: '+ body.error.message);
                return;
            }

            resolve(body);
        });
    });
}

module.exports = {
    executeMethod : executeMethod
};