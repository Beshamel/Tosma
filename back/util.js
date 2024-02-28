var crypto = require('crypto')
const fs = require('fs')

function startOfDay(date) {
    return new Date(date.toDateString())
}

function startOfWeek(week) {
    var date = new Date()
    var first = date.getDate() - date.getDay()
    var firstday = new Date(date.setDate(7 * week + first))
    return startOfDay(firstday)
}
exports.startOfWeek = startOfWeek

function generateUUID() {
    return crypto.randomUUID()
}
exports.generateUUID = generateUUID

async function deleteFile(filePath) {
    try {
        await fs.promises.unlink(filePath)
        //console.log(`File ${filePath} has been deleted.`)
    } catch (err) {
        console.error(err)
    }
}
exports.deleteFile = deleteFile
