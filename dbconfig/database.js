const { createPool } = require('mysql');
require('dotenv').config();
 //var util = require('util');
const pool = createPool({
    port:process.env.DBPORT,
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database:  process.env.DATABASE,
    connectionLimit:10,
    dateStrings:'date',
    //  adapter: 'sails-mysql',
    //socketPath : '/Applications/mampstack-7.2.22-0/mysql/tmp/mysql.sock'
       
});

// pool.getConnection(function(err,connection){
//     if (err) {
//       connection.release();
//       throw err;
//     }   

// });

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release()
    return 
});

 //pool.query = util.promisify(pool.query); // Magic happens here.
module.exports = pool;


// var mysql = require('mysql');
// var con = mysql.createConnection({
//     adapter: 'sails-mysql',
//     host: "localhost",
//     port: '3306',
//     user: "root",
//     password: "123456",
//     database:  'liodb',
//     socketPath : '/Applications/mampstack-7.2.22-0/mysql/tmp/mysql.sock'
// });

// con.connect(function(err) {
// 	console.log(err);
//   if (err) throw err;
//   console.log("Connected!");
// });

// module.exports = con;
