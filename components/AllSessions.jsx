import { useState, useEffect } from 'react'
import Alert from '@/components/Alert'
import ModulesBack from '@/components/ModulesBack'
import SessionsBack from '@/components/SessionsBack'
import EditModule from '@/components/EditModule'
import EditSession from '@/components/EditSession'
import AddModule from '@/components/AddModule'
import AddSession from '@/components/AddSession'
import SessionsModule from '@/components/SessionsModule'
import styles from '@/styles/Admin.module.css'

export default function Modules({setPage, page}){

    const [open, setOpen] = useState(null)
    const [alert, setAlert] = useState(null)
    const [actions, setActions] = useState(0)
    const [currentTri, setCurrentTri] = useState('desc')
    const [currentStatus, setCurrentStatus] = useState('')
    const [sessions, setSessions] = useState([])

    const getSessions = async (tri, status) => {
        let url = '/api/sessions/'
        if (tri) {
            url += `?tri=${encodeURIComponent(tri)}`;
        }

        if (status) {
            url += `&status=${encodeURIComponent(status)}`;
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
        const status = currentStatus
        setCurrentTri(tri)
        getSessions(tri, status);
    }

    const trierStatus = async (event) => {
        const status = event.target.value;
        const tri = currentTri
        setCurrentStatus(status)
        getSessions(tri, status);
    }

    const deleteSession = async (sessionId) => {
        try {
            const response = await fetch(`/api/sessions/delete/?id=${sessionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
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

    console.log(sessions)

    return (
        <>
            {open == null ? (
                <>
                    <div className="flex aligncenter space-between w100 gap40">
                        <span className={`${styles.Title} w65`}>Toutes les sessions</span>
                    </div>
                    <div className="flex gap20 mTop30">
                        <div className="select w50">
                            <select onChange={trierStatus} className="input-select">
                                <option value="">Filtrer par statut</option>
                                <option value="brouillon">Brouillons</option>
                                <option value="publish">Publiés</option>
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                        <div className="select w50">
                            <select onChange={trierSessions} className="input-select">
                                <option value="desc">Trier par date (ordre décroissant)</option>
                                <option value="asc">Trier par date (ordre croissant)</option>
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                    </div>
                    <div className="mTop30">
                        {sessions.length > 0 ? (
                            sessions.map((session, index) => {
                                return (
                                    <div key={index} className="w100 mBot10">
                                        <SessionsBack 
                                            date={session.dateDebut}
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
                                        />
                                    </div>                                     
                                )
                            })
                        ) : (
                            <>
                                <span>Il n'y a aucun module pour le moment.</span>
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
                            <SessionsModule setOpen={setOpen} id={open.id} nom={open.nom} />
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