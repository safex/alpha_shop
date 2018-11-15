
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

// Set of paymentIds which should be recorded in legder.
let paymentIdsRecorded = new Set;

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

async function addPIDToWatch(paymentId) {
    if(paymentId instanceof string && (paymentId.length == 16 || paymentId.length == 64)) {
        paymentIdsRecorded.add(paymentId);
        resolve(true);
    }
    reject(false);
}

async function removePIDFromWatch(paymentId) {
    if(paymentId instanceof string && (paymentId.length == 16 || paymentId.length == 64)) {
        paymentIdsRecorded.delete(paymentId);
        resolve(true);
    }
    reject(false);
}

async function isWatchingForPID(paymentId) {
    if(paymentId instanceof string && (paymentId.length == 16 || paymentId.length == 64)) {
        resolve(paymentIdsRecorded.has(paymentId));
    }
    reject(false);
}

async function updateLedger(payments) {
    let process = (payment) => {
        if(ledger.has(payment.paymentId)) {
          ledger.set(payment.paymentId, {total_sum: 0, block_height: 0, tx_hashes: []});
        }

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

async function parseTxHashes(tx_hashes) {
    var returnVal = '';
    tx_hashes.forEach((tx)=> {
       returnVal += tx;
       returnVal += "#";
    });
    return returnVal;
}

async function getTxHashes(txString) {
    return txString.split('#');
}

async function listenForPayments() {
    // Get payment info from node
    sfxPayments.getPaymentStatusBulk([...paymentIdsRecorded], lastBlockHeightScanned)
    .then((payments) => {
        updateLedger(payments);
    });

    sfxPayments.getLastBlockHeight().then((height)=>{
        // Get new blockheight -5 to be sure that there is no block missed.
        lastBlockHeightScanned = height - 5;
    });


}

module.exports = {
    summarizeByPamentId : summarizeByPamentId
};