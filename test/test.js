const chai = require('chai')
const should = chai.should()
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
const conn = require('../server').connection
const app = require('../server')
const sinon = require('sinon')
const mockUser = require('../mock/mockUser.json')
const mockDevice = require('../mock/mockDevice.json')

chai.use(chaiAsPromised)

afterEach(() => {
    sinon.restore()
})

describe('User existance', function () {

    const connmock = sinon.mock(conn)

    it('should return true', async function () {

        conn.query('INSERT INTO users (lastname,firstname,email,password,admin) VALUES (?,?,?,?,?)',
            [mockUser.lastname, mockUser.firstname, mockUser.email, mockUser.password, mockUser.admin],
            function (error, results, fields) { })

        const result = await app.checkUserExists(mockUser.email)
        expect(result).to.be.true

        conn.query('DELETE FROM users WHERE email = ?', mockUser.email,
            function (error, results, fields) { })

    })

    it('should return false', async function () {

        const result = await app.checkUserExists(mockUser.email)
        expect(result).to.be.false

    })
})

describe('Date check', function () {
    it('Should return true if a date is between to dates', function () {
        result = app.isDateInsideLoan(2, 1, 3)
        expect(result).to.be.true
    })

    it('Should return false if a date is not between to dates', function () {
        result = app.isDateInsideLoan(4, 1, 3)
        expect(result).to.be.false
    })
})

describe('Loans', function () {
    it('Should return an array which length is equal to the number of loans', async function () {
        conn.query('SELECT count(*) FROM devices JOIN loans ON loans.deviceID = devices.deviceID JOIN users ON loans.borrower = users.regnumber', async function (err, res, fie) {
            const count = res[0]
            const loans = await app.getLoans()
            expect(loans.length).to.be.equal(count)
        })
    })

    it('Should return an array which length is equal to the number of loans of a particular device', async function () {

        conn.query('SELECT count(*) FROM devices JOIN loans ON loans.deviceID = devices.deviceID JOIN users ON loans.borrower = users.regnumber WHERE devices.ref = ?',mockDevice.ref, async function (err, res, fie) {
            const count = res[0]
            const loans = await app.getLoansOfDevice(mockDevice.ref)
            expect(loans.length).to.be.equal(count)
        })
    })

})


describe('Devices', function(){
    it('Should ')
})