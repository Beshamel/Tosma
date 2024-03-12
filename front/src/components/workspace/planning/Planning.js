import '../../../styles/workspace/planning/Planning.css'

import { useEffect, useState } from 'react'
import ResaListElement from './ResaListElement'

import previousIcon from '../../../assets/icons/arrow-left.svg'
import nextIcon from '../../../assets/icons/arrow-right.svg'
import refreshIcon from '../../../assets/icons/refresh.svg'
import addIcon from '../../../assets/icons/add.svg'
import alertIcon from '../../../assets/icons/alert.svg'
import NewResaForm from './NewResaForm'
import {
    dateDiffInDays,
    firstNewInt,
    formatDate,
    formatHour,
    getWeekDate,
    printWeekDates,
    range,
    resaOverlapInPlanning,
    sameDay,
    shortDay,
    startOfWeek,
    toLocal,
} from '../../../Util'
import useWindowDimensions from '../../../hooks/useWindowDimensions'
import { categories } from '../../../Constants'

function title(week) {
    switch (week) {
        case 0:
            return 'cette semaine'
        case 1:
            return 'semaine prochaine'
        case -1:
            return 'semaine dernière'
        default:
            return 'S' + (week < 0 ? '-' + -week : '+' + week)
    }
}

function Planning({ setDetails, setResa, loading, loadFail, setLoading, loadPlanning, week, setWeek, planning, post }) {
    const [displayForm, setDisplayForm] = useState(false)

    var { width } = useWindowDimensions()
    var mobile = width < 1200

    var mapping = range(planning.length).map((i) => {
        return { resa: planning[i], y: -1 }
    })
    mapping.forEach((m) => {
        m.y = firstNewInt(mapping.filter((e) => e.y > -1 && resaOverlapInPlanning(e.resa, m.resa)).map((e) => e.y))
        m.resa.y = m.y
    })

    useEffect(() => {
        loadPlanning()
    }, [week, loadPlanning])

    function resaBlock(resa, k) {
        var startDate = new Date(resa.start)
        var endDate = new Date(resa.end)
        var startId = Math.max(dateDiffInDays(startOfWeek(week), toLocal(startDate), false), 0)
        var endId = Math.max(dateDiffInDays(startOfWeek(week), toLocal(endDate), true))
        return (
            <div key={k} style={{ gridColumnStart: startId + 1, gridColumnEnd: endId + 2, gridRowStart: resa.y + 2, gridRowEnd: resa.y + 3 }}>
                <div className="resaElement interactable" onClick={() => setResa(resa.id)}>
                    <div className="resaHeader">
                        <h2>
                            {resa.name}
                            {resa.conflicts.length > 0 && <img src={alertIcon} alt="" className="alertIcon"></img>}
                        </h2>
                    </div>
                    <p className="date">
                        {formatDate(startDate)}
                        {' - '}
                        {(sameDay(startDate, endDate) ? formatHour : formatDate)(endDate)}
                    </p>
                    <div>
                        {resa.matos.length > 6
                            ? categories.map(
                                  (cat, k) =>
                                      resa.matos.some((m) => cat.cat_id === m.category_id) && (
                                          <p className="resaCategoryPreview" key={k}>
                                              {cat.cat_name}
                                              {' x' + resa.matos.filter((m) => m.category_id === cat.cat_id).length}
                                          </p>
                                      )
                              )
                            : resa.matos.map((matos, k) => (
                                  <li key={k}>
                                      <span className="interactable textlink" onClick={() => setDetails(matos.id)}>
                                          {matos.name + (matos.quantity > 1 ? ' (x' + matos.quantity + ')' : '')}
                                      </span>
                                  </li>
                              ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="planning">
            <div className="planning-header">
                <h1>Planning : {title(week)}</h1>
                <h2 className="planningSubtitle">{printWeekDates(week)}</h2>
                <img
                    className="iconButton interactable"
                    src={previousIcon}
                    onClick={() => {
                        setWeek(week - 1)
                        setDisplayForm(false)
                    }}
                    action="previous"
                    alt=""
                ></img>
                <img
                    className="iconButton interactable"
                    src={nextIcon}
                    onClick={() => {
                        setWeek(week + 1)
                        setDisplayForm(false)
                    }}
                    action="next"
                    alt=""
                ></img>
                <img
                    className="iconButton interactable"
                    src={refreshIcon}
                    onClick={() => {
                        loading || loadPlanning()
                        setDisplayForm(false)
                    }}
                    action="refresh"
                    fail={loadFail ? '1' : '0'}
                    loading={loading ? '1' : '0'}
                    alt=""
                ></img>
                <img
                    className="iconButton interactable"
                    src={addIcon}
                    onClick={() => {
                        setDisplayForm(!displayForm)
                    }}
                    display={displayForm ? 'on' : 'off'}
                    action="displayForm"
                    alt=""
                ></img>
            </div>
            <NewResaForm
                display={displayForm}
                refresh={() => {
                    loadPlanning()
                }}
                setLoading={setLoading}
                post={post}
                setResa={setResa}
                mobile={mobile ? '1' : '0'}
            />
            {mobile ? (
                planning.length !== 0 && planning.map((r, k) => <ResaListElement resa={r} setDetails={setDetails} key={k} setResa={setResa} />)
            ) : (
                <div
                    className="PC"
                    style={{
                        gridTemplateRows: `50px repeat(${planning.length}, auto)`,
                    }}
                    empty={planning.length === 0 ? '1' : '0'}
                >
                    {range(7).map((i, k) => (
                        <div
                            key={k}
                            className="columnPlaceholder"
                            parity={i % 2 ? '0' : '1'}
                            style={{ gridColumnStart: i + 1, gridColumnEnd: i + 2, gridRowStart: 1, gridRowEnd: planning.length + 2 }}
                            today={week === 0 && dateDiffInDays(startOfWeek(week), new Date()) === i ? '1' : '0'}
                        ></div>
                    ))}
                    {range(7).map((i, k) => (
                        <div
                            key={k}
                            className="dayHeader"
                            parity={i % 2 ? '0' : '1'}
                            style={{ gridColumnStart: i + 1, gridColumnEnd: i + 2, gridRowStart: 1, gridRowEnd: 2 }}
                            today={week === 0 && dateDiffInDays(startOfWeek(week), new Date()) === i ? '1' : '0'}
                        >
                            <h2>
                                {shortDay[i] + ' ' + getWeekDate(week, i)}
                                {week === 0 && dateDiffInDays(startOfWeek(week), new Date()) === i && <span> (ajd)</span>}
                            </h2>
                        </div>
                    ))}
                    {planning.length !== 0 && planning.map((r, k) => resaBlock(r, k))}
                </div>
            )}
            {planning.length === 0 && <p className="padding-left">Rien n'est prévu cette semaine...</p>}
        </div>
    )
}
export default Planning
