'use strict';

const db = require ( './database' );

module.exports = require ( 'knex' ) ( {
client : db.driver ,
//debug: true,
connection : {
  host : db.host ,
  user : db.user ,
  password : db.password ,
  database : db.database ,
  strict: false,
  charset : 'utf8mb4' ,
  collation : 'utf8mb4_unicode_ci'
} , log : {
    warn ( message ) {
    console.log ( 'warn' , message )
    } ,
    error ( message ) {
    console.log ( 'error' , message )
    } ,
    deprecate ( message ) {
    console.log ( 'deprecate' , message )
    } ,
    debug ( message ) {
    console.log ( 'debug' , message )
    }
    }
}),
    ('catch', function ( errnoError ) {
    console.log ( errnoError )
    }
)
