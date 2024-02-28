const mysql = require('mysql2')
const config = require('./config.js')
const util = require('./util')

const fs = require('fs')
const path = require('path')

var connection = mysql.createConnection(config.MYSQL_OPTIONS)
connection.connect()

function removeUnusedImages(callback) {
    var query = `
    DELETE FROM image
    WHERE (SELECT COUNT(*) FROM materiel WHERE materiel.id = item_id) = 0
    `

    connection.query(query, function (error, results) {
        if (error) {
            throw error
        }
        console.log(results)

        query = `
        SELECT url
        FROM image JOIN materiel ON item_id = materiel.id
        `

        connection.query(query, function (error, results) {
            if (error) {
                throw error
            }
            var data = results.map((r) => r.url)
            console.log(data)
            fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
                if (err) throw err
                files.forEach((file) => {
                    if (!data.some((f) => f === file)) {
                        util.deleteFile(path.join(__dirname, 'uploads', file))
                    }
                })
            })
        })
    })
}
exports.removeUnusedImages = removeUnusedImages

function cleanUp() {
    var query = `
    DELETE FROM session
    WHERE expires < ?;
    `
    var params = [new Date()]

    connection.query(query, params, function (error, results) {
        if (error) {
            throw error
        }
    })

    query = `
    DELETE FROM resa_matos
    WHERE (SELECT COUNT(*) FROM resa WHERE id = id_resa) = 0
    `

    connection.query(query, function (error, results) {
        if (error) {
            throw error
        }
    })

    query = `
    DELETE FROM resa_matos
    WHERE (SELECT COUNT(*) FROM materiel WHERE id = id_matos) = 0
    `

    connection.query(query, function (error, results) {
        if (error) {
            throw error
        }
    })
}

function createSession(authuser, callback) {
    cleanUp()
    var sessionId = util.generateUUID()
    var expires = new Date()
    expires.setTime(expires.getTime() + 60 * 60 * 1000)
    const query = `
    INSERT INTO session (id, user, expires)
    VALUES (?, ?, ?);
    `
    const params = [sessionId, authuser.uid, expires]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        register(authuser, (err, user) => {
            if (err) {
                callback(err)
                return
            }
            callback(null, { id: sessionId, user: user, expires: expires })
        })
    })
}
exports.createSession = createSession

function getSession(sessionId, callback) {
    const query = `
    SELECT * FROM session WHERE id = ?;
    `
    const params = [sessionId]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        if (results.length === 0) {
            callback(null, false)
            return
        }
        var session = results[0]
        if (!session) {
            callback(null, false)
            return
        }
        if (new Date() > session.expires) {
            callback(null, false)
            return
        }
        isAdmin(session.user, (err, admin) => {
            if (err) {
                callback(err)
                return
            }
            callback(null, true, { id: session.id, user: session.user, expires: session.expires, admin: admin })
        })
    })
}
exports.getSession = getSession

function updateSession(id, callback) {
    var expires = new Date()
    expires.setTime(expires.getTime() + 60 * 60 * 1000)
    const query = `
    UPDATE session SET expires = ?
    WHERE id = ?;
    `
    const params = [expires, id]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
    })
}
exports.updateSession = updateSession

function register(user, callback) {
    const query = `
    SELECT * FROM user WHERE username = ?;
    `
    const params = [user.uid]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        if (results.length === 0) {
            const query2 = `
            INSERT INTO user (username, admin, displayName) VALUES (?, 0, ?);
            `
            const params2 = [user.uid, user.displayName]

            connection.query(query2, params2, function (error, results) {
                if (error) {
                    callback(error)
                    return
                }
                callback(null, 0)
            })
        } else {
            callback(null, results[0])
        }
    })
}

function isAdmin(username, callback) {
    const query = `
    SELECT * FROM user WHERE username = ?;
    `
    const params = [username]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        if (results.length === 0) {
            callback(null, 0)
        }
        callback(null, results[0].admin)
    })
}

function addImage(item_id, url, callback) {
    const query = `
    INSERT INTO image (item_id, url)
    VALUES (?, ?);
    `
    const params = [item_id, url]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null)
    })
}
exports.addImage = addImage

function removeImage(id, callback) {
    const query = `
    DELETE FROM image
    WHERE id = ?;
    `
    const params = [id]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null)
    })
}
exports.removeImage = removeImage

function addItem(name, desc, available, category, quantity, callback) {
    const query = `
    INSERT INTO materiel (name, description, available, category_id, quantity)
    VALUES (?, ?, ?, ?, ?);
    `
    const params = [name, desc, available, category, quantity]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null)
    })
}
exports.addItem = addItem

function modifItem(id, name, desc, available, category, quantity, callback) {
    const query = `
    UPDATE materiel SET name = ?, description = ?, available = ?, category_id = ?, quantity = ?
    WHERE id = ?;
    `
    const params = [name, desc, available, category, quantity, id]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null)
    })
}
exports.modifItem = modifItem

function modifResa(id, name, start, end, callback) {
    const query = `
    UPDATE resa SET name = ?, start = ?, end = ?
    WHERE id = ?;
    `
    const params = [name, start, end, id]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null)
    })
}
exports.modifResa = modifResa

function removeItem(id, callback) {
    const query = `
    DELETE FROM materiel
    WHERE id = ?;
    `
    const params = [id]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null)
    })
}
exports.removeItem = removeItem

function getInventory(callback) {
    const query = `
    SELECT * FROM materiel
    `

    connection.query(query, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null, results)
    })
}
exports.getInventory = getInventory

function getItem(id, callback) {
    const query = `
    SELECT * FROM materiel WHERE id = ?
    `
    const params = [id]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null, results)
    })
}
exports.getItem = getItem

function getItemImages(id, callback) {
    const query = `
    SELECT * FROM image WHERE item_id = ?
    `
    const params = [id]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null, results)
    })
}
exports.getItemImages = getItemImages

function getPlanning(callback) {
    const query = `
    SELECT * FROM resa
    `

    connection.query(query, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null, results)
    })
}
exports.getPlanning = getPlanning

function getResa(id, callback) {
    const query = `
    SELECT id, name, start, end, user, displayName
    FROM resa JOIN user ON resa.user = user.username
    WHERE id = ?
    `
    const params = [id]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null, results[0])
    })
}
exports.getResa = getResa

function getResaInWeek(week, callback) {
    const query = `
    SELECT * FROM resa WHERE end >= ? AND start < ?
    `
    const params = [util.startOfWeek(week), util.startOfWeek(week + 1)]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null, results)
    })
}
exports.getResaInWeek = getResaInWeek

function getResaMatos(id, callback) {
    const query = `
    SELECT materiel.id, materiel.name, materiel.category_id, resa_matos.quantity
    FROM resa JOIN resa_matos JOIN materiel ON resa.id = id_resa AND materiel.id = id_matos
    WHERE resa.id = ?
    `
    const params = [id]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null, results)
    })
}
exports.getResaMatos = getResaMatos

function getResaConflicts(id, callback) {
    const query = `
    SELECT other_resa.id AS resa_id, other_resa.name AS resa_name, materiel.id AS matos_id
    FROM resa JOIN resa AS other_resa JOIN resa_matos JOIN resa_matos AS other_resa_matos JOIN materiel
    ON other_resa.id = other_resa_matos.id_resa
        AND other_resa_matos.id_matos = resa_matos.id_matos
        AND resa_matos.id_resa = resa.id
        AND materiel.id = resa_matos.id_matos
        AND NOT (resa.start >= other_resa.end OR other_resa.start >= resa.end)
    WHERE resa.id = ? AND other_resa.id != resa.id AND resa_matos.quantity + other_resa_matos.quantity > materiel.quantity
    `
    const params = [id]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null, results)
    })
}
exports.getResaConflicts = getResaConflicts

function addResa(name, start, end, user, callback) {
    const query = `
    INSERT INTO resa (name, start, end, user)
    VALUES (?, ?, ?, ?);
    `
    const params = [name, start, end, user]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null, results)
    })
}
exports.addResa = addResa

function removeResa(id, callback) {
    const query = `
    DELETE FROM resa
    WHERE id = ?;
    `
    const params = [id]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null)
    })
}
exports.removeResa = removeResa

function addMatosToResa(id_resa, id_matos, callback) {
    const query = `
    INSERT INTO resa_matos (id_resa, id_matos)
    VALUES (?, ?);
    `
    const params = [id_resa, id_matos]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null)
    })
}
exports.addMatosToResa = addMatosToResa

function removeMatosFromResa(id_resa, id_matos, callback) {
    const query = `
    DELETE FROM resa_matos
    WHERE (id_resa, id_matos) = (?, ?);
    `
    const params = [id_resa, id_matos]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        callback(null)
    })
}
exports.removeMatosFromResa = removeMatosFromResa

function increaseMatosAtResa(id_resa, id_matos, callback) {
    const query = `
    SELECT materiel.id, materiel.quantity AS stock, resa_matos.quantity AS quantity
    FROM resa JOIN resa_matos JOIN materiel ON resa.id = id_resa AND materiel.id = id_matos
    WHERE resa.id = ? AND materiel.id = ?
    `
    const params = [id_resa, id_matos]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        var quantity = results[0].quantity
        var stock = results[0].stock
        if (quantity >= stock) {
            callback(new Error('Tried to exceed available stock for an item reservation'))
            return
        }

        var newQuantity = Math.min(quantity + 1, stock)
        const query2 = `
        UPDATE resa_matos SET quantity = ?
        WHERE id_resa = ? AND id_matos = ?;
        `
        const params2 = [newQuantity, id_resa, id_matos]

        connection.query(query2, params2, function (error, results) {
            if (error) {
                callback(error)
                return
            }
            callback(null)
        })
    })
}
exports.increaseMatosAtResa = increaseMatosAtResa

function decreaseMatosAtResa(id_resa, id_matos, callback) {
    const query = `
    SELECT materiel.id, materiel.quantity AS stock, resa_matos.quantity AS quantity
    FROM resa JOIN resa_matos JOIN materiel ON resa.id = id_resa AND materiel.id = id_matos
    WHERE resa.id = ? AND materiel.id = ?
    `
    const params = [id_resa, id_matos]

    connection.query(query, params, function (error, results) {
        if (error) {
            callback(error)
            return
        }
        var quantity = results[0].quantity
        if (quantity <= 1) {
            callback(new Error('Tried to reach a quantity of 0 for an item reservation'))
            return
        }

        var newQuantity = Math.max(quantity - 1, 1)
        const query2 = `
        UPDATE resa_matos SET quantity = ?
        WHERE id_resa = ? AND id_matos = ?;
        `
        const params2 = [newQuantity, id_resa, id_matos]

        connection.query(query2, params2, function (error, results) {
            if (error) {
                callback(error)
                return
            }
            callback(null)
        })
    })
}
exports.decreaseMatosAtResa = decreaseMatosAtResa
