const express = require('express')
var multer = require('multer')
var cookieParser = require('cookie-parser')

var cors = require('cors')
const passport = require('passport')
var LdapStrategy = require('passport-ldapauth')

const fs = require('fs')
const path = require('path')

var routerApi = require('./apiRoutes.js')
var routerAdmin = require('./adminRoutes.js')

const config = require('./config.js')
const db = require('./db.js')

const genericError = 'Something broke :/'
const unauthorized = "Vous n'avez pas la permission de faire cette requête..."

const imageStorage = multer.diskStorage({
    destination: config.UPLOAD_DIR,
})
const upload = multer({
    storage: imageStorage,
    limits: {
        fileSize: config.UPLOAD_FILESIZE_LIMIT,
    },
})

// ------------------------ MIDDLEWARE --------------------------

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(
    cors({
        origin: config.ALLOWED_ORIGIN,
        methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
        credentials: true,
    })
)

app.use(passport.initialize())

passport.use(
    new LdapStrategy({
        server: {
            url: 'ldaps://ldap.hyris.tv/',
            searchBase: 'ou=people,dc=hyris,dc=tv',
            searchFilter: '(|(cn={{username}})(uid={{username}}))',

            bindDN: 'cn=matos,ou=apps,dc=hyris,dc=tv',
            bindCredentials: config.LDAP_MDP,
        },
    })
)

passport.serializeUser(function (user, done) {
    return done(null, user)
})

passport.deserializeUser(function (user, done) {
    return done(null, user)
})

var sessionMiddleware = (adminNeeded) =>
    function (req, res, next) {
        if (!req.body.session) {
            console.log('User tried to make a request without session id')
            return res.status(401).send(unauthorized)
        }
        db.getSession(req.body.session, (err, success, session) => {
            if (err) {
                console.log(err)
                res.status(500).send(genericError)
                return next(err)
            }
            if (!success) {
                console.log('Unauthorized user tried to log in')
                return res.status(401).send(unauthorized)
            }
            if (adminNeeded && !session.admin) {
                console.log('Unauthorized user tried to make an admin request')
                return res.status(401).send(unauthorized)
            }
            db.updateSession(session.id, (err) => {
                console.log(err)
            })
            req.sess = session
            return next()
        })
    }

// ------------------------ ROUTES --------------------------

app.post('/login', (req, res, next) => {
    var devUser = { uid: 'dev', displayName: 'Dev' }
    if (config.SKIP_AUTH === 1) {
        db.createSession(devUser, (err, sess) => {
            if (err) return next(err)
            console.log('User logged in as Dev')
            return res.send({ success: true, user: devUser, admin: sess.user.admin, sessionId: sess.id })
        })
    } else {
        passport.authenticate('ldapauth', (err, user, info) => {
            if (err) {
                console.log(err)
                return res.status(500).send(genericError)
            }
            if (!user) {
                return res.status(401).send({ success: false, message: 'Wrong credentials' })
            } else {
                db.createSession(user, (err, sess) => {
                    if (err) return next(err)
                    console.log('User logged in as ' + user.displayName)
                    return res.send({ success: true, user: user, admin: sess.user.admin, sessionId: sess.id })
                })
            }
        })(req, res, next)
    }
})

app.use(upload.any())
app.use(express.static(__dirname + '/public'))
app.use('/api', sessionMiddleware(false), routerApi)
app.use('/admin', sessionMiddleware(true), routerAdmin)

app.post('/addImage', sessionMiddleware(true), (req, res) => {
    const { filename, path } = req.files[0]
    const item_id = req.body.id

    db.addImage(item_id, filename, (error) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        res.status(200).send('Successfully recieved')
    })
})

app.get('/image/:filename', (req, res) => {
    const filename = req.params.filename
    const readStream = fs.createReadStream(path.join(__dirname, 'uploads', filename))
    readStream.pipe(res)
})

app.get('/cleanup', (req, res) => {
    try {
        db.removeUnusedImages()
        res.send('Success')
    } catch (err) {
        console.log(err)
        res.send(genericError)
    }
})

const port = config.PORT || 8080
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})
