import { useEffect, useState } from 'react'
import Popup from 'reactjs-popup'

import { api, categories } from '../../../Constants'
import { formatDate, formatHour, formatLocalDateTime, matchesSearch, sameDay, toLocal, toUTC } from '../../../Util'
import ResaMatosListToken from './ResaMatosListToken'

import binIcon from '../../../assets/icons/bin.svg'
import addIcon from '../../../assets/icons/add.svg'
import minusIcon from '../../../assets/icons/minus.svg'
import editIcon from '../../../assets/icons/edit.svg'

import '../../../styles/workspace/resa/Resa.css'
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import useWindowDimensions from '../../../hooks/useWindowDimensions'

function Resa({ id, resa, conflicts, matos, loadResa, setDetails, setResa, deleteResa, inventory, loadPlanning, modif, setModif, post }) {
    var { width } = useWindowDimensions()
    var [matosSearch, setMatosSearch] = useState('')
    var [categorySearch, setCategorySearch] = useState(-1)
    var [modName, setModName] = useState(resa.name)
    var [modStart, setModStart] = useState(resa.start)
    var [modEnd, setModEnd] = useState(resa.modEnd)

    const categoryOptions = [{ cat_id: -1, cat_name: 'Toutes catégories', img: null }, ...categories]

    function getMatos(id) {
        return inventory.filter((m) => m.id === id)[0]
    }

    async function addMatos(id) {
        await post(api + '/api/resa/' + resa.id + '/addMatos/' + id)
        setMatosSearch('')
        loadResa()
        loadPlanning()
    }

    async function removeMatos(id) {
        await post(api + '/api/resa/' + resa.id + '/removeMatos/' + id)
        setMatosSearch('')
        loadResa()
        loadPlanning()
    }

    async function increaseMatos(id) {
        await post(api + '/api/resa/' + resa.id + '/increaseMatos/' + id)
        loadResa()
        loadPlanning()
    }

    async function decreaseMatos(id) {
        await post(api + '/api/resa/' + resa.id + '/decreaseMatos/' + id)
        loadResa()
        loadPlanning()
    }

    function resetModif() {
        setModName(resa.name)
        setModStart(new Date(resa.start))
        setModEnd(new Date(resa.end))
    }

    async function submitModif(event) {
        if (event) {
            event.preventDefault()
        }
        if (valid) {
            const data = new FormData()
            data.append('id', id)
            data.append('name', modName)
            data.append('start', formatLocalDateTime(modStart))
            data.append('end', formatLocalDateTime(modEnd))
            ;(async () => {
                await post(api + '/api/modifResa', data)
                setModif(false)
                resetModif()
                await loadPlanning()
                loadResa()
            })()
        }
    }

    useEffect(() => {
        loadResa()
    }, [id, loadResa])

    if (id === -1) {
        return (
            <div className="resaTab">
                <p>Chargement...</p>
            </div>
        )
    }

    if (!resa) {
        return (
            <div className="resaTab">
                <p>Something broke...</p>
            </div>
        )
    }

    var filteredInv = inventory.filter(
        (m) =>
            (matchesSearch(matosSearch, m.name) || matchesSearch(matosSearch, m.description)) &&
            !matos.some((e) => m.id === e.id) &&
            m.available &&
            (categorySearch === -1 || m.category_id === categorySearch)
    )

    var startDate = new Date(resa.start)
    var endDate = new Date(resa.end)

    var valid = modName && modName !== '' && modStart && modEnd && modStart <= modEnd

    return (
        <div className="resaTab">
            <div className="resa-body">
                {modif ? (
                    <div className="resaMatosSelector">
                        <h2>Modifier : {resa.name}</h2>
                        <form className="resaModifForm" onSubmit={submitModif} encType="multipart/form-data">
                            <div className="resaModifFormElement">
                                <input
                                    className="resaModifFormNameInput"
                                    type="text"
                                    name="name"
                                    value={modName}
                                    placeholder='Tournage "Les rushs retrouvés"'
                                    onChange={(e) => setModName(e.target.value)}
                                />
                            </div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div className="resaModifFormElement datePickerContainer">
                                    {width < 750 || <label>Début : </label>}
                                    <DateTimePicker
                                        className="resaModifFormStartInput"
                                        type="datetime-local"
                                        name="start"
                                        ampm={false}
                                        format={'DD-MM-YYYY HH:mm'}
                                        value={dayjs(toLocal(formatLocalDateTime(modStart)))}
                                        onChange={(e) => setModStart(new Date(e))}
                                        onBeforeNavigate={(nextView) => (nextView === 'days' || nextView === 'time' ? nextView : false)}
                                    />
                                    {width < 750 || <label> - Fin : </label>}
                                    <DateTimePicker
                                        className="resaModifFormEndInput"
                                        type="datetime-local"
                                        name="end"
                                        ampm={false}
                                        format={'DD-MM-YYYY HH:mm'}
                                        value={dayjs(toLocal(formatLocalDateTime(modEnd)))}
                                        onChange={(e) => setModEnd(new Date(e))}
                                    />
                                </div>
                            </LocalizationProvider>
                            <div className="resaModifFormElement">
                                <input className="formSubmit interactable" type="submit" value="Valider" valid={valid ? '1' : '0'} />
                            </div>
                        </form>
                        {matos.length === 0 ? (
                            <p>Rien n'est réservé pour l'instant...</p>
                        ) : (
                            matos.map((m, k) => (
                                <div key={[k, resa.id]} className="resaMatosListEntry">
                                    <div className="resaMatosListEltWrapper">
                                        <img
                                            className="removeToken interactable"
                                            src={addIcon}
                                            onClick={() => {
                                                removeMatos(m.id)
                                            }}
                                            action="removeMatos"
                                            alt=""
                                        ></img>
                                    </div>
                                    <div className="resaMatosListEltWrapper">
                                        <p className="interactable" onClick={() => setDetails(m.id)}>
                                            <ResaMatosListToken
                                                key={[k, resa.id]}
                                                matos={m}
                                                conflicts={conflicts.filter((c) => m.id === c.matos_id)}
                                                setDetails={setDetails}
                                                setResa={setResa}
                                                displayQuantity={false}
                                            />
                                            {<span className="blue">{getMatos(m.id).quantity > 1 ? ' (x' + m.quantity + ')' : ''}</span>}
                                        </p>
                                    </div>
                                    {getMatos(m.id).quantity > 1 && (
                                        <div className="resaMatosListEltWrapper">
                                            <img
                                                className="decreaseToken interactable"
                                                src={minusIcon}
                                                onClick={() => {
                                                    m.quantity > 1 && decreaseMatos(m.id)
                                                }}
                                                action="decreaseMatos"
                                                active={m.quantity > 1 ? '1' : '0'}
                                                alt=""
                                            ></img>
                                        </div>
                                    )}
                                    {getMatos(m.id).quantity > 1 && (
                                        <div className="resaMatosListEltWrapper">
                                            <img
                                                className="increaseToken interactable"
                                                src={addIcon}
                                                onClick={() => {
                                                    m.quantity < getMatos(m.id).quantity && increaseMatos(m.id)
                                                }}
                                                action="increaseMatos"
                                                active={m.quantity < getMatos(m.id).quantity ? '1' : '0'}
                                                alt=""
                                            ></img>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <h2 className="addResaMatosTitle">Ajouter du matos :</h2>
                        <input
                            className="matosSelectorSearch"
                            placeholder="Ajouter du matos..."
                            value={matosSearch}
                            onChange={(e) => {
                                setMatosSearch(e.target.value)
                            }}
                        ></input>
                        <select
                            className="matosSelectorCategory interactable"
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(parseInt(e.target.value))}
                        >
                            {categoryOptions.map((cat, k) => (
                                <option value={cat.cat_id} key={k}>
                                    {cat.cat_name}
                                </option>
                            ))}
                        </select>
                        {(matosSearch !== '' || categorySearch !== -1) &&
                            (filteredInv.length === 0 ? (
                                <p className="warning">Aucun objet disponible ne correspond à cette recherche...</p>
                            ) : (
                                filteredInv.map((m, k) => (
                                    <div key={k} className="resaMatosListEntry">
                                        <div className="resaMatosListEltWrapper">
                                            <img
                                                className="addToken interactable"
                                                src={addIcon}
                                                onClick={() => {
                                                    addMatos(m.id)
                                                }}
                                                action="addMatos"
                                                alt=""
                                            ></img>
                                        </div>
                                        <div className="resaMatosListEltWrapper">
                                            <p className="interactable textlink" onClick={() => setDetails(m.id)}>
                                                {m.name}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ))}
                    </div>
                ) : (
                    <div>
                        <h1 className="resaTitle">
                            {resa.name}
                            {new Date() > endDate && <span className="red"> (passé)</span>}
                        </h1>
                        <h2 className="resaSubtitle">
                            {formatDate(startDate)}
                            {' - '}
                            {(sameDay(toLocal(startDate), toLocal(endDate)) ? formatHour : formatDate)(endDate)}
                        </h2>
                        <h2 className="resaUser">Réservé par {resa.displayName}</h2>
                        <div className="resaMatosList">
                            {matos.length === 0 ? (
                                <p>Rien n'est réservé pour l'instant...</p>
                            ) : (
                                categories.map(
                                    (cat, k) =>
                                        matos.some((m) => cat.cat_id === m.category_id) && (
                                            <div key={k} className="resaCategorySublist">
                                                <h3 className="categoryTitle">{cat.cat_name}</h3>
                                                <ul>
                                                    {matos
                                                        .filter((m) => m.category_id === cat.cat_id)
                                                        .map((m, k) => (
                                                            <li key={[k, resa.id]}>
                                                                <ResaMatosListToken
                                                                    matos={m}
                                                                    conflicts={conflicts.filter((c) => m.id === c.matos_id)}
                                                                    setDetails={setDetails}
                                                                    setResa={setResa}
                                                                    displayQuantity={true}
                                                                />
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        )
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
            {
                /*(resa.user === session.user.uid || session.admin) &&*/ <div className="resa-footer">
                    <img
                        src={editIcon}
                        alt=""
                        className="iconButton interactable"
                        action="edit"
                        active={modif ? '1' : '0'}
                        onClick={() => {
                            if (modif) {
                                submitModif(null)
                            }
                            loadResa()
                            resetModif()
                            setModif(!modif)
                        }}
                    ></img>
                    <Popup trigger={<img src={binIcon} alt="" className="iconButton interactable" action="delete"></img>} position="right center">
                        <div className="confirm-popup">
                            <p>Etes vous sûr de vouloir supprimer cette réservation ?</p>
                            <button onClick={() => deleteResa(resa.id)} className="interactable">
                                Confirmer
                            </button>
                        </div>
                    </Popup>
                </div>
            }
        </div>
    )
}
export default Resa
