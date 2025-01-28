import Link from 'next/link'
import { useState, useEffect } from 'react'
import styles from '@/styles/SessionsBack.module.css'

export default function SessionsBack({isModule, date, session, code, region, title, id, setOpen, setAlert, setActions, action, status, moduleId, dept, user}){

    function formatDate(dateString) {
        const base = dateString.split('T');
        const [year, month, day] = base[0].split('-')
        return `${day}/${month}/${year}`;
    }    
    
    const startDate = formatDate(date);

    const [number, setNumber] = useState(0)
    const [presentNumber, setPresentNumber] = useState(0)

    const getParticipants = async () => {
        const fetcher = await fetch(`/api/registrations/bySession?sessionId=${session.id}`)
        const json = await fetcher.json()
        if(json.length > 0){
            const activeParticipants = json.filter((item) => !item.deleted);
            setNumber(activeParticipants.length);

            const presentParticipants = activeParticipants.filter((item) => item.presence === true).length;
            setPresentNumber(presentParticipants);
        }
    }

    useEffect(() => {
        getParticipants()
    }, [session])

    const maintenant = new Date();
    const dateDebut = new Date(session.dateDebut);
    const differenceEnMs = dateDebut - maintenant;
    const joursRestants = Math.ceil(differenceEnMs / (1000 * 60 * 60 * 24));

    const publish = async () => {
        try {
            const response = await fetch(`/api/sessions/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
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

    return (
        <>
            <div className={`${styles.SessionBox} ${status == 'brouillon' ? styles.Brouillon : undefined}`}>
                <div className="flex aligncenter space-between">
                    <div className="flex aligncenter gap15">
                        <span className={styles.Date}>{startDate} - <span className={styles.Restant}>{joursRestants >= 0 ? `${joursRestants} jour${joursRestants > 1 ? 's': ''} restant${joursRestants > 1 ? 's': ''}` : 'Terminée'}</span> - <span className={styles.LastMaj}>{number} participant{number > 1 && 's'}</span>&nbsp;- <span className={styles.LastMaj}>{presentNumber} présent{number > 1 && 's'}</span></span>
                    </div>
                    <span className={styles.Region}>{dept} - {region}</span>
                </div>
                <div className="flex alignend space-between gap40 mTop20 w100">
                    <div className="w50">
                        <span className={styles.Title}><span>Module #{code} :</span>{status == 'brouillon' && '(Brouillon)'} {title}</span>
                    </div>
                    <div className="w50">
                        <div className="w100 flex aligncend flex-end gap5">
                            {user.type != 'DR' && (
                                <>
                                    <button 
                                        onClick={() => setAlert({
                                            icon: 'warning',
                                            text: 'Êtes-vous sûr de vouloir supprimer cette session ?',
                                            action: action,
                                            setAlert: setAlert
                                        })}
                                        className={styles.Corb}>
                                        <span className="material-icons">delete</span>
                                    </button>
                                    <button onClick={() => setOpen({ id: id, type: 'edit', model: 'session', nom: title, moduleId: moduleId })} className={styles.Register}>Modifier la session</button>
                                    {status == 'brouillon' && (
                                        <button  
                                            onClick={() => setAlert({
                                                icon: 'warning',
                                                text: 'Êtes-vous sûr de vouloir publier cette session ?',
                                                action: publish,
                                                setAlert: setAlert
                                            })}
                                            className={styles.Register}>
                                            Publier
                                        </button>
                                    )}                                
                                </>
                            )}
                        </div>
                        {!isModule && (
                            <div className="w100 flex aligncend flex-end gap5 mTop10">
                                <button onClick={() => {setOpen({ type: 'reviews', session: session })}} className={styles.Register}>Voir les avis</button>
                                <button onClick={() => {setOpen({ type: 'check', session: session })}} className={styles.Register}>Voir les participants</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}