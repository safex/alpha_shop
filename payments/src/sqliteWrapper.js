module.exports = {
    query: query
}

let fs = require('fs');
const dbPath = '../db/payments.db';
const sqlite3 = require('sqlite3').verbose();

let dbExsits = fs.existsSync(dbPath);

let db = new sqlite3.Database('db/test.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
   if(err) {
       // Throw err.
       console.error(err.message);
   }
   else {
       console.log('Connected to the database!!');
   }

});

function query(queryString, callback) {
    db.all(queryString, [], (err, rows) => {
            callback(rows, err);
    });
}


if(!dbExsits) {
    // Recreate DB from scratch
    let createLedgerTableQuery = 'CREATE TABLE payments ( paymentId TEXT PRIMARY KEY, block_height INTEGER, total_sum UNSIGNED BIG INT)';
    query(createLedgerTableQuery, (err, rows) => {
        if(err) {
            console.log("DBError: " + JSON.stringify(err));
            return;
        }

    });

}