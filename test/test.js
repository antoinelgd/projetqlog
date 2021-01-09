const chai = require('chai')
const should = chai.should()
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
const conn = require('../server').connection
const app = require('../server')
const server = require('../server').app
const sinon = require('sinon')
const mockUser = require('../mock/mockUser.json')
const mockDevice = require('../mock/mockDevice.json')
const bcrypt = require('bcrypt')

chai.use(chaiAsPromised)

afterEach(() => {
    sinon.restore()
})

describe('Users', function () {

    const connmock = sinon.mock(conn)

    it('should return true if user exists', async function () {

        conn.query('INSERT INTO users (lastname,firstname,email,password,admin) VALUES (?,?,?,?,?)',
            [mockUser.lastname, mockUser.firstname, mockUser.email, mockUser.password, mockUser.admin],
            function (error, results, fields) { })

        const result = await app.checkUserExists(mockUser.email)
        expect(result).to.be.true

        conn.query('DELETE FROM users WHERE email = ?', mockUser.email,
            function (error, results, fields) { })

    })

    it('Should return an array which length is equal to the number of users in database', async function () {

        conn.query('SELECT count(*) FROM users', async function (err, res, fie) {
            const count = res[0]
            const users = await app.getUsers()
            expect(users.length).to.be.equal(count)
        })
    })

    it('Should return the password of the user', async function(){
        conn.query('INSERT INTO users (lastname,firstname,email,password,admin) VALUES (?,?,?,?,?)',
        [mockUser.lastname, mockUser.firstname, mockUser.email, mockUser.password, mockUser.admin],
        function (error, results, fields) { })

        const password = await app.getPassword(mockUser.email)
        expect(password).to.be.equal(mockUser.password)

        conn.query('DELETE FROM users WHERE email = ?', mockUser.email,
        function (error, results, fields) { })

    })

    it('Should return the regnumber of the user', async function(){
        const password = await app.getUser('admin@locaMat.fr')
        expect(password).to.be.equal(1000015)
    })



})

describe('Date check', function () {
    it('Should return true if a date is between to dates', function () {
        result = app.isDateInsideBorrowing(2, 1, 3)
        expect(result).to.be.true
    })

    it('Should return false if a date is not between to dates', function () {
        result = app.isDateInsideBorrowing(4, 1, 3)
        expect(result).to.be.false
    })
})

describe('Borrowings', function () {
    it('Should return an array which length is equal to the number of borrowings', async function () {
        conn.query('SELECT count(*) FROM devices JOIN borrowings ON borrowings.deviceID = devices.deviceID JOIN users ON borrowings.borrower = users.regnumber', async function (err, res, fie) {
            const count = res[0]
            const borrowings = await app.getBorrowings()
            expect(borrowings.length).to.be.equal(count)
        })
    })

    it('Should return an array which length is equal to the number of borrowings of a particular device', async function () {

        conn.query('SELECT count(*) FROM devices JOIN borrowings ON borrowings.deviceID = devices.deviceID JOIN users ON borrowings.borrower = users.regnumber WHERE devices.ref = ?', mockDevice.ref, async function (err, res, fie) {
            const count = res[0]
            const borrowings = await app.getBorrowingsOfDevice(mockDevice.ref)
            expect(borrowings.length).to.be.equal(count)
        })
    })

    it('Should return an array which length is equal to the number of borrowings of a particular user', async function () {

        conn.query('SELECT count(*) FROM devices JOIN borrowings ON borrowings.deviceID = devices.deviceID JOIN users ON borrowings.borrower = users.regnumber WHERE users.regnumber = ?', mockUser.regnumber, async function (err, res, fie) {
            const count = res[0]
            const borrowings = await app.getBorrowingsOfUser(mockUser.regnumber)
            expect(borrowings.length).to.be.equal(count)
        })
    })

})


describe('Devices', function () {
    it('Should return an array which length is equal to the number of devices', async function () {

        conn.query('SELECT count(*) FROM devices', async function (err, res, fie) {
            const count = res[0]
            const devices = await app.getBorrowingsOfUser(mockUser.regnumber)
            expect(devices.length).to.be.equal(count)
        })
    })
})

describe('Tokens', function(){
    it('')
})