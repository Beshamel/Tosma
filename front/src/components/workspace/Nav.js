import NavButton from './NavButton'

import '../../styles/workspace/Nav.css'
import { DETAILS_TAB, INVENTORY_TAB, PLANNING_TAB, RESA_TAB } from '../../Constants'

function Nav({ tab, setTab, displayDetails, detailsLoading, displayResa }) {
    function DynamicButton(i, text, loading) {
        return <NavButton tab={tab} setTab={setTab} i={i} text={text} loading={loading} />
    }

    return (
        <nav className="worknav">
            {DynamicButton(PLANNING_TAB, 'Planning', false)}
            {displayResa && DynamicButton(RESA_TAB, 'Résa', false)}
            {DynamicButton(INVENTORY_TAB, 'Inventaire', false)}
            {displayDetails && DynamicButton(DETAILS_TAB, 'Détails', detailsLoading)}
        </nav>
    )
}

export default Nav
