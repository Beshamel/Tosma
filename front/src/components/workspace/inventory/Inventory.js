import { useState } from 'react'

import NewItemForm from './NewItemForm'

import addIcon from '../../../assets/icons/add.svg'
import refreshIcon from '../../../assets/icons/refresh.svg'
import { matchesSearch } from '../../../Util'
import { categories } from '../../../Constants'
import ListElement from './ListElement'

import('../../../styles/workspace/matos/Inventory.css')

function Inventory({ setDetails, refresh, loading, loadFail, setLoading, inventory, isValid, admin, post }) {
    var [displayForm, setDisplayForm] = useState(false)
    var [search, setSearch] = useState('')

    var filteredInv = inventory.filter(
        (m) => matchesSearch(search, m.name) || matchesSearch(search, m.description) || matchesSearch(search, categories[m.category_id].cat_name)
    )

    return (
        <div className="matos">
            <div className="inventory-header">
                {admin && (
                    <img
                        className="iconButton interactable"
                        src={addIcon}
                        onClick={() => setDisplayForm(!displayForm)}
                        display={displayForm ? 'on' : 'off'}
                        action="displayForm"
                        alt=""
                    ></img>
                )}
                <img
                    className="iconButton interactable"
                    src={refreshIcon}
                    onClick={() => loading || refresh()}
                    action="refresh"
                    loading={loading ? '1' : '0'}
                    fail={loadFail ? '1' : '0'}
                    alt=""
                ></img>
            </div>
            <NewItemForm
                display={displayForm}
                setDisplay={setDisplayForm}
                refresh={refresh}
                loading={loading}
                setLoading={setLoading}
                isValid={isValid}
                post={post}
            />
            <div className="inventorySearchWrapper" display={displayForm ? 'off' : 'on'}>
                <input
                    className="inventorySearch"
                    status={search === '' ? '0' : filteredInv.length === 0 ? '2' : '1'}
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                    }}
                ></input>
            </div>
            <div>
                {inventory.length === 0 ? (
                    <p className="padding-left">Il n'y a rien ici pour l'instant...</p>
                ) : filteredInv.length === 0 ? (
                    <p className="padding-left">Aucun objet de l'inventaire ne correspond à cette recherche...</p>
                ) : (
                    <div className="matos-list">
                        {filteredInv.map((item, i) => (
                            <ListElement
                                item={item}
                                parity={i % 2 === 0 ? '1' : '0'}
                                key={item.id}
                                setLoading={setLoading}
                                refresh={refresh}
                                setDetails={setDetails}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Inventory
