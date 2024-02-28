import { api, categories } from '../../../Constants'

import('../../../styles/workspace/matos/ListElement.css')

function ListElement({ item, parity, setDetails }) {
    return (
        <div className="listElement interactable" available={item.available ? '1' : '0'} parity={parity} onClick={() => setDetails(item.id)}>
            <img src={categories[item.category_id].img} alt={item.cat_name} className="detail" type="cat_icon"></img>
            <div className="detail" type="name">
                <p>
                    {item.name}
                    <span className="quantityPreview">{item.quantity > 1 ? ' (x' + item.quantity + ')' : ''}</span>
                </p>
            </div>
            <div className="detail" type="description" with_image={item.images.length !== 0 ? '1' : '0'}>
                <p>{item.description}</p>
            </div>
            {item.images.length !== 0 && (
                <figure className="detail" type="image" key={item.id}>
                    <img src={api + '/image/' + item.images[0].url} alt={item.name} className="imgDisplay"></img>
                </figure>
            )}
        </div>
    )
}

export default ListElement
