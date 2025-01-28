import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Notif } from '@/components/Notif'
import EditSession from '@/components/EditSession'
import SessionStat from '@/components/SessionStat'
import Reviews from '@/components/Reviews'
import Participants from '@/components/Participants'
import styles from '@/styles/Admin.module.css'

export default function Inscriptions(){

    const [open, setOpen] = useState(null)
    const [alert, setAlert] = useState(null)
    const [notif, setNotif] = useState(null)
    const [modules, setModules] = useState([])
    const [sessions, setSessions] = useState([])
    const [region, setRegion] = useState('')
    const [module, setModule] = useState(0)

    const getModules = async () => {
        let url = '/api/modules/'
        const fetcher = await fetch(url)
        const json = await fetcher.json()
        setModules(json)
    }

    const getSessions = async (region, module) => {
        setNotif({
            icon: 'hourglass_top',
            text: 'Chargement des sessions...'
        })
        let url = '/api/sessions/?'

        if(region){
            url += 'region='+encodeURIComponent(region)+'&'
        }

        if(module){
            url += 'id='+encodeURIComponent(module)+'&'
        }

        const fetcher = await fetch(url)
        const json = await fetcher.json()
        setSessions(json)
    }

    useEffect(() => {
        getModules()
        getSessions()
    }, [])

    useEffect(() => {
        getSessions(region, module)
    }, [module, region])


    return (
        <>
            {open == null ? (
                <>
                    <div className="flex aligncenter space-between w100 gap40">
                        <span className={`${styles.Title} w65`}>Toutes les inscriptions par session</span>
                    </div>
                    <div className="flex gap20 mTop30">
                        <div className="select w50">
                            <select name="module" value={module} onChange={(event) => {setModule(event.target.value)}} className="input-select">
                                <option value="">Filtrer par module</option>
                                {modules.map((module, index) => {
                                    return <option value={module.id} key={index}>{module.nom}</option>
                                })}
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                        <div className="select w50">
                            <select name="region" value={region} onChange={(event) => {setRegion(event.target.value)}} className="input-select">
                                <option value="">Filtrer par région</option>
                                <option>Auvergne-Rhône-Alpes</option>
                                <option>Bourgogne-Franche-Comté</option>
                                <option>Bretagne</option>
                                <option>Centre-Val de Loire</option>
                                <option>Corse</option>
                                <option>Normandie</option>
                                <option>Nouvelle-Aquitaine</option>
                                <option>Occitanie</option>
                                <option>Grand-Est</option>
                                <option>Hauts-de-France</option>
                                <option>Île-de-France</option>
                                <option>Pays de la Loire</option>
                                <option>Provence-Alpes-Côte d'Azur</option>
                                <option>Polynésie Française</option>
                                <option>Saint-Pierre et Miquelon</option>
                                <option>Océan Indien</option>
                                <option>Nouvelle Calédonie</option>
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                    </div>
                    <span className={styles.Subtitle}>
                        {(region || module) ? (
                            <>
                                Toutes les sessions suivants les filtres :
                            </>
                        ) : (
                            <>Les 10 dernières sessions publiées</>
                        )}
                        
                    </span>
                    <div className="mTop30">
                        {sessions.length > 0 ? (
                            <>
                                {sessions.map((session, index) => {
                                    return (
                                        <SessionStat key={index} session={session} setOpen={setOpen} />
                                    )
                                })}                            
                            </>
                        ) : (
                            <span>Aucune session pour le moment.</span>
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
                        <EditSession setOpen={setOpen} id={open.session.id} nom={open.session.moduleName} moduleId={open.session.moduleId} page={3} />
                    )}
                </>
            )}
            {notif != null && (
                <Notif datas={notif} setNotif={setNotif} />
            )}
        </>
    )
}