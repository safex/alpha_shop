module.exports = {
    query: query
}
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

let createLedgerQuery = 'CREATE TABLE ledger ( paymentId TEXT PRIMARY KEY, block_height INTEGER, total_sum UNSIGNED BIG INT, tx_hashes TEXT)';
let createLegderLog = 'CREATE TABLE ledger_log (timestamp INTEGER, last_block_height)';
let dropLedgerQuery = 'DROP TABLE ledger';

class DB {
    dbPath = '../db/payments.db';

    constructor() {
        let dbExists = fs.existsSync(dbPath);
        this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if(err) {
                // Throw err.
                console.error(err.message);
            }
            else {
                console.log('Connected to the database!!');
            }
        });

        if(!dbExists) {
            // Recreate DB from scratch
            this.query(createLedgerQuery, (err, rows) => {
                if(err) {
                    console.log("CreateLedgerTable DBError: " + err.message);
                }

                this.query(createLegderLog, (err, rows) => {
                   if(err) {
                       console.log("CreateLedgerLOg DBError: " + err.message)
                   }

                   console.log("Base succesfully created!");
                });

            });
        }
    }

    query(queryString, callback) {
        this.db.all(queryString, [], (err, rows) => {
            callback(rows, err);
        });
    }

    // Backup ledger to file as some form of cache
    async backupLedger(ledger, block_height) {
        return new Promise(function (resolve, reject){
            // Drop entire db on file.
            query(dropLedgerQuery, (err, rows) => {
                if(err) {
                    reject(err);
                    return;
                }

                var insertQuery = 'INSERT INTO ledger (paymentId, block_height, total_sum, tx_hashes) VALUES ';
                ledger.forEach((key, value) => {
                    var values = '(' + key + ', ';
                    values += value.block_height.toString() + ', ';
                    values += value.total_sum.toString() + ', ';
                    if(value.tx_hashes.empty()) {
                        values += "'')";
                    }
                    else {
                        value.tx_hashes.forEach((tx_hash) => {
                            values += tx_hash+'#';
                        });
                        values += "'),"
                    }

                    insertQuery += values;
                });

                insertQuery.replace(/,$/,"");
                query(insertQuery, function(err, rows) {
                    if(err) {
                        reject(err);
                    }
                    resolve(true);
                });
            });
        });
    }

    async getLedger() {
        return new Promise((resolve, reject) => {
            this.query("SELECT * FROM ledger", (err, rows) => {
                // @todo tomorrow.
            });
        });
    }
}



