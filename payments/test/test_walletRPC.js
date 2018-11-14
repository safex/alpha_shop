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

var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const walletRPC = require('../src/wallet-rpc').WalletRPC;

const getAddressResponse = require('./test_data/getAddres.json');
const makeIntegratedResponse = require('./test_data/makeIntegratedAddr.json');
const splitIntegratedAddress = require('./test_data/splitIntegratedAddress.json');
const getPaymentSingle = require('./test_data/getPaymentSingle.json');
const getPaymentMultiple = require('./test_data/getPaymentMultiple.json');
const config = require('../config.json');
const RPCPort = config.walletRPCPort;

describe('WalletRPC', function(){
    describe('#openWallet()', function(){
       it("Should return body without error field and empty result", async () =>{
            var res_expected = {
                "id": 0,
                "jsonrpc": "2.0",
                "result": {}
            };
            var wrpc = new walletRPC(RPCPort);
            var res = await wrpc.open("test.bin", "cicko");
            expect(JSON.stringify(res)).to.equal(JSON.stringify(res_expected));
        });
    });

    describe("#getAddress()", function() {
       it("Should body without error field and results with appropriate field address set.", async() => {
           var wrpc = new walletRPC(RPCPort);
           var res = await wrpc.getAddress();
           expect(JSON.stringify(res)).to.equal(JSON.stringify(getAddressResponse));
       });
    });

    describe("#makeIntegrated(paymentId)", function() {
        it("Should body without error field and results with appropriate fields integrated_address and payment_id set.", async() => {
            var wrpc = new walletRPC(RPCPort);
            var res = await wrpc.makeIntegratedAddress('a1b2c3d4e5f61234');
            expect(JSON.stringify(res)).to.equal(JSON.stringify(makeIntegratedResponse));
        });
    });

    describe("#splitIntegratedAddress(integratedAddress)", function() {
        it("Should body without error field and results with appropriate field standard_address and payment_id set.", async() => {
            var wrpc = new walletRPC(RPCPort);
            var res = await wrpc.splitIntegratedAddress('SFXti9o1apCRhgUEU4FVJjBkNS9sarNpbexP6YfZgDYv3bcSVwCZtm9PWnpkoRiifC3uMQJS9ihFmNTbUXr2eWgY7LUMiRvnCtbfTutTn7eyZs');
            expect(JSON.stringify(res)).to.equal(JSON.stringify(splitIntegratedAddress));
        });
    });

    describe("#getPayment() -- Multiple txs", function() {
        it("Should body without error field and results with appropriate field payments set.", async() => {
            var wrpc = new walletRPC(RPCPort);
            var res = await wrpc.checkForPayment('52cf9717af42a7002a40e9ed09c383248fce78da9c6652fc9f28a5ddac9c0069');
            if(res.result.payments[0] == getPaymentMultiple.result.payments[0]){
                expect(res.result.payments[0]).to.equal(getPaymentMultiple.result.payments[0]);
                expect(res.result.payments[1]).to.equal(getPaymentMultiple.result.payments[1]);
            }
            else {
                expect(JSON.stringify(res.result.payments[0])).to.equal(JSON.stringify(getPaymentMultiple.result.payments[1]));
                expect(JSON.stringify(res.result.payments[1])).to.equal(JSON.stringify(getPaymentMultiple.result.payments[0]));
            }
        });
    });

    describe("#getPayment() -- Single tx", function() {
        it("Should body without error field and results with appropriate field payments set.", async() => {
            var wrpc = new walletRPC(RPCPort);
            var res = await wrpc.checkForPayment('a1b2c3d4e5f61234');
            expect(JSON.stringify(res)).to.equal(JSON.stringify(getPaymentSingle));
        });
    });

});