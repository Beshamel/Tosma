import { useState, useEffect, useCallback } from 'react'

import { DETAILS_TAB, INVENTORY_TAB, PLANNING_TAB, RESA_TAB, api } from '../../Constants'

import Header from './Header'
import Planning from './planning/Planning'
import Inventory from './inventory/Inventory'
import Details from './details/Details'

import '../../styles/workspace/Workspace.css'
import Resa from './resa/Resa'

const emptyItem = { id: -1 }
const emptyResa = { id: -1 }

function WorkSpace({ session, post, logout }) {
    var [tab, setTab] = useState(PLANNING_TAB)

    var [selectedItem, setSelectedItem] = useState(emptyItem)
    var [displayDetails, setDisplayDetails] = useState(false)
    var [displayItemModif, setDisplayItemModif] = useState(false)

    var [selectedResaId, setSelectedResaId] = useState(-1)
    var [displayResa, setDisplayResa] = useState(false)
    var [displayResaModif, setDisplayResaModif] = useState(false)
    var [selectedResa, setSelectedResa] = useState(emptyResa)
    var [selectedResaMatos, setSelectedResaMatos] = useState([])
    var [selectedResaConflicts, setSelectedResaConflicts] = useState([])

    var [planningLoading, setPlanningLoading] = useState(false)
    var [planning, setPlanning] = useState([])
    var [week, setWeek] = useState(0)

    var [invLoading, setInvLoading] = useState(false)
    var [detailsLoading, setDetailsLoading] = useState(false)
    var [inventory, setInventory] = useState([])

    var [invFailed, setInvFailed] = useState(false)
    var [planningFailed, setPlanningFailed] = useState(false)

    function isValid(name) {
        return name && name !== '' && !inventory.some((item) => item.name === name)
    }

    function isModifValid(id, name, desc, av, cat, q) {
        if (id === -1 || inventory.length === 0) {
            return false
        }
        const original = inventory.filter((m) => m.id === id)[0]
        return (
            name &&
            name !== '' &&
            !inventory.some((m) => id !== m.id && m.name === name) &&
            !(
                original.name === name &&
                original.description === desc &&
                original.available === av &&
                original.category_id === cat &&
                original.quantity === q
            )
        )
    }

    const refreshInventory = useCallback(async () => {
        setInvLoading(true)
        setInvFailed(false)
        try {
            const result = await post(api + '/api/inventory')
            setInventory(result.data.sort((a, b) => (a.name >= b.name ? 1 : a.name === b.name ? 0 : -1)))
        } catch (err) {
            console.log(err)
            setInvFailed(true)
        }
        setInvLoading(false)
    }, [post])

    async function setDetailsTab(id) {
        if (id === -1) return
        setDetailsLoading(true)
        try {
            const result = await post(api + '/api/item/' + id)
            if (result.data) {
                const item = result.data
                if (item && item.id && item.id === id) {
                    setDisplayDetails(true)
                    setSelectedItem(item)
                    setDisplayItemModif(false)
                    setTab(3)
                }
            } else {
                console.error('Could not retrieve data')
            }
        } catch (err) {
            console.log(err)
        }
        setDetailsLoading(false)
    }

    function closeDetailsTab() {
        setDisplayDetails(false)
        setSelectedItem(emptyItem)
        setTab(2)
    }

    async function setResaTab(id) {
        if (id !== -1) {
            setSelectedResaId(id)
            setDisplayResaModif(false)
            setDisplayResa(true)
            setTab(1)
        }
    }

    function closeResaTab() {
        setDisplayResa(false)
        setSelectedResaId(-1)
        setTab(0)
    }

    async function removeImage(id, filename) {
        const data = new FormData()
        data.append('id', id)
        data.append('filename', filename)
        setInvLoading(true)
        ;(async () => {
            await post(api + '/admin/removeImage', data)
            refreshInventory()
        })()
    }

    async function deleteItem(id) {
        const data = new FormData()
        data.append('id', id)
        setInvLoading(true)
        ;(async () => {
            await post(api + '/admin/removeEntry', data)
            if (id === selectedItem.id) {
                closeDetailsTab()
            }
            refreshInventory()
        })()
    }

    async function deleteResa(id) {
        const data = new FormData()
        data.append('id', id)
        ;(async () => {
            await post(api + '/api/removeResa', data)
            if (id === selectedResaId) {
                closeResaTab()
            }
            loadPlanning()
        })()
    }

    const loadResa = useCallback(async () => {
        if (selectedResaId === -1) {
            return
        }
        try {
            const resaData = await post(api + '/api/resa/' + selectedResaId)
            setSelectedResa(resaData.data)
            const matosData = await post(api + '/api/resa/' + selectedResaId + '/matos')
            var { matos, conflicts } = matosData.data
            setSelectedResaMatos(matos)
            setSelectedResaConflicts(conflicts)
        } catch (err) {
            console.log(err)
        }
    }, [selectedResaId, post])

    const loadPlanning = useCallback(async () => {
        setPlanningLoading(true)
        setPlanningFailed(false)
        try {
            setPlanning([])
            const res = await post(api + '/api/planning/' + week)
            const resData = res.data.sort((a, b) => (a.start >= b.start ? 1 : -1))
            for (const resa of resData) {
                const matosQuery = await post(api + '/api/resa/' + resa.id + '/matos')
                resa.matos = matosQuery.data.matos
                resa.conflicts = matosQuery.data.conflicts
            }
            setPlanning(resData)
        } catch (err) {
            console.log(err)
            setPlanningFailed(true)
        }
        setPlanningLoading(false)
    }, [week, post])

    useEffect(() => {
        refreshInventory()
        loadPlanning()
    }, [loadPlanning, refreshInventory])

    return (
        <div className="workspace">
            <Header
                tab={tab}
                setTab={setTab}
                displayDetails={displayDetails}
                detailsLoading={detailsLoading}
                displayResa={displayResa}
                session={session}
                logout={logout}
            />
            <div className="board">
                <div className="tab" display={tab === PLANNING_TAB ? '1' : '0'}>
                    <Planning
                        planning={planning}
                        setDetails={setDetailsTab}
                        setResa={setResaTab}
                        loading={planningLoading}
                        loadFail={planningFailed}
                        loadPlanning={loadPlanning}
                        setLoading={setPlanningLoading}
                        week={week}
                        setWeek={setWeek}
                        post={post}
                    />
                </div>
                <div className="tab" display={tab === RESA_TAB ? '1' : '0'}>
                    <Resa
                        id={selectedResaId}
                        resa={selectedResa}
                        matos={selectedResaMatos}
                        conflicts={selectedResaConflicts}
                        loadResa={loadResa}
                        setDetails={setDetailsTab}
                        setResa={setResaTab}
                        deleteResa={deleteResa}
                        inventory={inventory}
                        loadPlanning={loadPlanning}
                        modif={displayResaModif}
                        setModif={setDisplayResaModif}
                        post={post}
                        session={session}
                    />
                </div>
                <div className="tab" display={tab === INVENTORY_TAB ? '1' : '0'}>
                    <Inventory
                        setDetails={setDetailsTab}
                        refresh={refreshInventory}
                        loading={invLoading}
                        loadFail={invFailed}
                        setLoading={setInvLoading}
                        inventory={inventory}
                        isValid={isValid}
                        admin={session.admin}
                        post={post}
                        updateScroll={tab === INVENTORY_TAB}
                    />
                </div>
                <div className="tab" display={tab === DETAILS_TAB ? '1' : '0'}>
                    <Details
                        item={selectedItem}
                        refresh={() => {
                            setDetailsTab(selectedItem.id)
                            refreshInventory()
                        }}
                        deleteItem={deleteItem}
                        modif={displayItemModif}
                        setModif={setDisplayItemModif}
                        isModifValid={isModifValid}
                        removeImage={removeImage}
                        admin={session.admin}
                        post={post}
                    />
                </div>
            </div>
        </div>
    )
}

export default WorkSpace
