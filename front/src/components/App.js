import { useState } from 'react'

import Workspace from './workspace/Workspace'
import '../styles/App.css'
import logo from '../assets/hyris_hy.png'
import axios from 'axios'
import { api } from '../Constants'

function App() {
    var [entered, setEntered] = useState(false)
    var [hideFrontPage, setHideFrontPage] = useState(false)
    var [session, setSession] = useState({})
    var [user, setUser] = useState('')
    var [pwd, setPwd] = useState('')
    var [warning, setWarning] = useState(false)

    const login = async (event) => {
        event.preventDefault()
        var credentials = { username: user, password: pwd }
        try {
            const res = await axios.post(api + '/login', credentials)
            var result = res.data
            if (result.success) {
                setSession({ id: result.sessionId, admin: parseInt(result.admin) === 1, user: result.user })
                setEntered(true)
                setTimeout(function () {
                    setHideFrontPage(true)
                }, 500)
                setWarning(false)
            }
        } catch (err) {
            if (err.response.status === 401) {
                setWarning(true)
            }
            console.log(err)
            return
        }
        setUser('')
        setPwd('')
    }

    const logout = () => {
        setEntered(false)
        setHideFrontPage(false)
        setSession({})
    }

    async function post(url, formData) {
        axios.defaults.withCredentials = true
        try {
            if (!formData) {
                var result = await axios.post(url, { session: session.id }, { withCredentials: 'true' })
            } else {
                formData.append('session', session.id)
                result = await axios.post(url, formData, { withCredentials: 'true' })
            }
            return result
        } catch (err) {
            console.log(err)
            if (err.response.status === 401) {
                logout()
            }
            throw err
        }
    }

    return (
        <div className="App">
            {hideFrontPage ? (
                <Workspace session={session} post={post} logout={logout} />
            ) : (
                <div className="FrontPage" hide={entered.toString()}>
                    <img src={logo} className="Front-logo" alt="logo" />
                    <p className="noHover">Bienvenue sur Tosma !</p>
                    <form onSubmit={login}>
                        <div className="loginBoxInput usernameInputBox">
                            <span className="loginInputPicture" aria-hidden="true">
                                <i className="fa fa-user-o"></i>
                            </span>
                            <input
                                className="loginBoxInputZone"
                                type="text"
                                name="username"
                                placeholder="Identifiant"
                                id="login"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                            />
                        </div>
                        <div className="loginBoxInput">
                            <span className="loginInputPicture" aria-hidden="true">
                                <i className="fa fa-key"></i>
                            </span>
                            <input
                                className="loginBoxInputZone"
                                type="password"
                                name="password"
                                placeholder="Mot de passe"
                                id="password"
                                value={pwd}
                                onChange={(e) => setPwd(e.target.value)}
                            />
                        </div>
                        <button className="frontbutton interactable" type="submit">
                            Entrer
                        </button>
                        {warning && <p className="warning">Identifiant ou mot de passe incorrect...</p>}
                    </form>
                </div>
            )}
        </div>
    )
}

export default App
