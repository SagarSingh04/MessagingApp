const mysql = require('mysql');
const util = require('util');
const config = require('../../config.json');

//Function to promisify database calls
function makeDb() {
    const connection = mysql.createConnection( {
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
    });
    return {
        query( sql, args ) {
            return util.promisify( connection.query )
            .call( connection, sql, args );
        },
        close() {
            return util.promisify( connection.end ).call( connection );
        },
        beginTransaction() {
            return util.promisify( connection.beginTransaction )
              .call( connection );
          },
          commit() {
            return util.promisify( connection.commit )
              .call( connection );
          },
          rollback() {
            return util.promisify( connection.rollback )
              .call( connection );
          }
    };
}

module.exports = { makeDb };