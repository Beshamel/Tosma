var express = require('express')
var router = express.Router()

const db = require('./db.js')
const config = require('./config.js')
const util = require('./util')

const genericError = 'Something broke :/'
const missingData = 'Data not found'

router.post('/removeImage', (req, res) => {
    const id = req.body.id
    const filename = req.body.filename

    db.removeImage(id, (error) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        util.deleteFile(config.UPLOAD_DIR + '/' + filename)
        res.status(200).send('Successfully removed')
    })
})

router.post('/addEntry', (req, res) => {
    const name = req.body.name
    const desc = req.body.desc
    const available = req.body.available
    const category = req.body.category
    const quantity = req.body.quantity

    db.addItem(name, desc, available, category, quantity, (error) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        res.status(200).send('Successfully recieved')
    })
})

router.post('/removeEntry', (req, res) => {
    const id = req.body.id

    db.removeItem(id, (error) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        res.status(200).send('Successfully removed entry')
    })
})

router.post('/modifEntry', (req, res) => {
    const id = req.body.id
    const name = req.body.name
    const desc = req.body.desc
    const available = req.body.available
    const category = req.body.category
    const quantity = req.body.quantity

    db.modifItem(id, name, desc, available, category, quantity, (error) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        res.status(200).send('Successfully edited')
    })
})

module.exports = router
