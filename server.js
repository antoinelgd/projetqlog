
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

app.get('/',authenticateToken, async (req,res) => {
    const devices = await getDevices()
    console.log(devices)
    res.render('main',{devices: devices})
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
            const username = {name: req.body.name}
            const accessToken = generateAccessToken(username)
            const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN_SECRET)
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
        const user = {username: req.body.name, email: req.body.email, password: hashedPassword}
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
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(500)
            const accessToken = generateAccessToken({ name: user.name })
            res.cookie('access_token',accessToken)
            res.redirect('back')
          })
    }
    else{
        res.redirect('/login')
    }
})
  
function authenticateToken(req, res, next) {
    if(req.cookies.access_token == undefined){
        if(req.cookies.refresh_token == undefined){
            res.redirect('/login')
        }
        else{
            res.redirect('/refreshAccessToken')
        }
        
    } 
    else{ 
        
        jwt.verify(req.cookies.access_token,process.env.ACCESS_TOKEN_SECRET, (err,user) => {
            if (err) res.redirect('/refreshAccessToken')
            else{
                req.user = user
                next()
            }
        })
    }
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

function checkRefreshToken(refresh_token){
    return new Promise(function(resolve,reject){
        connection.query('SELECT * FROM `refresh_tokens` WHERE token IN (?)', refresh_token, function (error,results,fields){
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

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s' })
}
app.listen(3000,() => {console.log('listening on port 3000')})