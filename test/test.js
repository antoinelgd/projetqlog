const assert = require('chai').assert
const app = require('../server')
const mysql = require('mysql')



const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE
})

describe('App', function(){
    it('should return users', function(){
        let result = app.sayHello();
        assert.equal(result,'hello')
    })
})