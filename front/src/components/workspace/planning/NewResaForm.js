import { useEffect, useState } from 'react'

import * as Consts from '../../../Constants'
import '../../../styles/workspace/planning/NewResaForm.css'
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import useWindowDimensions from '../../../hooks/useWindowDimensions'
import { formatLocalDateTime, toLocal, toUTC } from '../../../Util'

function NewResaForm({ display, refresh, setLoading, post, setResa, mobile }) {
    var { width } = useWindowDimensions()
    var now = new Date(Date.now())
    var later = new Date(now)
    later.setHours(later.getHours() + 1)
    const [name, setName] = useState('')
    const [start, setStart] = useState(now)
    const [end, setEnd] = useState(later)
    const [valid, setValid] = useState(false)

    function checkValidity() {
        setValid(start && end && start <= end && name !== '')
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (valid) {
            const data = new FormData()
            data.append('name', name)
            data.append('start', formatLocalDateTime(start))
            data.append('end', formatLocalDateTime(end))
            setLoading(true)
            ;(async () => {
                try {
                    var id = await post(Consts.api + '/api/addResa', data)
                    await refresh()
                    setResa(id.data.id)
                } catch (err) {
                    console.log(err)
                }
            })()
            setName('')
            setStart('')
            setEnd('')
            setValid(false)
        }
    }

    useEffect(checkValidity, [end, name, start])

    return (
        <div className="resaFormWrapper padding-left" display={display ? 'on' : 'off'} mobile={mobile}>
            <h2>Ajouter une réservation...</h2>
            <form className="resaForm" onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="resaFormElement">
                    <input
                        className="resaFormNameInput"
                        type="text"
                        name="name"
                        value={name}
                        placeholder='Tournage "Les rushs retrouvés"'
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className="resaFormElement datePickerContainer">
                        {width < 750 || <label>Début : </label>}
                        <DateTimePicker
                            className="resaFormStartInput"
                            type="datetime-local"
                            name="start"
                            ampm={false}
                            format={'DD-MM-YYYY HH:mm'}
                            value={dayjs(toLocal(formatLocalDateTime(start)))}
                            onChange={(e) => setStart(new Date(e))}
                            onBeforeNavigate={(nextView) => (nextView === 'days' || nextView === 'time' ? nextView : false)}
                        />
                        {width < 750 || <label> - Fin : </label>}
                        <DateTimePicker
                            className="resaFormEndInput"
                            type="datetime-local"
                            name="end"
                            ampm={false}
                            format={'DD-MM-YYYY HH:mm'}
                            value={dayjs(toLocal(formatLocalDateTime(end)))}
                            onChange={(e) => setEnd(new Date(e))}
                        />
                    </div>
                </LocalizationProvider>
                <div className="resaFormElement">
                    <input className="resaFormSubmit interactable" type="submit" value="Ajouter" valid={valid ? '1' : '0'} />
                </div>
            </form>
        </div>
    )
}

export default NewResaForm
