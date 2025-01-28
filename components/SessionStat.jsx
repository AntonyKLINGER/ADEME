import { useState, useEffect } from 'react'
import styles from '@/styles/SessionStat.module.css'

export default function SessionStat({ session, setOpen }){

    const [number, setNumber] = useState(0)

    function formatDate(dateString) {
        if(dateString){
            const base = dateString.split('T');
            const [year, month, day] = base[0].split('-')
            return `${day}/${month}/${year}`;
        } else{
            return '---'
        }
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
    }, [session])

    const maintenant = new Date();
    const dateDebut = new Date(session.dateDebut);
    const differenceEnMs = dateDebut - maintenant;
    const joursRestants = Math.ceil(differenceEnMs / (1000 * 60 * 60 * 24));

    return (
        <>
            <div className={`${styles.SessionStat} mBot10`}>
                <div className="flex aligncenter space-between">
                    <div className="flex aligncenter gap15">
                        <span className={styles.Date}>{formatDate(session.dateDebut)} - <span className={styles.Restant}>{joursRestants >= 0 ? `${joursRestants} jour${joursRestants > 1 ? 's': ''} restant${joursRestants > 1 ? 's': ''}` : 'Terminée'}</span></span>
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
                        <button onClick={() => {setOpen({ type: 'edit', session: session })}} className={styles.Register}>Infos</button>
                    </div>
                </div>
            </div>
        </>
    )
}