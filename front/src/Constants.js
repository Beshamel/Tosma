import img_autre from './assets/categories/autre.svg'
import img_camera from './assets/categories/camera.svg'
import img_objo from './assets/categories/objo.svg'
import img_rej from './assets/categories/rej.svg'
import img_stab from './assets/categories/stab.svg'
import img_light from './assets/categories/light.svg'
import img_accessory from './assets/categories/accessory.svg'
import img_son from './assets/categories/son.svg'
import img_battery from './assets/categories/battery.svg'

// PROD
export const api = 'https://tosma.hyris.tv'

// DEV - Docker
//export const api = 'http://localhost:8082'

// DEV - simple
//export const api = 'http://localhost:8080'

export const version = '2.2.1'

export const categories = [
    { cat_id: 0, cat_name: 'Autre', img: img_autre },
    { cat_id: 1, cat_name: 'Caméra', img: img_camera },
    { cat_id: 2, cat_name: 'Objo', img: img_objo },
    { cat_id: 3, cat_name: 'RéJ', img: img_rej },
    { cat_id: 4, cat_name: 'Stab', img: img_stab },
    { cat_id: 5, cat_name: 'Light', img: img_light },
    { cat_id: 6, cat_name: 'Accessoire', img: img_accessory },
    { cat_id: 7, cat_name: 'Son', img: img_son },
    { cat_id: 8, cat_name: 'Batterie', img: img_battery },
]

export const PLANNING_TAB = 0
export const RESA_TAB = 1
export const INVENTORY_TAB = 2
export const DETAILS_TAB = 3
