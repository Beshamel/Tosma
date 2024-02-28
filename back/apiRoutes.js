var express = require('express')
var router = express.Router()

const db = require('./db.js')

const genericError = 'Something broke :/'
const missingData = 'Data not found'

const unauthorized = "Vous n'avez pas la permission de faire cette requête..."

router.post('/item/:id', (req, res) => {
    const id = req.params.id
    db.getItem(id, (error, item) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        if (!item[0]) {
            res.status(404).send({ message: missingData })
            return
        }
        var itemData = item[0]
        db.getItemImages(id, (error, data) => {
            if (error) {
                res.status(500).send({ message: genericError })
                console.log(error)
                return
            }
            itemData.images = data
            res.status(200).send(itemData)
        })
    })
})

router.post('/inventory', (req, res) => {
    db.getInventory(async (error, inventory) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        var n = inventory.length
        var c = 0
        inventory.map((item) => {
            db.getItemImages(item.id, (error, data) => {
                if (error) {
                    res.status(500).send({ message: genericError })
                    console.log(error)
                    return
                }
                item.images = data
                c = c + 1
                if (c === n) {
                    res.status(200).send(inventory)
                }
            })
        })
    })
})

router.post('/planning/:week', (req, res) => {
    const week = parseInt(req.params.week)
    db.getResaInWeek(week, (error, result) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        res.status(200).send(result)
    })
})

router.post('/resa/:id', (req, res) => {
    const id = req.params.id
    db.getResa(id, (error, result) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        res.status(200).send(result)
    })
})

router.post('/resa/:id/matos', (req, res) => {
    const id = req.params.id
    db.getResaMatos(id, (error, result) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        db.getResaConflicts(id, (error, conflicts) => {
            if (error) {
                res.status(500).send({ message: genericError })
                console.log(error)
                return
            }
            res.status(200).send({ matos: result, conflicts: conflicts })
        })
    })
})

router.post('/resa/:resa/addMatos/:matos', (req, res) => {
    const resa = req.params.resa
    const matos = req.params.matos
    db.addMatosToResa(resa, matos, (error, result) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        res.status(200).send(result)
    })
})

router.post('/resa/:resa/removeMatos/:matos', (req, res) => {
    const resa = req.params.resa
    const matos = req.params.matos
    db.removeMatosFromResa(resa, matos, (error, result) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        res.status(200).send('Operation successfull')
    })
})

router.post('/resa/:resa/increaseMatos/:matos', (req, res) => {
    const resa = req.params.resa
    const matos = req.params.matos
    db.increaseMatosAtResa(resa, matos, (error, result) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        res.status(200).send('Operation successfull')
    })
})

router.post('/resa/:resa/decreaseMatos/:matos', (req, res) => {
    const resa = req.params.resa
    const matos = req.params.matos
    db.decreaseMatosAtResa(resa, matos, (error, result) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        res.status(200).send('Operation successfull')
    })
})

router.post('/addResa', (req, res) => {
    const name = req.body.name
    const start = req.body.start
    const end = req.body.end
    const user = req.sess.user

    db.addResa(name, start, end, user, (error, result) => {
        if (error) {
            console.log(error)
            res.status(500).send({ message: genericError })
            return
        }
        res.status(200).send({ id: result.insertId })
    })
})

router.post('/modifResa', (req, res) => {
    const id = req.body.id
    const name = req.body.name
    const start = req.body.start
    const end = req.body.end

    db.modifResa(id, name, start, end, (error) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        res.status(200).send('Successfully edited')
    })
})

router.post('/removeResa', (req, res) => {
    const id = req.body.id

    db.removeResa(id, (error) => {
        if (error) {
            res.status(500).send({ message: genericError })
            console.log(error)
            return
        }
        res.status(200).send('Successfully removed resa')
    })
})

module.exports = router
