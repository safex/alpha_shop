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

let sfx_pay = require('./src/sfx-payments');
const config = require('./config.json');

// Final layer of payments module.
class Payments {

    constructor() {
        this.ledger = new Map;
        this.lastBlockHeightScanned = 0;
        this.scanningSpan = config.scanningSpan;
        this.sfxPayments = new sfx_pay.SafexPayments(config.walletRPCPort, config.nodeRPCPort);
        this.bcHeight = 0;

        // Leaving as data field for possible future use.
        this.handlerListening = setInterval(this.listenForPayments.bind(this), config.listeningPeriod);
        this.handlerClear = setInterval(this.clearLedger.bind(this), config.listeningPeriod * 5);

    }
// Saving next information
//
// paymentId -> {
//                  total_amount => Total amount recorded for paymentId
//                  block_height => Highest block with tx recorded
//                  tx_hashes[]  => Tx hashes associated with paymentId.
//              }
//
    // Summarize payment data to be more friendly to payments checking.
    async summarizeByPamentId(payments) {
        var returnVal = [];
        var processPaymentId = function(paymentId) {
            var total_sum = 0;
            var tx_hashes = [];
            paymentId.txs.forEach((tx) => {
                total_sum += tx.amount;
                tx_hashes.push(tx.tx_hash);
            });

            returnVal.push({
                paymentId : paymentId.paymentId,
                total_amount : total_sum,
                tx_hashes : tx_hashes
            });
        };

        processPaymentId(payments);

        return returnVal;
    }

    /*
    * Getting info for given paymentId for whole bc
    * */
    async getPaymentInfoWholeBC(paymentId) {
        return new Promise((resolve, reject) => {
            this.sfxPayments.getPaymentStatusOne(paymentId).then((vals) => {
                resolve(this.summarizeByPamentId(vals));
            }).catch((err)=> {
               reject(err);
            });
        });
    }

    /*
    * Getting paymentId from intern ledger for book keeping of txs.
    *  */
    async getPaymentInfo(paymentId) {
        return new Promise((resolve, reject) => {
            if(this.ledger.has(paymentId)){
                resolve(this.ledger.get(paymentId));
            }
            else {
                reject(false);
            }
        });
    }

    /*
    * Clearing paymentIds which are not in given time span
    * */
    clearLedger() {
        this.ledger.forEach((value, key) => {
            if (this.lastBlockHeightScanned - value.block_height > this.scanningSpan) {
                this.ledger.delete(key);
            }
        });
    }

    /*
    * Function for updating inner ledger from batch of paymentIds from wallet.
    *  */
    updateLedger(payments) {
        let process = (payment) => {
            // Check if tx exists already recorded in our ledger and process it if its not.
            payment.txs.forEach((tx) => {
                // Recognize short paymentIds
                var pid = payment.paymentId.replace(/0*$/,"");
                if(payment.paymentId.length - pid.length == 48) {
                    payment.paymentId = pid;
                }
                if (!this.ledger.has(payment.paymentId)) {
                    this.ledger.set(payment.paymentId, {total_amount: 0, block_height: 0, tx_hashes: []});
                }

                if (!this.ledger.get(payment.paymentId).tx_hashes.includes(tx.tx_hash)) {
                    this.ledger.get(payment.paymentId).total_amount += tx.amount;
                    this.ledger.get(payment.paymentId).tx_hashes.push(tx.tx_hash);
                    if (tx.block_height > this.ledger.get(payment.paymentId).block_height) {
                        this.ledger.get(payment.paymentId).block_height = tx.block_height;
                    }
                }
            });
        };

        if (payments instanceof Array) {
            payments.forEach(process);
        } else {
            process(payments);
        }
        console.debug("=====================================================================================");
        console.debug(JSON.stringify(JSON.stringify([...(this.ledger)])));
        console.debug(this.lastBlockHeightScanned);
        console.debug("=====================================================================================");
    }

    listenForPayments() {
        // Get payment info from node

        this.sfxPayments.nodeRpc.getLastBlockHeight().then((height) => {
            height = height.result.count;
            if (height > this.lastBlockHeightScanned) {
                this.sfxPayments.getPaymentStatusBulk([], height - this.scanningSpan)
                    .then((payments) => {
                        this.updateLedger(payments, height);

                    });
                this.bcHeight = height;
                this.lastBlockHeightScanned = height - this.scanningSpan;
            }


        });
    }

    /*
    * Get integrated address based on given paymentId
    * */
    async getIntegratedAddress(paymentId) {
        return this.sfxPayments.getIntegratedAddress(paymentId);
    }

    /*
    * Get address of connected wallet
    * */
    async getAddress() {
        return this.sfxPayments.getAddress();
    }

    /*
    * Get hardfork info from node.
    * */
    async getHardForkInfo() {
        return this.sfxPayments.getHardForkInfo();
    }

    /*
    * Blockchain info from connected node.
    * */
    async getInfo() {
        return this.sfxPayments.getInfo();
    }

    /*
    * Opening wallet
    * */
    async openWallet(file, pass) {
        return this.sfxPayments.openWallet(file,pass);
    }
}
    module.exports.Payments = Payments;