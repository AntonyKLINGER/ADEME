import { useState, useEffect } from 'react'
import Alert from '@/components/Alert'
import ModulesBack from '@/components/ModulesBack'
import EditModule from '@/components/EditModule'
import EditSession from '@/components/EditSession'
import AddModule from '@/components/AddModule'
import AddSession from '@/components/AddSession'
import SessionsModule from '@/components/SessionsModule'
import styles from '@/styles/Admin.module.css'

export default function Modules({setPage, user}){

    console.log(user)

    const [open, setOpen] = useState(null)
    const [alert, setAlert] = useState(null)
    const [notif, setNotif] = useState(null)
    const [filter, setFilter] = useState(null)
    const [currentPilier, setCurrentPilier] = useState('')
    const [currentTri, setCurrentTri] = useState('desc')
    const [currentCodes, setCurrentCodes] = useState('')
    const [actions, setActions] = useState(0)

    const deleteModule = async (moduleId) => {
        try {
            const response = await fetch(`/api/modules/delete/?id=${moduleId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_ADMIN_KEY
                },
            });
    
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
    
            const result = await response.json();
            setAlert(null)
            setActions(prev => prev+1)
        } catch (error) {
            console.error('Erreur lors de la suppression du module:', error.message);
        }
        
    }

    const [modules, setModules] = useState([])

    const getModules = async (pilier, tri, codes) => {
        let url = '/api/modules/?';
    
        if (pilier) {
            url += `pilier=${encodeURIComponent(pilier)}&`;
        }
    
        if (tri) {
            url += `tri=${encodeURIComponent(tri)}`;
        }

        if (codes) {
            url += `tricodes=${encodeURIComponent(codes)}`;
        }
    
        const fetcher = await fetch(url)
        const json = await fetcher.json()
        setModules(json)
    }
    
    const filterModules = async (event) => {
        const filter = event.target.value;
        setCurrentPilier(filter)

        const tri = currentTri; 
        const codes = currentCodes;
        getModules(filter, tri, codes);
    }
    
    const trierModules = async (event) => {
        const tri = event.target.value;
        setCurrentTri(tri)

        const pilier = currentPilier; 
        const codes = '';
        setCurrentCodes('')
        
        getModules(pilier, tri, codes);
        
    }

    const trierParCodes = async (event) => {
        const cod = event.target.value
        setCurrentCodes(cod)

        setCurrentTri('')
        const tri = ''

        const pilier = currentPilier; 
        getModules(pilier, tri, cod);
    }
    

    useEffect(() => {
        getModules(currentPilier, currentTri)
    }, [open, actions])

    useEffect(() => {
        console.log("open => ",open)
        if(open?.page != undefined){
            setPage(open.page)
        }
    }, [open])


    return (
        <>
            {open == null ? (
                <>
                    <div className="flex aligncenter space-between w100 gap40">
                        <span className={`${styles.Title} w65`}>Tous les modules</span>
                        {user.type != 'DR' && (
                            <button onClick={() => setOpen({ type: 'add', model: 'module' })} className="btn__normal btn__dark">Ajouter un nouveau module</button>
                        )}                        
                    </div>
                    <div className="flex gap20 mTop30">
                        <div className="select w30">
                            <select onChange={filterModules} className="input-select">
                                <option value="">Filtrer par un axe spécifique</option>
                                <option>Climat Air Energie</option>
                                <option>Economie circulaire</option>
                                <option>Approche transversale</option>
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                        <div className="select w35">
                            <select value={currentTri} onChange={trierModules} className="input-select">
                                <option value="desc">Trier par dernière date de publication</option>
                                <option value="asc">Trier par première date de publication</option>
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                        <div className="select w30">
                            <select value={currentCodes} onChange={trierParCodes} className="input-select">
                                <option value="">Trier par codes</option>
                                <option value="asc">Ordre ascendant</option>
                                <option value="desc">Ordre descendant</option>
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                    </div>
                    <div className="mTop30">
                        {user.type == "Administrateur" ? (
                            <>
                                {modules.length > 0 ? (
                                    modules.map((module, index) => {
                                        return (
                                            <div key={index} className="w100 mBot10">
                                                <ModulesBack 
                                                    date={module.datePublication}
                                                    code={module.code}
                                                    lastUpdate={module.lastUpdate}
                                                    category={module.pilier}
                                                    title={module.nom}
                                                    id={module.id}
                                                    setOpen={setOpen}
                                                    setAlert={setAlert}
                                                    sessions={module.sessions}
                                                    action={() => deleteModule(module.id)}
                                                    user={user}
                                                />
                                            </div>                                     
                                        )
                                    })
                                ) : (
                                    <>
                                        <span>Il n'y a aucun module pour le moment.</span>
                                    </>
                                )}                            
                            </>
                        ) : (
                            <>
                                {modules.filter(module => user.modules.includes(module.code)).length > 0 ? (
                                    modules.filter(module => user.modules.includes(module.code)).map((module, index) => {
                                        const filteredSessions = module.sessions.filter(session => user.regions.includes(session.region));
                                        return (
                                            <div key={index} className="w100 mBot10">
                                                <ModulesBack 
                                                    date={module.datePublication}
                                                    code={module.code}
                                                    lastUpdate={module.lastUpdate}
                                                    category={module.pilier}
                                                    title={module.nom}
                                                    id={module.id}
                                                    setOpen={setOpen}
                                                    setAlert={setAlert}
                                                    sessions={filteredSessions}
                                                    action={() => deleteModule(module.id)}
                                                    user={user}
                                                />
                                            </div>                                     
                                        )
                                    })
                                ) : (
                                    <>
                                        <span>Il n'y a aucun module pour le moment.</span>
                                    </>
                                )}                            
                            </>
                        )}
                    </div>
                </>
            ) : (
                <>  
                    {open.type == 'edit' && (
                        <>
                            {open.model == 'module' ? (
                                <EditModule setOpen={setOpen} id={open.id} />
                            ) : (
                                <EditSession setOpen={setOpen} id={open.id} nom={open.nom} moduleId={open.moduleId} />
                            )}
                            
                        </>
                    )}
                    {open.type == 'add' && (
                        <>
                            {open.model == 'module' ? (
                                <AddModule setOpen={setOpen} id={open.id} />
                            ) : (
                                <AddSession setOpen={setOpen} id={open.id} nom={open.nom} />
                            )}  
                            
                        </>
                    )}
                    {open.type == 'sessions' && (
                        <>  
                            <div className="mBot30">
                                <span onClick={() => setOpen(null)} className={styles.Back}>Retour aux modules</span>
                            </div>
                            <SessionsModule setOpen={setOpen} id={open.id} nom={open.nom} user={user} />
                        </>
                    )}
                </>
            )}
            {alert != null && (
                <Alert datas={alert} setAlert={setAlert} />
            )}  
        </>
    )
}