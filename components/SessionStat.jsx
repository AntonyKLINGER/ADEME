import { useState, useEffect } from 'react'
import styles from '@/styles/SessionStat.module.css'

export default function SessionStat({ session, setOpen }){

    const [number, setNumber] = useState(0)

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const getParticipants = async () => {
        const fetcher = await fetch(`/api/registrations/bySession?sessionId=${session.id}`)
        const json = await fetcher.json()
        if(json.length > 0){
            setNumber(json.length)
        }
    }

    useEffect(() => {
        getParticipants()
    }, [])

    return (
        <>
            <div className={styles.SessionStat}>
                <div className="flex aligncenter space-between">
                    <div className="flex aligncenter gap15">
                        <span className={styles.Date}>{formatDate(session.dateDebut)}</span>
                        <span className={styles.Region}>{session.region}</span>
                    </div>
                    <span className={styles.LastMaj}>{number} participant{number > 1 && 's'}</span>
                </div>
                <div className="flex alignend space-between gap40 mTop20 w100">
                    <div className="w50">
                        <span className={styles.Title}>
                            <span>Module :</span>
                            {session.moduleName}
                        </span>
                    </div>
                    <div className="w50 flex alignend flex-end gap5">
                        <button onClick={() => {setOpen({ type: 'reviews', session: session })}} className={styles.Register}>Voir les avis</button>
                        <button onClick={() => {setOpen({ type: 'check', session: session })}} className={styles.Register}>Voir les participants</button>
                    </div>
                </div>
            </div>
        </>
    )
}