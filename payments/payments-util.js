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

let paymentIdsRecorded = new Set;
let ledger = new Map;

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

}

module.exports = {
    summarizeByPamentId : summarizeByPamentId
};