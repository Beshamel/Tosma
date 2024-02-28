import { useState } from 'react'
import { api, categories } from '../../../Constants'

import binIcon from '../../../assets/icons/bin.svg'
import editIcon from '../../../assets/icons/edit.svg'
import addIcon from '../../../assets/icons/add.svg'
import Popup from 'reactjs-popup'

import('../../../styles/workspace/details/Details.css')

function Details({ item, deleteItem, modif, setModif, isModifValid, refresh, removeImage, admin, post }) {
    const [modName, setModName] = useState(item.name)
    const [modDescription, setModDescription] = useState(item.description)
    const [modAvailable, setModAvailable] = useState(item.available)
    const [modCategory, setModCategory] = useState(item.category_id)
    const [modQuantity, setModQuantity] = useState(item.quantity)
    const [newImage, setNewImage] = useState()

    function deleteCurrentItem() {
        deleteItem(item.id)
    }

    const valid = isModifValid(item.id, modName, modDescription, modAvailable, modCategory, modQuantity)

    async function submitModif(event) {
        event.preventDefault()
        if (valid) {
            const data = new FormData()
            data.append('id', item.id)
            data.append('name', modName)
            data.append('desc', modDescription)
            data.append('available', modAvailable)
            data.append('category', modCategory)
            data.append('quantity', modQuantity)
            ;(async () => {
                await post(api + '/admin/modifEntry', data)
                setModif(false)
                resetForm()
                refresh()
            })()
        }
    }

    async function uploadImage(event) {
        event.preventDefault()
        if (newImage) {
            const data = new FormData()
            data.append('id', item.id)
            data.append('image', newImage)
            ;(async () => {
                await post(api + '/addImage', data)
                setNewImage()
                refresh()
            })()
        }
    }

    function resetForm() {
        setModName(item.name)
        setModDescription(item.description)
        setModAvailable(item.available)
        setModCategory(item.category_id)
        setModQuantity(item.quantity)
    }

    return item.id === -1 ? (
        <h3>Sélectionnez du matos pour afficher quelque chose ici...</h3>
    ) : (
        <div>
            {modif ? (
                <div className="modifItemForm">
                    <h2>Modifier : {item.name}</h2>
                    <form className="itemForm" onSubmit={submitModif} encType="multipart/form-data">
                        <div className="formElement">
                            <input
                                className="formNameInput"
                                type="text"
                                name="name"
                                value={modName}
                                placeholder="Hélicoptère Hyris"
                                onChange={(e) => setModName(e.target.value)}
                            />
                        </div>
                        <div className="formElement">
                            <textarea
                                className="formDescInput"
                                name="description"
                                value={modDescription}
                                placeholder="..."
                                onChange={(e) => setModDescription(e.target.value)}
                            />
                        </div>
                        <div className="formElement">
                            <label
                                className="formAvailableInput interactable"
                                available={modAvailable ? '1' : '0'}
                                onClick={() => setModAvailable(modAvailable ? 0 : 1)}
                            >
                                {modAvailable ? 'Disponible' : 'Indisponible'}
                            </label>
                        </div>
                        <div className="formElement">
                            <label>
                                Quantité :<br />
                            </label>
                            <input
                                type="number"
                                className="formQuantityInput interactable"
                                name="quantity"
                                value={modQuantity}
                                onChange={(e) => setModQuantity(e.target.value)}
                            ></input>
                        </div>
                        <div className="formElement">
                            <label>
                                Catégorie :<br />
                            </label>
                            <select
                                className="formCategoryInput interactable"
                                name="category"
                                value={modCategory}
                                onChange={(e) => setModCategory(parseInt(e.target.value))}
                            >
                                {categories.map((cat, i) => (
                                    <option value={cat.cat_id} key={i}>
                                        {cat.cat_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="formElement">
                            <input className="formSubmit interactable" type="submit" value="Modifier" valid={valid ? '1' : '0'} />
                        </div>
                    </form>
                    {item.images.map((image, k) => (
                        <div key={k}>
                            <figure className="singleImage">
                                <img src={api + '/image/' + image.url} alt={item.name}></img>
                                <img
                                    className="removeImageToken interactable"
                                    src={binIcon}
                                    onClick={() => {
                                        removeImage(image.id, image.url)
                                        refresh()
                                    }}
                                    action="removeImage"
                                    alt=""
                                ></img>
                            </figure>
                        </div>
                    ))}
                    <form className="imageAdder" onSubmit={uploadImage} encType="multipart/form-data">
                        <input
                            className="imageAdderInupt"
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={(e) => setNewImage(e.target.files[0])}
                        />
                        <input className="imageAdderSubmit interactable" type="submit" value="Ajouter" valid={newImage ? '1' : '0'} />
                    </form>
                </div>
            ) : (
                <div className="infos">
                    <h1 className="detailsTitle">
                        {item.name}
                        {item.quantity > 1 ? <span className="itemQuantity">{' (x' + item.quantity + ')'}</span> : ''}
                        <span className="red">{!item.available && ' (indisponible)'}</span>
                    </h1>
                    {item.category_id === 0 || <h2 className="detailsSubtitle">{categories[item.category_id].cat_name}</h2>}
                    <div className="description">
                        <p></p>
                        {item.description.split('\n').map((line, k) => (
                            <p key={k}>{line}</p>
                        ))}
                    </div>
                    <div className="imagesContainer">
                        {item.images.map((image, k) => (
                            <figure className="singleImage" key={k}>
                                <img src={api + '/image/' + image.url} alt={item.name}></img>
                            </figure>
                        ))}
                    </div>
                </div>
            )}
            {admin && (
                <div className="details-footer">
                    <img
                        src={modif ? addIcon : editIcon}
                        alt=""
                        className="iconButton interactable editItemIcon"
                        action="edit"
                        active={modif ? '1' : '0'}
                        onClick={() => {
                            resetForm()
                            setModif(!modif)
                        }}
                    ></img>
                    <Popup trigger={<img src={binIcon} alt="" className="iconButton interactable" action="delete"></img>} position="right center">
                        <div className="confirm-popup">
                            <p>Etes vous sûr de vouloir retirer cet objet de l'inventaire ?</p>
                            <button onClick={deleteCurrentItem} className="interactable">
                                Confirmer
                            </button>
                        </div>
                    </Popup>
                </div>
            )}
        </div>
    )
}
export default Details
