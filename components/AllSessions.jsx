import { useState, useEffect } from 'react'
import Alert from '@/components/Alert'
import Reviews from '@/components/Reviews'
import Participants from '@/components/Participants'
import ModulesBack from '@/components/ModulesBack'
import SessionsBack from '@/components/SessionsBack'
import EditModule from '@/components/EditModule'
import EditSession from '@/components/EditSession'
import AddModule from '@/components/AddModule'
import AddSession from '@/components/AddSession'
import SessionsModule from '@/components/SessionsModule'
import styles from '@/styles/Admin.module.css'

export default function Modules({setPage, page, user}){

    const [open, setOpen] = useState(null)
    const [alert, setAlert] = useState(null)
    const [actions, setActions] = useState(0)
    const [currentTri, setCurrentTri] = useState('desc')
    const [currentCodes, setCurrentCodes] = useState('')
    const [currentStatus, setCurrentStatus] = useState('')
    const [sessions, setSessions] = useState([])
    const [currentRegion, setCurrentRegion] = useState('')

    const getSessions = async (tri, status, region, codes) => {
        let url = '/api/sessions/'
        if (tri) {
            url += `?tri=${encodeURIComponent(tri)}`;
        }

        if (codes) {
            url += `?tricodes=${encodeURIComponent(codes)}`;
        }

        if (status) {
            url += `&status=${encodeURIComponent(status)}`;
        }
        if(region) {
            url += `&region=${encodeURIComponent(region)}`
        }
        const fetcher = await fetch(url)
        const json = await fetcher.json()
        setSessions(json)
    }

    useEffect(() => {
        getSessions()
    }, [])
  
    const trierSessions = async (event) => {
        const tri = event.target.value;
        const codes = ''
        setCurrentCodes('')
        const status = currentStatus
        const region = currentRegion
        setCurrentTri(tri)
        getSessions(tri, status, region, codes);
    }

    const trierStatus = async (event) => {
        const status = event.target.value;
        const tri = currentTri
        const codes = currentCodes
        const region = currentRegion
        setCurrentStatus(status)
        getSessions(tri, status, region, codes);
    }

    const trierRegion = async (event) => {
        const region = event.target.value;
        const tri = currentTri
        const codes = currentCodes
        const status = currentStatus
        setCurrentRegion(region)
        getSessions(tri, status, region, codes);
    }

    const deleteSession = async (sessionId) => {
        try {
            const response = await fetch(`/api/sessions/delete/?id=${sessionId}`, {
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
            console.error('Erreur lors de la suppression de la session:', error.message);
        }
        
    }

    const trierParCodes = async (event) => {
        const region = currentRegion;
        const tri = ''
        const codes = event.target.value
        setCurrentCodes(codes)
        const status = currentStatus
        getSessions(tri, status, region, codes);
    }


    return (
        <>
            {open == null ? (
                <>
                    <div className="flex aligncenter space-between w100 gap40">
                        <span className={`${styles.Title} w65`}>Toutes les sessions</span>
                    </div>
                    <div className="flex gap20 mTop30">
                        <div className="select w20">
                            <select onChange={trierStatus} className="input-select">
                                <option value="">Filtrer par statut</option>
                                <option value="brouillon">Brouillons</option>
                                <option value="publish">Publiés</option>
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                        <div className="select w20">
                            <select onChange={trierRegion} className="input-select">
                                <option value="">Filtrer par région</option>
                                <option>Auvergne-Rhône-Alpes</option>
                                <option>Bourgogne-Franche-Comté</option>
                                <option>Bretagne</option>
                                <option>Centre-Val de Loire</option>
                                <option>Corse</option>
                                <option>Grand-Est</option>
                                <option>Hauts-de-France</option>
                                <option>Île-de-France</option>
                                <option>Normandie</option>
                                <option>Nouvelle-Aquitaine</option>
                                <option>Occitanie</option>
                                <option>Pays de la Loire</option>
                                <option>Provence-Alpes-Côte d'Azur</option>
                                <option>Guadeloupe</option>
                                <option>Martinique</option>
                                <option>Guyane</option>
                                <option>La Reunion</option>
                                <option>Mayotte</option>
                                <option>Polynésie Française</option>
                                <option>Saint-Pierre et Miquelon</option>
                                <option>Océan Indien</option>
                                <option>Nouvelle Calédonie</option>
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                        <div className="select w30">
                            <select value={currentTri} onChange={trierSessions} className="input-select">
                                <option value="">Trier par date</option>
                                <option value="desc">Ordre descendant</option>
                                <option value="asc">Ordre ascendant</option>
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
                                {sessions.length > 0 ? (
                                    sessions.map((session, index) => {
                                        if(session.status == 'publish' || user.type == 'Administrateur' || user.id == 10){
                                            return (
                                                <div key={index} className="w100 mBot10">
                                                    <SessionsBack 
                                                        date={session.dateDebut}
                                                        code={session.module.code}
                                                        region={session.region}
                                                        dept={session.departement}
                                                        title={session.moduleName}
                                                        id={session.id}
                                                        moduleId={session.moduleId}
                                                        setOpen={setOpen}
                                                        setAlert={setAlert}
                                                        action={() => deleteSession(session.id)}
                                                        status={session.status}
                                                        setActions={setActions}
                                                        session={session}
                                                        user={user}
                                                    />
                                                </div>                                     
                                            )
                                        }
                                    })
                                ) : (
                                    <>
                                        <span>Il n'y a aucun module pour le moment.</span>
                                    </>
                                )}                           
                            </>
                        ) : (
                            <>
                                {sessions.filter(session => 
                                    user.modules.includes(session.module.code) && 
                                    user.regions.includes(session.region)
                                ).length > 0 ? (
                                    sessions.filter(session => 
                                        user.modules.includes(session.module.code) && 
                                        user.regions.includes(session.region)
                                    ).map((session, index) => {
                                        if(session.status == 'publish' || user.type == 'Administrateur' || user.id == 10){
                                            return (
                                                <div key={index} className="w100 mBot10">
                                                    <SessionsBack 
                                                        date={session.dateDebut}
                                                        code={session.module.code}
                                                        region={session.region}
                                                        dept={session.departement}
                                                        title={session.moduleName}
                                                        id={session.id}
                                                        moduleId={session.moduleId}
                                                        setOpen={setOpen}
                                                        setAlert={setAlert}
                                                        action={() => deleteSession(session.id)}
                                                        status={session.status}
                                                        setActions={setActions}
                                                        session={session}
                                                        user={user}
                                                    />
                                                </div>                                     
                                            )
                                        }
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
                    {open.type == 'check' && (
                        <Participants session={open.session} setOpen={setOpen}  />
                    )}
                    {open.type == 'reviews' && (
                        <Reviews session={open.session} setOpen={setOpen}  />
                    )}
                    {open.type == 'edit' && (
                        <>
                            {open.model == 'module' ? (
                                <EditModule setOpen={setOpen} id={open.id} />
                            ) : (
                                <EditSession setOpen={setOpen} id={open.id} nom={open.nom} moduleId={open.moduleId} setPage={setPage} page={page} />
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