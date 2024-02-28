const express = require('express')
const session = require('express-session')
var cors = require('cors')
const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: 'argh', // it is good to use random string
    })
)

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))

app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    console.log(req.body)
    var isCorrect = username === 'test' && password === 'test'
    if (isCorrect) {
        req.session.loggedin = true // Initializing session variable - loggedin
        res.send('Successfully logged in !')
    } else {
        res.send('Incorrect Username and/or Password!')
    }
})

app.get('/user', (req, res) => {
    if (req.session.loggedin) {
        // reading loggedin variable
        res.send('Secret content - only for logged users')
    } else {
        res.send('Please login to view this page!')
    }
    res.end()
})

app.listen(8080)
