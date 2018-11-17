
// Initial testing suggest that this could is working correctly.
// @todo test little bit more
// @todo introduce caching to DB using SQLite3


let sfx_pay = require('./sfx-payments');
const config = require('./config.json');

class Payments {

    constructor() {
        this.ledger = new Map;
        this.lastBlockHeightScanned = 0;
        this.scanningSpan = config.scanningSpan;
        this.acceptancePeriod = config.acceptancePeriod;
        this.sfxPayments = new sfx_pay.SafexPayments(config.walletRPCPort, config.nodeRPCPort);
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

    async getPaymentInfoWholeBC(paymentId) {
        return new Promise((resolve, reject) => {
            this.sfxPayments.getPaymentStatusOne(paymentId).then((vals) => {
                resolve(this.summarizeByPamentId(vals));
            }).catch((err)=> {
               reject(err);
            });
        });
    }

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

    clearLedger() {
        this.ledger.forEach((key, value, ledg) => {
            if (this.lastBlockHeightScanned - value.block_height > this.scanningSpan) {
                this.ledger.delete(key);
            }
        });
    }

    updateLedger(payments, height) {
        let process = (payment) => {
            // Check if tx exists already recorded in our ledger and process it if its not.
            payment.txs.forEach((tx) => {
                if (!this.ledger.has(payment.paymentId)) {
                    this.ledger.set(payment.paymentId, {total_amount: 0, block_height: 0, tx_hashes: []});
                }

                if (!this.ledger.get(payment.paymentId).tx_hashes.includes(tx.tx_hash)) {
                    this.ledger.get(payment.paymentId).total_amount += tx.amount;
                    this.ledger.get(payment.paymentId).tx_hashes.push(tx.tx_hash);
                    if ((height - tx.block_height) < (height - this.ledger.get(payment.paymentId).block_height)) {
                        this.ledger.get(payment.paymentId).block_height = height - tx.block_height;
                    }
                }
            });
        };

        if (payments instanceof Array) {
            payments.forEach(process);
        } else {
            process(payments);
        }
        console.log("=====================================================================================");
        console.log(JSON.stringify(JSON.stringify([...(this.ledger)])));
        console.log(this.lastBlockHeightScanned);
        console.log("=====================================================================================");
    }

    listenForPayments() {
        // Get payment info from node

        this.sfxPayments.nodeRpc.getLastBlockHeight().then((height) => {
            height = height.result.count;
            if (height > this.lastBlockHeightScanned) {
                this.sfxPayments.getPaymentStatusBulk([], height-200)
                    .then((payments) => {
                        this.updateLedger(payments, height);

                    });
                this.lastBlockHeightScanned = height - this.scanningSpan;
            }


        });


    }

    async getIntegratedAddress(paymentId) {
        return this.sfxPayments.getIntegratedAddress(paymentId);
    }

    async getAddress() {
        return this.sfxPayments.getAddress();
    }

    async getHardForkInfo() {
        return this.sfxPayments.getHardForkInfo();
    }

    async getInfo() {
        return this.sfxPayments.getInfo();
    }

    async openWallet(file, pass) {
        return this.sfxPayments.openWallet(file,pass);
    }
}
    module.exports.Payments = Payments;