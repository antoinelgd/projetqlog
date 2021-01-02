
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
app.use(express.urlencoded({extended: false}))

// app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())


const test = {}

app.get('/',authenticateToken, isUserAdmin, async (req,res) => {
    const devices = await getDevices()
    res.render('main',{devices: devices, admin: req.admin})
})

app.get('/login', (req,res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    try {
        const password = await getPassword(req.body.email)
        if(password === undefined){
            res.redirect('/login')
        }
        if(await bcrypt.compare(req.body.password, password)){ 
            // if(req.cookies.refresh_token !== undefined){
            //     if(await checkRefreshToken(req.cookies.refresh_token)){
            //         res.redirect('/refreshAccessToken')
            //     }
            // }
            const accessToken = generateAccessToken({email: req.body.email})
            const refreshToken = jwt.sign({email: req.body.email}, process.env.REFRESH_TOKEN_SECRET)
            connection.query('INSERT INTO refresh_tokens (token) VALUES (?)', refreshToken, function (error,results,fields){
                if(error) throw error
            })
            
            res.cookie('access_token',accessToken,{
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
})

app.post('/logout', (req,res) => {
    connection.query('DELETE FROM refresh_tokens WHERE token = ?', req.cookies.refresh_token, function(error, results, fields){
        if (error) res.sendStatus(400)
    })
    res.clearCookie('access_token')
    res.redirect('/login')
})

app.get('/register', (req,res) => {
    res.render('register')
})

app.post('/register', async (req,res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password,10)
        const user = {username: req.body.name, email: req.body.email, password: hashedPassword, admin: 0}
        connection.query('INSERT INTO users SET ?', user, function (error,results,fields){
            if(error)throw error
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})



app.get('/refreshAccessToken', async (req, res) => {
    const refreshToken = req.cookies.refresh_token
    if (refreshToken == undefined) res.redirect('/login')
    const token_validity = await checkRefreshToken(refreshToken)
    if (token_validity){
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(500)
            const accessToken = generateAccessToken({ email: decoded.email })
            res.cookie('access_token',accessToken)
            res.redirect('back')
          })
    }
    else{
        res.redirect('/login')
    }
})

app.get('/users', async (req,res) => {
    const users = await getUsers()
    res.render('users',{users: users})
})

app.get('/user/new', (req,res) => {
    res.render('user_form')
})

app.post('/user/new', async (req,res) => {
    if(await checkUserExists(req.body.email)){
        res.redirect('/user/new')
    }
    else{
        let admin
        if(req.body.admin) admin = 1
        else admin = 0
        const hashedPassword = await bcrypt.hash(req.body.password,10)
        connection.query('INSERT INTO users (username,email,password,admin) VALUES (?,?,?,?)',
            [req.body.name, req.body.email, hashedPassword, admin],
            function(error,results,fields){
                if(error) res.sendStatus(500) 
                else {
                    res.redirect('/users')
                }
            })
    }
})

app.delete('/user', async (req,res) => {
    connection.query('DELETE FROM users WHERE email = ?', req.body.email, function(error,results,fields){
        if(error) res.sendStatus(500)
        else res.sendStatus(200)
    })
})
  
app.get('/device', (req,res) => {
    res.render('device_form')
})

app.post('/device', (req,res) => {

    connection.query('INSERT INTO devices (name,version,ref,stock) VALUES (?,?,?,?)',
        [req.body.name, req.body.version, req.body.ref, req.body.stock],
        function(error,results,fields){
            if(error) res.sendStatus(500) 
            else {
                res.redirect('/')
            }
        })
        
})

app.delete('/device',authenticateToken,isUserAdmin, (req,res) => {
    connection.query('DELETE FROM devices WHERE ref = ?', req.body.ref, function(error,results,fields){
        if(error) res.sendStatus(500)
        else res.sendStatus(200)
    })
})

app.get('/borrow/:ref',authenticateToken,(req,res) => {
    res.render('borrow_form',{ref: req.params.ref})
})
app.post('/borrow', authenticateToken, async (req,res) => {
    console.log("bruh")
    const startDate = Date.parse(req.body.startdate)
    const endDate = Date.parse(req.body.enddate)
    const ref = req.body.ref
    if(endDate < startDate){
        
        res.redirect('back')
    }
    else{
        
        const deviceID = await getDevice(ref)
        const userID = await getUser(req.useremail)
        console.log(deviceID)
        console.log(userID)
        if(deviceID == undefined) res.sendStatus(400)
        else{
            
            connection.query('INSERT INTO loans (deviceID,loan_start,loan_end,borrower) VALUES (?,?,?,?)',
                [deviceID,req.body.startdate,req.body.enddate,userID],
                function(err,res,fields){
                    if(err) throw err
            })
            res.redirect('../..')
        }

        
    }
})

app.get('/loans',authenticateToken,isUserAdmin, async (req,res) => {
    const loans = await getLoans()
    res.render('loans',{loans: loans, admin: req.admin})
})

app.get('/device/edit/:id', authenticateToken, isUserAdmin, async (req,res) => {
    const device = await getDeviceByID(req.params.id)
    //console.log(device)
    res.render('deviceEdit_form',{id: req.params.id, device: device})
})

app.post('/device/edit', authenticateToken, isUserAdmin, (req,res) => {
    console.log(req.body)
    if(req.body.name != ''){
        connection.query('UPDATE devices SET name = ? WHERE deviceID = ?',[req.body.name,req.body.id],function (err,res,fields){
            if(err) throw err
        })
    }
    if(req.body.version != ''){
        connection.query('UPDATE devices SET version = ? WHERE deviceID = ?',[req.body.version,req.body.id],function (err,res,fields){
            if(err) throw err
        })
    }
    if(req.body.ref != ''){
        connection.query('UPDATE devices SET ref = ? WHERE deviceID = ?',[req.body.ref,req.body.id],function (err,res,fields){
            if(err) throw err
        })
    }
    if(req.body.stock != ''){
        connection.query('UPDATE devices SET stock = ? WHERE deviceID = ?',[req.body.stock,req.body.id],function (err,res,fields){
            if(err) throw err
        })
    }
    res.redirect('/')
})

function isUserAdmin(req,res,next){
    connection.query('SELECT admin FROM users WHERE email = ?',req.useremail , function (error,results,fields) {
        if (error) res.sendStatus(500)
        else if (results.length != 1) res.sendStatus(400)
        else if (results[0].admin){
            req.admin = true
        }
        else{
            req.admin = false
        }
        next()
    })
}

function authenticateToken(req, res, next) {
    console.log("auth")
    if(req.cookies.access_token == undefined){
        if(req.cookies.refresh_token == undefined){
            res.redirect('/login')
        }
        else{
            res.redirect('/refreshAccessToken')
        }
        
    } 
    else{ 
        jwt.verify(req.cookies.access_token,process.env.ACCESS_TOKEN_SECRET, (err,decoded) => {
            if (err) res.redirect('/refreshAccessToken')
            else{
                req.useremail = decoded.email
                next()
            }
        })
    }
}

function getDevice(ref){
    return new Promise(function(resolve,reject){
        connection.query('SELECT deviceID FROM devices WHERE ref = ?',ref,function(err,res,fields){
            if(err) throw err
            if (res.length != 1) resolve(undefined)
            else resolve(res[0].deviceID)
        })
    })
}

function getDeviceByID(id){
    return new Promise(function(resolve,reject){
        connection.query('SELECT name,version,ref,stock FROM devices WHERE deviceID = ?',id,function(err,res,fields){
            if(err) throw err
            if (res.length != 1) resolve(undefined)
            else resolve(res[0])
        })
    })
}

function getUser(email){
    return new Promise(function(resolve,reject){
        connection.query('SELECT userid FROM users WHERE email = ?',email,function(err,res,fields){
            if(err) throw err
            if (res.length != 1) resolve(undefined)
            else resolve(res[0].userid)
        })
    })
}

function getUserEmail(id){
    return new Promise(function(resolve,reject){
        connection.query('SELECT email FROM users WHERE userid = ?',id,function(err,res,fields){
            if(err) throw err
            if (res.length != 1) resolve(undefined)
            else resolve(res[0].email)
        })
    })
}

function getPassword(email){
    return new Promise(function(resolve,reject){
        connection.query('SELECT password FROM users WHERE email = ?', email, function (error, results, fields) {
        if (error)
            throw error
        if (results.length != 1) resolve(undefined)
        else resolve(results[0].password)
        }
    )}
)}

function checkUserExists(email){
    return new Promise(function(resolve,reject){
        connection.query('SELECT username FROM users WHERE email = ?',email, function (err,res,fields){
            if (err) throw err
            if (res.length == 1) resolve(true)
            else resolve(false)
        })
    })
}

function checkRefreshToken(refresh_token){
    return new Promise(function(resolve,reject){
        connection.query('SELECT * FROM refresh_tokens WHERE token IN (?)', refresh_token, function (error,results,fields){
        if (error)
            throw error
        if (results.length != 1) resolve(false)
        else resolve(true)
        })
    })
}

function getDevices(){
    return new Promise(function(resolve,reject){
        connection.query('SELECT * FROM devices', function (err,res,fie){
            if(err) throw err
            resolve(res)
        })
    })
}

function getUsers(){
    return new Promise(function(resolve,reject){
        connection.query('SELECT username,email,admin FROM users', function (err,res,fie){
            if(err) throw err
            resolve(res)
        })
    })
}

function getLoans(){
    return new Promise(function(resolve,reject){
        connection.query('SELECT name, loan_start, loan_end, username, loan_id FROM devices JOIN loans ON loans.deviceID = devices.deviceID JOIN users ON loans.borrower = users.userid', function (err,res,fie){
            if(err) throw err
            resolve(res)
        })
    })
}

function generateAccessToken(email) {
    return jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s' })
}
app.listen(3000,() => {console.log('listening on port 3000')})