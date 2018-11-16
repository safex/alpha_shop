// Copyright (c) 2018, The Safex Project
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//    conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//    of conditions and the following disclaimer in the documentation and/or other
//    materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//    used to endorse or promote products derived from this software without specific
//    prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

const request = require('request');
const colors = require('colors');

let debugRPCCall = true;

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