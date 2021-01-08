const assert = require('chai').assert
const app = require('../server')
const mysql = require('mysql')
const sinon = require('sinon')



const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE
})

describe('Users', function(){
    it('should return true', function(){
         
    })
})