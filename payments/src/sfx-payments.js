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

const color = require('colors');
const bigInt = require('big-integer');
const walletRpc = require('./wallet-rpc').WalletRPC;
const nodeRpc = require('./node-rpc').NodeRPC;


class SafexPayments {
    constructor(walletRPCPort, nodeRPCPort) {
        this.walletRPC = new walletRpc(walletRPCPort);
        this.nodeRpc = new nodeRpc(nodeRPCPort);
    }

    /**
     * Returning TX statuses for given paymentId. Returned values are from the beginning of blockchain.
     * @param paymentId
     * @returns {Promise<Array({
     *     amount : Amount in SafexCash in base currency 10^-10
     *     block_height : Block height where transaction is located
     *     tx_hash : Transaction hash
     *     unlock_time : Unlock time.
     *     })
     * }
     */
    async getPaymentStatusOne(paymentId) {
        let results = await this.walletRPC.checkForPayment(paymentId);
        // PostProcessing

        var returnVals = [];

        if(results.result.payments){
            // Refer test/test_data/getPaymentMultiple.json to see how input looks like for multiple tx for same
            //  paymentId.
            results.result.payments.forEach((input) => {
                returnVals.push({
                    amount : input.amount,
                    block_height : input.block_height,
                    tx_hash : input.tx_hash,
                    unlock_time: input.unlock_time
                });
            });
        }

        return {paymentId: paymentId, txs: returnVals};
    }

    async getPaymentStatusBulk(paymentIds, start_block_height) {
        let results = await this.walletRPC.checkForPayments(paymentIds, start_block_height);

        // PostProcessing
        var returnVals = new Object();

        if(results.result.payments){
            // Refer test/test_data/getPaymentMultiple.json to see how input looks like for multiple tx for same
            //  paymentId.
            results.result.payments.forEach((input) => {
                if(! returnVals.hasOwnProperty(input.payment_id)) {
                    returnVals[input.payment_id] = {
                        paymentId: input.payment_id,
                        txs: []
                    };
                }
                returnVals[input.payment_id].txs.push({
                    amount : input.amount,
                    block_height : input.block_height,
                    tx_hash : input.tx_hash,
                    unlock_time: input.unlock_time
                });
            });
        }

        return Object.values(returnVals);
    }

    async getIntegratedAddress(paymentId) {
        let results = await this.walletRPC.makeIntegratedAddress(paymentId);
        return { integrated_address : results.result.integrated_address};
    }

    async splitIntegratedAddress(integratedAddress) {
        let results = await this.walletRPC.splitIntegratedAddress(integratedAddress);
        return { paymentId: results.result.payment_id, address: results.result.standard_address};
    }

    async getInfo() {
        let results = await this.nodeRpc.getInfo();
        return {
            height: results.result.height,
            free_space: results.result.free_space,
            mainnet: results.result.mainnet,
            stagenet: results.result.stagenet,
            testnet: results.result.testnet,
            status: results.result.status,
            start_time: results.result.start_time
        };
    }

    async getAddress() {
        let results = await this.walletRPC.getAddress();
        return { payment_address : results.result.address};
    }

    async getHardForkInfo() {
        let results = await this.nodeRpc.getHardForkInfo();
        return {
          enabled : results.result.enabled,
          state : results.result.state,
          status : results.result.status,
          version : results.result.version
        };
    }

    async openWallet(filepath, password) {
        let results = await this.walletRPC.open(filepath, password);
        return results.result;
    };

}

module.exports.SafexPayments = SafexPayments;