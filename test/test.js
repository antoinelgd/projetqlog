const chai = require('chai')
const expect = chai.expect
const conn = require('../server').connection
const app = require('../server')
const mockUser = require('../mock/mockUser.json')
const mockDevice = require('../mock/mockDevice.json')
const request = require('supertest')



describe('Routes', function(){
    it('should redirect to /login', function(){
        request(app)
            .post('/login')
            .send({email: 'admin@locaMat.fr', password: ''})
            .expect('Location', '/login')
            .end(done)
    })
})

describe('Users', function () {

    it('should return true if user exists', async function () {

        const result = await app.checkUserExists(mockUser.email)
        expect(result).to.be.true

    })

    it('Should return an array which length is equal to the number of users in database', async function () {

        conn.query('SELECT count(*) FROM users', async function (err, res, fie) {
            const count = res[0]
            const users = await app.getUsers()
            expect(users.length).to.be.equal(count)
        })
    })

    it('Should return the password of the user', async function(){
        const password = await app.getPassword(mockUser.email)
        expect(password).to.be.equal(mockUser.password)

    })

    it('Should return the regnumber of the user', async function(){
        const password = await app.getUser('admin@locaMat.fr')
        expect(password).to.be.equal(1000015)
    })

    it('Should return user coresponding to the regnumber', async function(){
        const user = await app.getUserByID(5555555)
        expect(user.email).to.be.equal(mockUser.email)
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
            const devices = await app.getDevices()
            expect(devices.length).to.be.equal(count)
        })
    })

    it('Should return device stock', async function(){
        const stock = await app.getDeviceStock(mockDevice.ref)
        expect(mockDevice.stock).to.be.equal(stock)
    })

    it('Should return device id', async function(){
        const id = await app.getDevice(mockDevice.ref)
        expect(mockDevice.deviceID).to.be.equal(id)
    })

    it('Should return device given its ID', async function(){
        const device = await app.getDeviceByID(mockDevice.deviceID)
        expect(device.name).to.be.equal(mockDevice.name)
    })
})


