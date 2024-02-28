import { version } from '../../Constants'
import '../../styles/workspace/Header.css'
import Nav from './Nav'
import Flakes from '../misc/Flakes'

import logoutIcon from '../../assets/icons/log-out.svg'
import kiwiIcon from '../../assets/icons/kiwi.svg'

import Popup from 'reactjs-popup'
import { useState } from 'react'
import useWindowDimensions from '../../hooks/useWindowDimensions'

function Header({ tab, setTab, displayDetails, detailsLoading, displayResa, session, logout }) {
    var [displayVersion, setDisplayVersion] = useState(false)
    var { width } = useWindowDimensions()

    return (
        <header className="workheader" mobile={width < 700 ? '1' : '0'}>
            {/*<Flakes />*/}
            <h1 className="website-title" mobile={width < 700 ? '1' : '0'}>
                <span className="interactable" onClick={() => setDisplayVersion(!displayVersion)}>
                    Tosma
                </span>{' '}
                {displayVersion && <span className="version">v{version}</span>}
            </h1>
            {session.user.uid !== 'gpa' && (
                <a href="https://kiwi.hyris.tv">
                    <img className="interactable kiwiIcon" src={kiwiIcon} action="kiwi" alt=""></img>
                </a>
            )}

            <Popup trigger={<img className="interactable logoutIcon" src={logoutIcon} action="logout" alt=""></img>} position="bottom right">
                <div className="confirm-popup">
                    <p>Vous êtes connecté en tant que {session.user.displayName}</p>
                    <button onClick={logout} className="interactable logoutButton" action="logout">
                        Se déconnecter
                    </button>
                </div>
            </Popup>

            <Nav tab={tab} setTab={setTab} displayDetails={displayDetails} detailsLoading={detailsLoading} displayResa={displayResa} />
        </header>
    )
}

export default Header
