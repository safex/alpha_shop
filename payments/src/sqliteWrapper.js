module.exports = {
    query: query
}

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('db/test.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
   if(err) {
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