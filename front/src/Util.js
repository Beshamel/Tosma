const weekDay = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
export const shortDay = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const month = ['Janvier', 'Février', 'Mars', 'Arvil', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export function range(n) {
    return Array.from({ length: n }, (_, i) => i)
}

export function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function formatDate(date) {
    return weekDay[date.getDay()] + ' ' + date.getDate() + '/' + (date.getMonth < 9 ? '0' : '') + (date.getMonth() + 1) + ', ' + formatHour(date)
}

export function formatHour(date) {
    return date.getHours() + 'h' + (date.getMinutes() === 0 ? '' : (date.getMinutes() < 10 ? '0' : '') + date.getMinutes())
}

export function formatSearch(search) {
    return search.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function matchesSearch(search, elt) {
    return search === '' || formatSearch(elt).toLowerCase().includes(formatSearch(search.toLowerCase()))
}

export function printWeekDates(week) {
    var date = new Date()
    var first = date.getDate() - date.getDay()
    var firstday = new Date(date.setDate(7 * week + first))
    var lastday = new Date(date.setDate(date.getDate() + 6))
    return firstday.getDate() + ' ' + month[firstday.getMonth()] + ' - ' + lastday.getDate() + ' ' + month[lastday.getMonth()]
}

export function getWeekDate(week, i) {
    var date = new Date()
    var first = date.getDate() - date.getDay()
    date.setDate(7 * week + first + i)
    return date.getDate()
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function startOfWeek(week) {
    var date = new Date()
    var first = date.getDate() - date.getDay()
    var firstday = new Date(date.setDate(7 * week + first))
    return startOfDay(firstday)
}

export function dateDiffInDays(a, b, crop) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
    var b_ = crop ? remove1minute(b) : b
    const utc2 = Date.UTC(b_.getFullYear(), b_.getMonth(), b_.getDate())

    return Math.floor((utc2 - utc1) / _MS_PER_DAY)
}

function remove1minute(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() - 1)
}

export function toUTC(date) {
    var offsetMin = new Date().getTimezoneOffset()
    var res = new Date(date)
    return new Date(res.getTime() + offsetMin * 60 * 1000)
}

export function toLocal(date) {
    var offsetMin = new Date().getTimezoneOffset()
    var res = new Date(date)
    return new Date(res.getTime() - offsetMin * 60 * 1000)
}

export function formatLocalDateTime(date) {
    //var dt = new Date(date)
    //dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset())
    return date.toISOString().slice(0, 16)
}

export function resaOverlapInPlanning(a, b) {
    return !(
        startOfDay(remove1minute(new Date(a.end))) < startOfDay(new Date(b.start)) ||
        startOfDay(remove1minute(new Date(b.end))) < startOfDay(new Date(a.start))
    )
}

function contains(l, x) {
    return l.some((e) => e === x)
}

export function firstNewInt(l) {
    var x = 0
    while (contains(l, x)) {
        x++
    }
    return x
}
