import { useEffect, useState } from 'react'

import { api, categories } from '../../../Constants'
import '../../../styles/workspace/matos/NewItemForm.css'

function NewItemForm({ display, refresh, setLoading, isValid, post }) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [available, setAvailable] = useState(1)
    const [category, setCategory] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [valid, setValid] = useState(false)

    function checkValidity() {
        setValid(isValid(name))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (valid) {
            const data = new FormData()
            data.append('name', name)
            data.append('desc', description)
            data.append('available', available)
            data.append('category', category)
            data.append('quantity', Math.max(quantity, 1))
            setLoading(true)
            ;(async () => {
                await post(api + '/admin/addEntry', data)
                refresh()
            })()
            setName('')
            setDescription('')
            setAvailable(1)
            setCategory(0)
            setQuantity(1)
            setValid(false)
        }
    }

    useEffect(checkValidity)

    return (
        <div>
            <div className="itemFormWrapper" display={display ? 'on' : 'off'} available={available ? '1' : '0'}>
                <h2>Ajouter du matos...</h2>
                <form className="itemForm" onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="formElement">
                        <input
                            className="formNameInput"
                            type="text"
                            name="name"
                            value={name}
                            placeholder="Hélicoptère Hyris"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="formElement">
                        <textarea
                            className="formDescInput"
                            name="description"
                            value={description}
                            placeholder="..."
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="formElement">
                        <label
                            className="formAvailableInput interactable"
                            available={available ? '1' : '0'}
                            onClick={() => setAvailable(available ? 0 : 1)}
                        >
                            {available ? 'Disponible' : 'Indisponible'}
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
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        ></input>
                    </div>
                    <div className="formElement">
                        <label>
                            Catégorie :<br />
                        </label>
                        <select
                            className="formCategoryInput interactable"
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(parseInt(e.target.value))}
                        >
                            {categories.map((cat, i) => (
                                <option value={cat.cat_id} key={i}>
                                    {cat.cat_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="formElement">
                        <input className="formSubmit interactable" type="submit" value="Ajouter" valid={valid ? '1' : '0'} />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default NewItemForm
