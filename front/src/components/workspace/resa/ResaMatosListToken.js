import Popup from 'reactjs-popup'

import alertIcon from '../../../assets/icons/alert.svg'

function ResaMatosListToken({ matos, conflicts, setDetails, setResa, displayQuantity }) {
    var conflict = conflicts.length > 0

    return (
        <span>
            <span className={'interactable textlink' + (conflict ? ' red' : '')} onClick={() => setDetails(matos.id)}>
                {matos.name + (matos.quantity > 1 && displayQuantity ? ' (x' + matos.quantity + ')' : '')}
            </span>
            {conflict && (
                <Popup trigger={<img src={alertIcon} alt="" className="alertIcon interactable"></img>} position="right center">
                    <div className="conflict-popup">
                        <p className="conflictPopupTitle">Déjà réservé pour :</p>
                        {conflicts.map((c, k) => (
                            <p className="no-margin" onClick={() => setResa(c.resa_id)} key={k}>
                                {' - '}
                                <span className="textlink interactable">{c.resa_name}</span>
                            </p>
                        ))}
                    </div>
                </Popup>
            )}
        </span>
    )
}
export default ResaMatosListToken
