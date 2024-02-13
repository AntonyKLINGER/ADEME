import { useState, useEffect } from 'react'
import Alert from '@/components/Alert'
import ModulesBack from '@/components/ModulesBack'
import EditModule from '@/components/EditModule'
import EditSession from '@/components/EditSession'
import AddModule from '@/components/AddModule'
import AddSession from '@/components/AddSession'
import SessionsModule from '@/components/SessionsModule'
import styles from '@/styles/Admin.module.css'

export default function Modules(){

    const [open, setOpen] = useState(null)
    const [alert, setAlert] = useState(null)
    const [notif, setNotif] = useState(null)

    const deleteModule = () => {
        console.log('deleted')
        setAlert(null)
    }

    console.log(open)

    return (
        <>
            {open == null ? (
                <>
                    <div className="flex aligncenter space-between w100 gap40">
                        <span className={`${styles.Title} w65`}>Tous les modules</span>
                        <button onClick={() => setOpen({ type: 'add' })} className="btn__normal btn__dark">Ajouter un nouveau module</button>
                    </div>
                    <div className="flex gap20 mTop30">
                        <div className="select w50">
                            <select className="input-select">
                                <option>Filtrer par pilier</option>
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                        <div className="select w50">
                            <select className="input-select">
                                <option>Trier par date de publication</option>
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                    </div>
                    <div className="mTop30">
                        <div className="w100 mBot10">
                            <ModulesBack 
                                date="21/02/2024"
                                category="Climat Air Énergie"
                                title="Énergie, eau et assainissement"
                                id="123"
                                setOpen={setOpen}
                                setAlert={setAlert}
                                action={deleteModule}
                            />
                        </div>  
                        <div className="w100 mBot10">
                            <ModulesBack 
                                date="21/02/2024"
                                category="Climat Air Énergie"
                                title="Énergie, eau et assainissement"
                                id="123"
                                setOpen={setOpen}
                                setAlert={setAlert}
                                action={deleteModule}
                            />
                        </div>  
                        <div className="w100 mBot10">
                            <ModulesBack 
                                date="21/02/2024"
                                category="Climat Air Énergie"
                                title="Énergie, eau et assainissement"
                                id="123"
                                setOpen={setOpen}
                                setAlert={setAlert}
                                action={deleteModule}
                            />
                        </div>  
                        <div className="w100 mBot10">
                            <ModulesBack 
                                date="21/02/2024"
                                category="Climat Air Énergie"
                                title="Énergie, eau et assainissement"
                                id="123"
                                setOpen={setOpen}
                                setAlert={setAlert}
                                action={deleteModule}
                            />
                        </div>  
                    </div>
                </>
            ) : (
                <>  
                    {open.type == 'edit' && (
                        <>
                            {open.model == 'module' ? (
                                <EditModule setOpen={setOpen} id={open.id} />
                            ) : (
                                <EditSession setOpen={setOpen} id={open.id} />
                            )}
                            
                        </>
                    )}
                    {open.type == 'add' && (
                        <>
                            {open.model == 'module' ? (
                                <AddModule setOpen={setOpen} id={open.id} />
                            ) : (
                                <AddSession setOpen={setOpen} id={open.id} />
                            )}  
                            
                        </>
                    )}
                    {open.type == 'sessions' && (
                        <>  
                            <div className="mBot30">
                                <span onClick={() => setOpen(null)} className={styles.Back}>Retour aux modules</span>
                            </div>
                            <SessionsModule setOpen={setOpen} id={open.id} />
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