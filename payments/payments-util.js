
let sfx_pay = require('./index');
const config = require('./config.json');

// Summarize payment data to be more friendly to payments checking.
async function summarizeByPamentId(payments) {
    var returnVal = [];
    var processPaymentId = function(paymentId) { var total_sum = 0;
        var tx_hashes = [];
        paymentId.txs.forEach((tx) => {
            total_sum += tx.amount;
            tx_hashes.push(tx.tx_hash);
        });

        returnVal.push({
            paymentId : paymentId.paymentId,
            total_amount : total_sum,
            txs : tx_hashes
        });
    };
    if(payments instanceof Array) {
        payments.forEach(processPaymentId(paymentId));
    }
    else {
        processPaymentId(payments);
    }

    return returnVal;
}

// Bunch of methods to keep some form ledger of actual payments and make SafexPaymentModule
// active element instead of simple proxy.
// Idea is to ping periodically wallet to see if there was any txs with targeted paymentIds.
// update ledger and keep going, so external element can be freed of book keeping duties.git st

// Saving next information
//
// paymentId -> {
//                  total_amount => Total amount recorded for paymentId
//                  block_height => Highest block with tx recorded
//                  tx_hashes[]  => Tx hashes associated with paymentId.
//              }
//
let ledger = new Map;

var lastBlockHeightScanned = 0;
let sfxPayments = new sfx_pay.SafexPayments(config.walletRPCPort, config.nodeRPCPort);

async function addPaymentId(paymentId) {
    if(paymentId instanceof string && (paymentId.length == 16 || paymentId.length == 64)) {
        ledger.set(paymentId, {total_amount: 0, block_height: 0, tx_hashes: []});
        resolve(true);
    }
    reject(false);
}

async function removePaymentId(paymentId) {
    if(paymentId instanceof string && (paymentId.length == 16 || paymentId.length == 64)) {
        ledger.delete(paymentId);
        resolve(true);
    }
    reject(false);
}

async function isWatchingForPID(paymentId) {
    if(paymentId instanceof string && (paymentId.length == 16 || paymentId.length == 64)) {
        resolve(ledger.has(paymentId));
    }
    reject(false);
}

async function updateLedger(payments) {
    let process = (payment) => {
        // Check if tx exists already recorded in our ledger and process it if its not.
        payment.txs.forEach((tx) => {
            if(!ledger.get(payment.paymentId).tx_hashes.includes(tx.tx_hash)){
                ledger.get(payment.paymentId).total_amount += tx.amount;
                ledger.get(payment.paymentId).txs.push(tx.tx_hash);
                if(tx.block_height > ledger.get(payment.paymentId).block_height) {
                    ledger.get(payment.paymentId).block_height = tx.block_height;
                }
            }
        });
    };

    if(payments instanceof Array){
        payments.forEach(process(payment));
    }
    else {
        process(payments);
    }
}

async function listenForPayments() {
    // Get payment info from node
    console.log("=====================================================================================");
    console.log(JSON.stringify([...ledger]));
    console.log(JSON.stringify(lastBlockHeightScanned));
    console.log("=====================================================================================");

    sfxPayments.getLastBlockHeight().then((height)=>{
        if(height > lastBlockHeightScanned) {
            sfxPayments.getPaymentStatusBulk(Object.keys(ledger.keys()), lastBlockHeightScanned)
                .then((payments) => {
                    updateLedger(payments);
                });
            lastBlockHeightScanned = height;
        }
    });


}

module.exports = {
    summarizeByPamentId : summarizeByPamentId,
    addPaymentId : addPaymentId,
    removePaymentId : removePaymentId,
    isWatchingForPID : isWatchingForPID,
    listenForPayments : listenForPayments
};