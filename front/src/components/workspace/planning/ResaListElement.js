import { categories } from '../../../Constants'
import { formatDate, formatHour, sameDay, toLocal } from '../../../Util'

import alertIcon from '../../../assets/icons/alert.svg'

import '../../../styles/workspace/planning/ResaListElement.css'

function ResaListElement({ resa, setDetails, setResa }) {
    var startDate = toLocal(new Date(resa.start))
    var endDate = toLocal(new Date(resa.end))

    return (
        <div className="resaListElement interactable" onClick={() => setResa(resa.id)}>
            <h2>
                {resa.name}
                {new Date() > endDate && <span className="past"> (passé)</span>}
                {resa.conflicts.length > 0 && <img src={alertIcon} alt="" className="alertIcon"></img>}
            </h2>
            <p className="date">
                {formatDate(startDate)}
                {' - '}
                {(sameDay(startDate, endDate) ? formatHour : formatDate)(endDate)}
            </p>
            <div>
                {/*resa.matos.map((matos, k) => (
                    <li key={k}>
                        <span className="interactable textlink" onClick={() => setDetails(matos.id)}>
                            {matos.name + (matos.quantity > 1 ? ' (x' + matos.quantity + ')' : '')}
                        </span>
                    </li>
                ))*/}
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
    )
}

export default ResaListElement
