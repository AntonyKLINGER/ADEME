import { useState, useEffect } from 'react'
import Alert from '@/components/Alert'
import SessionsBack from '@/components/SessionsBack'
import EditModule from '@/components/EditModule'
import AddModule from '@/components/AddModule'
import styles from '@/styles/Admin.module.css'

export default function SessionsModule({ id, setOpen, open, nom, user }){

    const [nav, setNav] = useState(0)
    const [alert, setAlert] = useState(null)
    const [notif, setNotif] = useState(null)
    const [sessions, setSessions] = useState([])
    const [passed, setPassed] = useState('upcoming')
    const [actions, setActions] = useState(0)
    const moduleId = id

    const getSessions = async (passed) => {
        let url = '/api/sessions/?id='+moduleId;

        if (passed) {
            url += `&passed=${encodeURIComponent(passed)}`;
        }
        
        const fetcher = await fetch(url)
        const json = await fetcher.json()
        setSessions(json)
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
    useEffect(() => {
        getSessions(passed)
    }, [passed, actions, open])

    return (
        <>
            {open == null ? (
                <>
                    <div className="flex aligncenter space-between w100 gap40 mBot15">
                        <span className={`${styles.Title} w65`}>Toutes les sessions pour le module :<br />{nom}</span>
                        {user.type != 'DR' && (
                            <button onClick={() => setOpen({ type: 'add', model: 'session', nom: nom, id: id })} className="btn__normal btn__dark">Ajouter une session</button>
                        )}                  
                    </div>
                    <div className={styles.Menu}>
                        <button onClick={() => {setNav(0);setPassed('upcoming')}} className={nav == 0 ? styles.active : undefined}>Sessions programmées</button>
                        <button onClick={() => {setNav(1);setPassed('old')}} className={nav == 1 ? styles.active : undefined}>Sessions passées</button>
                    </div>
                    <div className="mTop30">
                        {user.type == "Administrateur" ? (
                            <>
                                {sessions.length > 0 ? (
                                    sessions.map((session, index) => {
                                        if(session.status == "publish" || user.type == 'Administrateur' || user.id == 10){
                                            return (
                                                <div key={index} className="w100 mBot10">
                                                    <SessionsBack 
                                                        date={session.dateDebut}
                                                        region={session.region}
                                                        dept={session.departement}
                                                        title={nom}
                                                        id={session.id}
                                                        moduleId={id}
                                                        setOpen={setOpen}
                                                        setAlert={setAlert}
                                                        action={() => deleteSession(session.id)}
                                                        status={session.status}
                                                        setActions={setActions}
                                                        session={session}
                                                        isModule="yes"
                                                        user={user}
                                                    />
                                                </div>                                     
                                            )
                                        }
                                    })
                                ) : (
                                    <>
                                        <span>Il n'y a aucune session pour le moment.</span>
                                    </>
                                )}                            
                            </>
                        ) : (
                            <>
                                {sessions.filter(session => user.regions.includes(session.region)).length > 0 ? (
                                    sessions.filter(session => user.regions.includes(session.region)).map((session, index) => {
                                        if(session.status == "publish" || user.type == 'Administrateur' || user.id == 10){
                                            return (
                                                <div key={index} className="w100 mBot10">
                                                    <SessionsBack 
                                                        date={session.dateDebut}
                                                        region={session.region}
                                                        dept={session.departement}
                                                        title={nom}
                                                        id={session.id}
                                                        moduleId={id}
                                                        setOpen={setOpen}
                                                        setAlert={setAlert}
                                                        action={() => deleteSession(session.id)}
                                                        status={session.status}
                                                        setActions={setActions}
                                                        session={session}
                                                        isModule="yes"
                                                        user={user}
                                                    />
                                                </div>                                     
                                            )
                                        }
                                    })
                                ) : (
                                    <>
                                        <span>Il n'y a aucune session pour le moment.</span>
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
                            <EditModule setOpen={setOpen} />
                        </>
                    )}
                    {open.type == 'add' && (
                        <>  
                            <AddModule setOpen={setOpen} />
                        </>
                    )}
                    {open.type == 'sessions' && (
                        <>  
                            Toutes les sessions
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