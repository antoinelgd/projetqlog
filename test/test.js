const chai = require('chai')
const expect = chai.expect
const should = require('chai').should()
const conn = require('../server').connection
const app = require('../server')
const appli = require('../server').app
const mockUser = require('../mock/mockUser.json')
const mockDevice = require('../mock/mockDevice.json')
const request = require('supertest')


afterEach(function(){
    conn.query('DELETE FROM users WHERE email = ?','user@mock',function (err, res, fie) {
    })
})
describe('Routes', function () {

    describe('Logout', function () {
        it('Should redirect to /login', function () {
            request(appli)
                .post('/logout')
                .set('Cookie', ['refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGxvY2FNYXQuZnIiLCJpYXQiOjE2MTAyMDg0Mjl9.D7CW3Uicy_cALdaX5ZT8gLpCLrfjis1n4T7OtMvicvA'])
                .then((res) => {
                    res.header['location'].should.include('/login')
                    res.header['set-cookie'].should.be.undefined
                })
        })
    })

    describe('Register', function () {
        it('Should render register page', function () {
            request(appli)
                .get('/register')
                .end((err, res) => {
                    expect(res.text).not.to.be.undefined
                })
        })

        it('Should render register page', function () {
            request(appli)
                .post('/register')
                .send({ lastname: 'mock', firstname: 'user', email: 'user@mock', password: 'mock' })
                .end((err, res) => {
                    res.header['location'].should.include('/login')
                })
        })
        
    })

 

    describe('Main', function () {
        it('Should redirect to /login', function () {
            request(appli)
                .get('/')
                .then((res) => {
                    res.header['location'].should.include('/login')
                })
        })

        it('Should redirect to /refreshAccessToken', function () {
            request(appli)
                .get('/')
                .set('Cookie', ['refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGxvY2FNYXQuZnIiLCJpYXQiOjE2MTAyMDg0Mjl9.D7CW3Uicy_cALdaX5ZT8gLpCLrfjis1n4T7OtMvicvA'])
                .then((res) => {
                    res.header['location'].should.include('/login')

                })
        })
    })


    describe('RefreshAccessToken', function () {
        it('Should redirect to / and give an access token', function () {
            request(appli)
                .get('/refreshAccessToken')
                .set('Cookie', ['refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGxvY2FNYXQuZnIiLCJpYXQiOjE2MTAyMDg0Mjl9.D7CW3Uicy_cALdaX5ZT8gLpCLrfjis1n4T7OtMvicvA'])
                .then((res) => {
                    res.header['location'].should.include('/')
                    res.header['set-cookie'].should.not.be.undefined
                })
        })
    })


    describe('Login', function () {
        it('should redirect to /', function () {
            request(appli)
                .post('/login')
                .send({ email: 'admin@locaMat.fr', password: 'passwordAdmin' })
                .then((res) => {
                    res.header['location'].should.include('/')
                })
        })

        it('should redirect to /login', function () {
            request(appli)
                .post('/login')
                .send({ email: 'admin@locaMat.fr', password: undefined })
                .then((res) => {
                    res.header['location'].should.include('/login')
                })
        })

        it('Should render login page', function () {
            request(appli)
                .get('/login')
                .end((err, res) => {
                    expect(res.text).not.to.be.undefined
                })
        })
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

    it('Should return the password of the user', async function () {
        const password = await app.getPassword(mockUser.email)
        expect(password).to.be.equal(mockUser.password)

    })

    it('Should return the regnumber of the user', async function () {
        const password = await app.getUser('admin@locaMat.fr')
        expect(password).to.be.equal(1000015)
    })

    it('Should return user coresponding to the regnumber', async function () {
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

    it('Should return device stock', async function () {
        const stock = await app.getDeviceStock(mockDevice.ref)
        expect(mockDevice.stock).to.be.equal(stock)
    })

    it('Should return device id', async function () {
        const id = await app.getDevice(mockDevice.ref)
        expect(mockDevice.deviceID).to.be.equal(id)
    })

    it('Should return device given its ID', async function () {
        const device = await app.getDeviceByID(mockDevice.deviceID)
        expect(device.name).to.be.equal(mockDevice.name)
    })
})


