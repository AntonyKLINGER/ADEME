import { useState, useEffect } from 'react'
import Alert from '@/components/Alert'
import { Notif } from '@/components/Notif'
import styles from '@/styles/Admin.module.css'

export default function Comptes({ user }) {

    const [alert, setAlert] = useState(null)
    const [notif, setNotif] = useState(null)
    const [create, setCreate] = useState(false)
    const [actions, setActions] = useState(1)
    const [account, setAccount] = useState({ regions: [], modules: [] })
    const [modules, setModules] = useState([])
    const [listAccount, setListAccount] = useState([])
    const [openSettings, setOpenSettings] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState(null)

    useEffect(() => {
        const getAccounts = async () => {
            const geter = await fetch(`/api/accounts/`)
            const json = await geter.json()
            setListAccount(json)
        }
        getAccounts()
    }, [alert, actions])

    useEffect(() => {
        const getModules = async () => {
            const geter = await fetch(`/api/modules`)
            const json = await geter.json()
            setModules(json)
        }
        getModules()
    }, [])

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;

        if (type === 'checkbox') {
            setAccount(prev => {
                const group = name; // use the name as the group identifier (regions or modules)
                const updatedGroup = checked
                    ? [...(prev[group] || []), value]
                    : (prev[group] || []).filter(item => item !== value);
                return {
                    ...prev,
                    [group]: updatedGroup
                };
            });
        } else {
            setAccount(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const createAccount = async () => {
        const { email, type, modules, regions } = account
        if (email && type) {
            const add = await fetch(`/api/accounts/create`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    type: type,
                    modules: modules || [],
                    regions: regions || []
                })
            })
            const json = await add.json()
            if (json.status == "success") {

                //reset
                setCreate(false)
                setAccount({ regions: [], modules: [] })
                setActions(prev => prev + 1)

                setNotif({
                    text: 'Le compte a bien été créé !',
                    icon: 'done'
                });
            }
            else {
                setNotif({
                    text: 'Cette adresse e-mail admin ou DR existe déjà !',
                    icon: 'close'
                });
            }
        }
        else {
            setNotif({
                text: 'Une information est manquante.',
                icon: 'close'
            });
        }
    }

    const preDeleteAccount = (id) => {
        setAlert({
            icon: 'warning',
            text: 'Êtes-vous sûr de vouloir supprimer ce compte ?',
            action: () => deleteAccount(id)
        });
    }

    const deleteAccount = async (id) => {
        const response = await fetch(`/api/accounts/delete/?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            setNotif({
                text: 'Le compte a bien été supprimé.',
                icon: 'done'
            });
            setActions(prev => prev + 1); // Refresh the list of accounts
        }
        setAlert(null)
    }

    const openAllSettings = (account) => {
        setSelectedAccount(account);
        setAccount({
            ...account,
            regions: account.regions || [],
            modules: account.modules || []
        }); // Pré-remplir le formulaire avec les valeurs du compte sélectionné
        setOpenSettings(true);
    }

    const updateAccount = async () => {
        const { email, type, modules, regions, id } = account;
        if (email && type) {
            const update = await fetch(`/api/accounts/update`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: id,
                    email: email,
                    type: type,
                    modules: modules || [],
                    regions: regions || []
                })
            })
            const json = await update.json()
            if (json.status == "success") {

                //reset
                setOpenSettings(false)
                setSelectedAccount(null)
                setAccount({ regions: [], modules: [] })
                setActions(prev => prev + 1)

                setNotif({
                    text: 'Le compte a bien été mis à jour !',
                    icon: 'done'
                });
            }
            else {
                setNotif({
                    text: 'Erreur lors de la mise à jour du compte !',
                    icon: 'close'
                });
            }
        }
        else {
            setNotif({
                text: 'Une information est manquante.',
                icon: 'close'
            });
        }
        
    }


    const closeSettings = () => {
        setOpenSettings(false);
        setSelectedAccount(null);
        setAccount({ regions: [], modules: [] });
    }

    return (
        <>
            <div className="flex aligncenter space-between w100 gap40">
                <span className={`${styles.Title} w65`}>Comptes administrateurs et DR</span>
                <button onClick={() => setCreate(prev => !prev)} className="btn__normal btn__dark">{create ? 'X' : 'Créer un compte'}</button>
            </div>
            {create && (
                <div>
                    <div className="flex gap15">
                        <div className="w50 wm100">
                            <span className={styles.Subtitle}>Adresse e-mail du compte</span>
                            <input type="mail" name="email" onChange={handleChange} value={account.email || ''} className="input-text w100 wm100" placeholder="Adresse e-mail" />
                        </div>
                        <div className="w50 wm100">
                            <span className={styles.Subtitle}>Type de compte</span>
                            <div className="select w100">
                                <select onChange={handleChange} name="type" value={account.type || ''} className="input-select">
                                    <option value=''>Choisir un type de compte</option>
                                    <option>Administrateur</option>
                                    <option>DR</option>
                                </select>
                                <span className="material-icons">expand_more</span>
                            </div>
                        </div>
                    </div>
                    {account.type == "DR" && (
                        <div className="flex gap15">
                            <div className="w50">
                                <span className={styles.Subtitle}>Région</span>
                                <div className="flex wrap gap15 mTop10">
                                    <div className="flex aligncenter gap5">
                                        <input id="region_a" type="checkbox" onChange={handleChange} name="regions" value="Auvergne-Rhône-Alpes" checked={account.regions.includes("Auvergne-Rhône-Alpes")} />
                                        <label htmlFor="region_a">Auvergne-Rhône-Alpes</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_b" type="checkbox" onChange={handleChange} name="regions" value="Bourgogne-Franche-Comté" checked={account.regions.includes("Bourgogne-Franche-Comté")} />
                                        <label htmlFor="region_b">Bourgogne-Franche-Comté</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_c" type="checkbox" onChange={handleChange} name="regions" value="Bretagne" checked={account.regions.includes("Bretagne")} />
                                        <label htmlFor="region_c">Bretagne</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_d" type="checkbox" onChange={handleChange} name="regions" value="Centre-Val de Loire" checked={account.regions.includes("Centre-Val de Loire")} />
                                        <label htmlFor="region_d">Centre-Val de Loire</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_e" type="checkbox" onChange={handleChange} name="regions" value="Corse" checked={account.regions.includes("Corse")} />
                                        <label htmlFor="region_e">Corse</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_f" type="checkbox" onChange={handleChange} name="regions" value="Normandie" checked={account.regions.includes("Normandie")} />
                                        <label htmlFor="region_f">Normandie</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_g" type="checkbox" onChange={handleChange} name="regions" value="Nouvelle-Aquitaine" checked={account.regions.includes("Nouvelle-Aquitaine")} />
                                        <label htmlFor="region_g">Nouvelle-Aquitaine</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_h" type="checkbox" onChange={handleChange} name="regions" value="Occitanie" checked={account.regions.includes("Occitanie")} />
                                        <label htmlFor="region_h">Occitanie</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_i" type="checkbox" onChange={handleChange} name="regions" value="Grand-Est" checked={account.regions.includes("Grand-Est")} />
                                        <label htmlFor="region_i">Grand-Est</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_j" type="checkbox" onChange={handleChange} name="regions" value="Hauts-de-France" checked={account.regions.includes("Hauts-de-France")} />
                                        <label htmlFor="region_j">Hauts-de-France</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_k" type="checkbox" onChange={handleChange} name="regions" value="Île-de-France" checked={account.regions.includes("Île-de-France")} />
                                        <label htmlFor="region_k">Île-de-France</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_l" type="checkbox" onChange={handleChange} name="regions" value="Pays de la Loire" checked={account.regions.includes("Pays de la Loire")} />
                                        <label htmlFor="region_l">Pays de la Loire</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_m" type="checkbox" onChange={handleChange} name="regions" value="Provence-Alpes-Côte d'Azur" checked={account.regions.includes("Provence-Alpes-Côte d'Azur")} />
                                        <label htmlFor="region_m">Provence-Alpes-Côte d'Azur</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_n" type="checkbox" onChange={handleChange} name="regions" value="Guadeloupe" checked={account.regions.includes("Guadeloupe")} />
                                        <label htmlFor="region_n">Guadeloupe</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_o" type="checkbox" onChange={handleChange} name="regions" value="Martinique" checked={account.regions.includes("Martinique")} />
                                        <label htmlFor="region_o">Martinique</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_p" type="checkbox" onChange={handleChange} name="regions" value="Guyane" checked={account.regions.includes("Guyane")} />
                                        <label htmlFor="region_p">Guyane</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_q" type="checkbox" onChange={handleChange} name="regions" value="La Reunion" checked={account.regions.includes("La Reunion")} />
                                        <label htmlFor="region_q">La Reunion</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_r" type="checkbox" onChange={handleChange} name="regions" value="Mayotte" checked={account.regions.includes("Mayotte")} />
                                        <label htmlFor="region_r">Mayotte</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_r" type="checkbox" onChange={handleChange} name="regions" value="Polynésie Française" checked={account.regions.includes("Polynésie Française")} />
                                        <label htmlFor="region_r">Polynésie Française</label>
                                    </div>


                                    <div className="flex aligncenter gap5">
                                        <input id="region_r" type="checkbox" onChange={handleChange} name="regions" value="Saint-Pierre et Miquelon" checked={account.regions.includes("Saint-Pierre et Miquelon")} />
                                        <label htmlFor="region_r">Saint-Pierre et Miquelon</label>
                                    </div>


                                    <div className="flex aligncenter gap5">
                                        <input id="region_r" type="checkbox" onChange={handleChange} name="regions" value="Océan Indien" checked={account.regions.includes("Océan Indien")} />
                                        <label htmlFor="region_r">Océan Indien</label>
                                    </div>

                                    <div className="flex aligncenter gap5">
                                        <input id="region_r" type="checkbox" onChange={handleChange} name="regions" value="Nouvelle Calédonie" checked={account.regions.includes("Nouvelle Calédonie")} />
                                        <label htmlFor="region_r">Nouvelle Calédonie</label>
                                    </div>
                                </div>
                            </div>
                            <div className="w50">
                                <span className={styles.Subtitle}>Module(s) affecté(s)</span>
                                <div className="flex wrap gap15 mTop10">
                                    {modules.map((module, i) => {
                                        return (
                                            <div key={i} className="flex aligncenter gap5">
                                                <input id={`module_${i}`} type="checkbox" onChange={handleChange} name="modules" value={module.code} checked={account.modules.includes(module.code)} />
                                                <label htmlFor={`module_${i}`}>{module.nom}</label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    <button onClick={createAccount} className="btn__normal btn__dark mTop15">Créer le compte</button>
                </div>
            )}
            {listAccount.length > 0 ? (
                <>
                    {listAccount.map((acc, i) => {
                        return (
                            <div className={styles.accountSingle} key={i}>
                                <div className={`flex aligncenter space-between gap15 mTop15 ${styles.acc}`}>
                                    <p>{acc.email}</p>
                                    <div className="flex gap10 aligncenter">
                                        <span>{acc.type}</span>
                                        <button onClick={() => openAllSettings(acc)} className="btn__light">Modules/Régions</button>
                                        {user.type == 'Administrateur' && (
                                            <button onClick={() => preDeleteAccount(acc.id)}>Supprimer</button>
                                        )}                                       
                                    </div>
                                </div>
                                {openSettings && selectedAccount && selectedAccount.id === acc.id && (
                                    <div className={styles.accountSettings}>
                                        <div className="flex gap15">
                                            <div className="w50 wm100">
                                                <span className={styles.Subtitle}>Adresse e-mail du compte</span>
                                                <input type="mail" name="email" onChange={handleChange} value={account.email || ''} className="input-text w100 wm100" placeholder="Adresse e-mail" />
                                            </div>
                                            <div className="w50 wm100">
                                                <span className={styles.Subtitle}>Type de compte</span>
                                                <div className="select w100">
                                                    <select onChange={handleChange} name="type" value={account.type || ''} className="input-select">
                                                        <option value=''>Choisir un type de compte</option>
                                                        <option>Administrateur</option>
                                                        <option>DR</option>
                                                    </select>
                                                    <span className="material-icons">expand_more</span>
                                                </div>
                                            </div>
                                        </div>
                                        {account.type == "DR" && (
                                            <div className="flex gap15">
                                                <div className="w50">
                                                    <span className={styles.Subtitle}>Région</span>
                                                    <div className="flex wrap gap15 mTop10">
                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_a" type="checkbox" onChange={handleChange} name="regions" value="Auvergne-Rhône-Alpes" checked={account.regions.includes("Auvergne-Rhône-Alpes")} />
                                                            <label htmlFor="region_a">Auvergne-Rhône-Alpes</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_b" type="checkbox" onChange={handleChange} name="regions" value="Bourgogne-Franche-Comté" checked={account.regions.includes("Bourgogne-Franche-Comté")} />
                                                            <label htmlFor="region_b">Bourgogne-Franche-Comté</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_c" type="checkbox" onChange={handleChange} name="regions" value="Bretagne" checked={account.regions.includes("Bretagne")} />
                                                            <label htmlFor="region_c">Bretagne</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_d" type="checkbox" onChange={handleChange} name="regions" value="Centre-Val de Loire" checked={account.regions.includes("Centre-Val de Loire")} />
                                                            <label htmlFor="region_d">Centre-Val de Loire</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_e" type="checkbox" onChange={handleChange} name="regions" value="Corse" checked={account.regions.includes("Corse")} />
                                                            <label htmlFor="region_e">Corse</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_f" type="checkbox" onChange={handleChange} name="regions" value="Normandie" checked={account.regions.includes("Normandie")} />
                                                            <label htmlFor="region_f">Normandie</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_g" type="checkbox" onChange={handleChange} name="regions" value="Nouvelle-Aquitaine" checked={account.regions.includes("Nouvelle-Aquitaine")} />
                                                            <label htmlFor="region_g">Nouvelle-Aquitaine</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_h" type="checkbox" onChange={handleChange} name="regions" value="Occitanie" checked={account.regions.includes("Occitanie")} />
                                                            <label htmlFor="region_h">Occitanie</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_i" type="checkbox" onChange={handleChange} name="regions" value="Grand-Est" checked={account.regions.includes("Grand-Est")} />
                                                            <label htmlFor="region_i">Grand-Est</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_j" type="checkbox" onChange={handleChange} name="regions" value="Hauts-de-France" checked={account.regions.includes("Hauts-de-France")} />
                                                            <label htmlFor="region_j">Hauts-de-France</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_k" type="checkbox" onChange={handleChange} name="regions" value="Île-de-France" checked={account.regions.includes("Île-de-France")} />
                                                            <label htmlFor="region_k">Île-de-France</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_l" type="checkbox" onChange={handleChange} name="regions" value="Pays de la Loire" checked={account.regions.includes("Pays de la Loire")} />
                                                            <label htmlFor="region_l">Pays de la Loire</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_m" type="checkbox" onChange={handleChange} name="regions" value="Provence-Alpes-Côte d'Azur" checked={account.regions.includes("Provence-Alpes-Côte d'Azur")} />
                                                            <label htmlFor="region_m">Provence-Alpes-Côte d'Azur</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_n" type="checkbox" onChange={handleChange} name="regions" value="Guadeloupe" checked={account.regions.includes("Guadeloupe")} />
                                                            <label htmlFor="region_n">Guadeloupe</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_o" type="checkbox" onChange={handleChange} name="regions" value="Martinique" checked={account.regions.includes("Martinique")} />
                                                            <label htmlFor="region_o">Martinique</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_p" type="checkbox" onChange={handleChange} name="regions" value="Guyane" checked={account.regions.includes("Guyane")} />
                                                            <label htmlFor="region_p">Guyane</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_q" type="checkbox" onChange={handleChange} name="regions" value="La Reunion" checked={account.regions.includes("La Reunion")} />
                                                            <label htmlFor="region_q">La Reunion</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_r" type="checkbox" onChange={handleChange} name="regions" value="Mayotte" checked={account.regions.includes("Mayotte")} />
                                                            <label htmlFor="region_r">Mayotte</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_r" type="checkbox" onChange={handleChange} name="regions" value="Polynésie Française" checked={account.regions.includes("Polynésie Française")} />
                                                            <label htmlFor="region_r">Polynésie Française</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_r" type="checkbox" onChange={handleChange} name="regions" value="Saint-Pierre et Miquelon" checked={account.regions.includes("Saint-Pierre et Miquelon")} />
                                                            <label htmlFor="region_r">Saint-Pierre et Miquelon</label>
                                                        </div>


                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_r" type="checkbox" onChange={handleChange} name="regions" value="Océan Indien" checked={account.regions.includes("Océan Indien")} />
                                                            <label htmlFor="region_r">Océan Indien</label>
                                                        </div>

                                                        <div className="flex aligncenter gap5">
                                                            <input id="region_r" type="checkbox" onChange={handleChange} name="regions" value="Nouvelle Calédonie" checked={account.regions.includes("Nouvelle Calédonie")} />
                                                            <label htmlFor="region_r">Nouvelle Calédonie</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w50">
                                                    <span className={styles.Subtitle}>Module(s) affecté(s)</span>
                                                    <div className="flex wrap gap15 mTop10">
                                                        {modules.map((module, i) => {
                                                            return (
                                                                <div key={i} className="flex aligncenter gap5">
                                                                    <input id={`module_${i}`} type="checkbox" onChange={handleChange} name="modules" value={module.code} checked={account.modules.includes(module.code)} />
                                                                    <label htmlFor={`module_${i}`}>{module.nom}</label>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <button onClick={closeSettings} className="btn__normal btn__light mRight10">Fermer</button>
                                        <button onClick={updateAccount} className="btn__normal btn__dark mTop15">Mettre à jour le compte</button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </>
            ) : (
                <>
                    <p>Aucun compte n'a été créé pour le moment.</p>
                </>
            )}

            {alert != null && (
                <Alert datas={alert} setAlert={setAlert} />
            )}
            {notif != null && (
                <Notif datas={notif} setNotif={setNotif} />
            )}
        </>
    )
}
