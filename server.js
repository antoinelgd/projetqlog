
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mysql = require('mysql')
require('dotenv').config()
const cookieParser = require('cookie-parser')


const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE
})
connection.connect()


const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

// app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

module.exports = {
    app,
    connection,
    mainPage,
    loginPage,
    login,
    logout,
    register,
    refreshAccessToken,
    usersPage,
    newUserPage,
    deleteUser,
    newUser,
    editUserPage,
    editUser,
    devicePage,
    newDevice,
    deleteDevice,
    borrowDevicePage,
    borrowDevice,
    borrowingsPage,
    editDevicePage,
    editDevice,
    isUserAdmin,
    checkDeviceAvailability,
    authenticateToken,
    getDevice,
    getDeviceStock,
    getDeviceByID,
    getUser,
    getUserByID,
    getPassword,
    checkUserExists,
    checkRefreshToken,
    getDevices,
    getUsers,
    getBorrowings,
    getBorrowingsOfDevice,
    isDateInsideBorrowing,
    generateAccessToken,
    deleteBorrowing
}
app.get('/', authenticateToken, isUserAdmin, mainPage) 
app.get('/login', loginPage)
app.post('/login', login)
app.post('/logout', logout)
app.get('/register', registerPage)
app.post('/register', register)
app.get('/refreshAccessToken', refreshAccessToken)
app.get('/users', authenticateToken, isUserAdmin,barrier, usersPage)
app.get('/user/new', authenticateToken, isUserAdmin,barrier, newUserPage)
app.delete('/user', authenticateToken, isUserAdmin,barrier, deleteUser)
app.post('/user/new', authenticateToken, isUserAdmin,barrier, newUser)
app.get('/user/edit/:regnumber', authenticateToken,barrier, isUserAdmin, editUserPage)
app.post('/user/edit', authenticateToken, isUserAdmin,barrier, editUser)
app.get('/device', authenticateToken, isUserAdmin,barrier, devicePage)
app.post('/device', authenticateToken, isUserAdmin,barrier, newDevice)
app.delete('/device', authenticateToken, isUserAdmin,barrier, deleteDevice)
app.get('/borrow/:ref', authenticateToken, borrowDevicePage)
app.post('/borrow', authenticateToken, borrowDevice)
app.get('/borrowings', authenticateToken, isUserAdmin,barrier, borrowingsPage)
app.delete('/borrowing',authenticateToken,isUserAdmin,barrier,deleteBorrowing)
app.get('/device/edit/:id', authenticateToken, isUserAdmin,barrier, editDevicePage)
app.post('/device/edit', authenticateToken, isUserAdmin,barrier, editDevice)
app.get('/user/borrowings/:regnumber',authenticateToken,isUserAdmin,barrier, userBorrowingsPage)

async function mainPage(req, res) {
    const devices = await getDevices()
    res.render('main', { devices: devices, admin: req.admin })
}

function loginPage(req, res) {
    res.render('login')
}

async function login(req, res) {
    try {
        const password = await getPassword(req.body.email)
        if (password === undefined) {
            res.redirect('/login')
        }
        if (await bcrypt.compare(req.body.password, password)) {
            // if(req.cookies.refresh_token !== undefined){
            //     if(await checkRefreshToken(req.cookies.refresh_token)){
            //         res.redirect('/refreshAccessToken')
            //     }
            // }
            const accessToken = generateAccessToken({ email: req.body.email })
            const refreshToken = jwt.sign({ email: req.body.email }, process.env.REFRESH_TOKEN_SECRET)
            connection.query('INSERT INTO refresh_tokens (token) VALUES (?)', refreshToken, function (error, results, fields) {
                if (error) throw error
            })

            res.cookie('access_token', accessToken, {
                httpOnly: true
            })
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true
            })
            res.redirect('/')
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        res.status(500).send()
    }
}

function logout(req, res) {
    connection.query('DELETE FROM refresh_tokens WHERE token = ?', req.cookies.refresh_token, function (error, results, fields) {
        if (error) res.sendStatus(500)
    })
    res.clearCookie('access_token')
    res.redirect('/login')
}

function registerPage(req, res) {
    res.render('register')
}

async function register(req, res) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = { lastname: req.body.lastname, firstname: req.body.firstname, email: req.body.email, password: hashedPassword, admin: 0 }
        connection.query('INSERT INTO users SET ?', user, function (error, results, fields) {
            if (error) throw error
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
}

async function refreshAccessToken(req, res) {
    const refreshToken = req.cookies.refresh_token
    if (refreshToken == undefined) res.redirect('/login')
    const token_validity = await checkRefreshToken(refreshToken)
    if (token_validity) {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(500)
            const accessToken = generateAccessToken({ email: decoded.email })
            res.cookie('access_token', accessToken)
            res.redirect('back')
        })
    }
    else {
        res.redirect('/login')
    }
}

async function usersPage(req, res) {
    const users = await getUsers()
    res.render('users', { users: users })
}

function newUserPage(req, res) {
    res.render('user_form')
}

async function newUser(req, res) {
    if (await checkUserExists(req.body.email)) {
        res.redirect('/user/new')
    }
    else {
        let admin
        if (req.body.admin) admin = 1
        else admin = 0
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        connection.query('INSERT INTO users (lastname,firstname,email,password,admin) VALUES (?,?,?,?,?)',
            [req.body.lastname, req.body.firstname, req.body.email, hashedPassword, admin],
            function (error, results, fields) {
                if (error) res.sendStatus(500)
                else {
                    res.redirect('/users')
                }
            })
    }
}


async function deleteUser(req, res) {
    connection.query('DELETE FROM users WHERE email = ?', req.body.email, function (error, results, fields) {
        if (error) res.sendStatus(500)
        else res.sendStatus(200)
    })
}

async function editUserPage(req, res) {
    const user = await getUserByID(req.params.regnumber)
    res.render('user_edit_form', { user: user })
}




async function editUser(req, res) {
    if (req.body.firstname != '') {
        connection.query('UPDATE users SET firstname = ? WHERE regnumber = ?', [req.body.firstname, req.body.regnumber], function (err, res, fields) {
            if (err) throw err
        })
    }
    if (req.body.lastname != '') {
        connection.query('UPDATE users SET lastname = ? WHERE regnumber = ?', [req.body.lastname, req.body.regnumber], function (err, res, fields) {
            if (err) throw err
        })
    }
    if (req.body.email != '') {
        connection.query('UPDATE users SET email = ? WHERE regnumber = ?', [req.body.email, req.body.regnumber], function (err, res, fields) {
            if (err) throw err
        })
    }
    if (req.body.password != '') {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        connection.query('UPDATE users SET password = ? WHERE regnumber = ?', [req.body.hashedPassword, req.body.regnumber], function (err, res, fields) {
            if (err) throw err
        })
    }
    connection.query('UPDATE users SET admin = ? WHERE regnumber = ?', [req.body.admin, req.body.regnumber], function (err, res, fields) {
        if (err) throw err
    })
    res.redirect('/')
}

function devicePage(req, res) {
    res.render('device_form')
}

function newDevice(req, res) {

    connection.query('INSERT INTO devices (name,version,ref,stock) VALUES (?,?,?,?)',
        [req.body.name, req.body.version, req.body.ref, req.body.stock],
        function (error, results, fields) {
            if (error) res.sendStatus(500)
            else {
                res.redirect('/')
            }
        })

}

function deleteDevice(req, res) {
    connection.query('DELETE FROM devices WHERE ref = ?', req.body.ref, function (error, results, fields) {
        if (error) res.sendStatus(500)
        else res.sendStatus(200)
    })
}

function borrowDevicePage(req, res) {
    res.render('borrow_form', { ref: req.params.ref })

}

async function borrowDevice(req, res) {
    const startDate = Date.parse(req.body.startdate)
    const endDate = Date.parse(req.body.enddate)
    const ref = req.body.ref
    if (await checkDeviceAvailability(ref, startDate, endDate)) {
        if (endDate < startDate) {

            res.status(400).render('error', { message: "Dates are not correct (ending date before starting date)" })
        }
        else {

            const deviceID = await getDevice(ref)
            const userID = await getUser(req.useremail)
            if (deviceID == undefined) res.sendStatus(400)
            else {

                connection.query('INSERT INTO borrowings (deviceID,borrowing_start,borrowing_end,borrower) VALUES (?,?,?,?)',
                    [deviceID, req.body.startdate, req.body.enddate, userID],
                    function (err, res, fields) {
                        if (err) throw err
                    })
                res.redirect('../..')
            }


        }
    }
    else res.status(400).render('error', { message: "Device not available on theses dates" })
}

async function borrowingsPage(req, res) {
    const borrowings = await getBorrowings()
    res.render('borrowings', { borrowings: borrowings, admin: req.admin })
}

async function deleteBorrowing(req,res) {
    connection.query('DELETE FROM borrowings WHERE borrowing_id = ?', req.body.id, function (error, results, fields) {
        if (error) res.sendStatus(500)
        else res.sendStatus(200)
    })
}

async function editDevicePage(req, res) {
    const device = await getDeviceByID(req.params.id)
    res.render('deviceEdit_form', { id: req.params.id, device: device })
}

function editDevice(req, res) {
    if (req.body.name != '') {
        connection.query('UPDATE devices SET name = ? WHERE deviceID = ?', [req.body.name, req.body.id], function (err, res, fields) {
            if (err) throw err
        })
    }
    if (req.body.version != '') {
        connection.query('UPDATE devices SET version = ? WHERE deviceID = ?', [req.body.version, req.body.id], function (err, res, fields) {
            if (err) throw err
        })
    }
    if (req.body.ref != '') {
        connection.query('UPDATE devices SET ref = ? WHERE deviceID = ?', [req.body.ref, req.body.id], function (err, res, fields) {
            if (err) throw err
        })
    }
    if (req.body.stock != '') {
        connection.query('UPDATE devices SET stock = ? WHERE deviceID = ?', [req.body.stock, req.body.id], function (err, res, fields) {
            if (err) throw err
        })
    }
    res.redirect('/')
}

async function userBorrowingsPage(req,res){
    const borrowings = await getBorrowingsOfUser(req.params.regnumber)
    res.render('borrowings', { borrowings: borrowings, admin: req.admin })
}



function isUserAdmin(req, res, next) {
    connection.query('SELECT admin FROM users WHERE email = ?', req.useremail, function (error, results, fields) {
        if (error) res.sendStatus(500)
        else if (results.length != 1) res.sendStatus(400)
        else if (results[0].admin) {
            req.admin = true
        }
        else {
            req.admin = false
        }
        next()
    })
}

async function checkDeviceAvailability(ref, startDate, endDate) {
    const borrowings = await getBorrowingsOfDevice(ref)
    let stockAvailable = await getDeviceStock(ref)
    borrowings.forEach(borrowing => {
        if (isDateInsideBorrowing(Date.parse(borrowing.borrowing_start), startDate, endDate)) stockAvailable--
        else if (isDateInsideBorrowing(Date.parse(borrowing.borrowing_end), startDate, endDate)) stockAvailable--
        else if (isDateInsideBorrowing(startDate, Date.parse(borrowing.borrowing_start), Date.parse(borrowing.borrowing_end))) stockAvailable--
        else if (isDateInsideBorrowing(endDate, Date.parse(borrowing.borrowing_start), Date.parse(borrowing.borrowing_end))) stockAvailable--

    });
    if (stockAvailable < 1) return false
    else return true
}

function authenticateToken(req, res, next) {
    if (req.cookies.access_token == undefined) {
        if (req.cookies.refresh_token == undefined) {
            res.redirect('/login')
        }
        else {
            res.redirect('/refreshAccessToken')
        }

    }
    else {
        jwt.verify(req.cookies.access_token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) res.redirect('/refreshAccessToken')
            else {
                req.useremail = decoded.email
                next()
            }
        })
    }
}

function getDevice(ref) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT deviceID FROM devices WHERE ref = ?', ref, function (err, res, fields) {
            if (err) throw err
            if (res.length != 1) resolve(undefined)
            else resolve(res[0].deviceID)
        })
    })
}

function getDeviceStock(ref) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT stock FROM devices WHERE ref = ?', ref, function (err, res, fields) {
            if (err) throw err
            if (res.length != 1) resolve(undefined)
            else resolve(res[0].stock)
        })
    })
}

function getDeviceByID(id) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT name,version,ref,stock FROM devices WHERE deviceID = ?', id, function (err, res, fields) {
            if (err) throw err
            if (res.length != 1) resolve(undefined)
            else resolve(res[0])
        })
    })
}

function getUser(email) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT regnumber FROM users WHERE email = ?', email, function (err, res, fields) {
            if (err) throw err
            if (res.length != 1) resolve(undefined)
            else resolve(res[0].regnumber)
        })
    })
}

function getUserByID(regnumber) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT * FROM users WHERE regnumber = ?', regnumber, function (err, res, fields) {
            if (err) throw err
            if (res.length != 1) resolve(undefined)
            else resolve(res[0])
        })
    })
}

function getPassword(email) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT password FROM users WHERE email = ?', email, function (error, results, fields) {
            if (error)
                throw error
            if (results.length != 1) resolve(undefined)
            else resolve(results[0].password)
        }
        )
    }
    )
}

function checkUserExists(email) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT regnumber FROM users WHERE email = ?', email, function (err, res, fields) {
            if (err) throw err
            if (res.length == 1) resolve(true)
            else resolve(false)
        })
    })
}

function checkRefreshToken(refresh_token) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT * FROM refresh_tokens WHERE token IN (?)', refresh_token, function (error, results, fields) {
            if (error)
                throw error
            if (results.length != 1) resolve(false)
            else resolve(true)
        })
    })
}



function getDevices() {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT * FROM devices', function (err, res, fie) {
            if (err) throw err
            resolve(res)
        })
    })
}

function getUsers() {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT firstname,lastname,email,admin,regnumber FROM users', function (err, res, fie) {
            if (err) throw err
            resolve(res)
        })
    })
}

function getBorrowings() {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT name, borrowing_start, borrowing_end, regnumber, borrowing_id FROM devices JOIN borrowings ON borrowings.deviceID = devices.deviceID JOIN users ON borrowings.borrower = users.regnumber', function (err, res, fie) {
            if (err) throw err
            resolve(res)
        })
    })
}

function getBorrowingsOfDevice(ref) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT name, borrowing_start, borrowing_end, regnumber, borrowing_id, stock FROM devices JOIN borrowings ON borrowings.deviceID = devices.deviceID JOIN users ON borrowings.borrower = users.regnumber WHERE devices.ref = ?', [ref], function (err, res, fie) {
            if (err) throw err
            resolve(res)
        })
    })
}

function getBorrowingsOfUser(regnumber) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT name, borrowing_start, borrowing_end, regnumber, borrowing_id, stock FROM devices JOIN borrowings ON borrowings.deviceID = devices.deviceID JOIN users ON borrowings.borrower = users.regnumber WHERE users.regnumber = ?', [regnumber], function (err, res, fie) {
            if (err) throw err
            resolve(res)
        })
    })
}

function isDateInsideBorrowing(date, borrowingStart, borrowingEnd) {
    if (date >= borrowingStart && date <= borrowingEnd) {
        return true
    }
    else return false
}

function generateAccessToken(email) {
    return jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
}

function barrier(req,res,next){
    if(req.admin != 1){
        res.redirect('/')
    }
    else{
        next()
    }
}

app.listen(3000, () => { console.log('listening on port 3000') })