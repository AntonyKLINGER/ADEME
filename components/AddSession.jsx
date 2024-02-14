import { useState, useEffect } from 'react'
import Alert from '@/components/Alert'
import { Notif } from '@/components/Notif'
import DynamicQuill from '@/components/DynamicQuill';
import styles from '@/styles/Admin.module.css'
import 'react-quill/dist/quill.snow.css';

export default function AddSession({setOpen, id, nom}){

    const [alert, setAlert] = useState(null)
    const [notif, setNotif] = useState(null)
    const [indexToDelete, setIndexToDelete] = useState(null);
    const [indexToDeleteI, setIndexToDeleteI] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [datas, setDatas] = useState({
        moduleId: id,
        departement: '',
        region: '',
        metasSession: {
          dateHoraires: '',
          lieuRencontre: '',
          nombrePlaces: '',
          infosTransport: '',
          dateLimiteInscription: '',
          infosComplementaires: '',
          intervenants: [],
          programmeSession: [],
          urlsPDF: []
        }
    });

    const addTranche = () => {
        setDatas(prevDatas => {
            // Copie profonde pour éviter les mutations directes
            const updatedDatas = JSON.parse(JSON.stringify(prevDatas));
    
            // Vérifie si le tableau programmeModule existe, sinon crée un tableau vide
            if (!updatedDatas.metasSession.programmeSession) {
                updatedDatas.metasSession.programmeSession = [];
            }
    
            // Ajoute un nouvel objet tranche avec des valeurs vides ou par défaut
            updatedDatas.metasSession.programmeSession.push({
                horaires: '',
                titre: '',
                description: ''
            });
    
            return updatedDatas;
        });
    };

    const addIntervenant = () => {
        setDatas(prevDatas => {
            // Copie profonde pour éviter les mutations directes
            const updatedDatas = JSON.parse(JSON.stringify(prevDatas));
    
            // Vérifie si le tableau programmeModule existe, sinon crée un tableau vide
            if (!updatedDatas.metasSession.intervenants) {
                updatedDatas.metasSession.intervenants = [];
            }
    
            // Ajoute un nouvel objet tranche avec des valeurs vides ou par défaut
            updatedDatas.metasSession.intervenants.push({
                nom: '',
                fonction: '',
                structure: '',
                email: ''
            });
    
            return updatedDatas;
        });
    };

    const deleteTranche = (indexToDelete) => {
        setDatas(prevDatas => {
            const updatedProgrammeSession = prevDatas.metasSession.programmeSession.filter((_, index) => index !== indexToDelete);
            return {
                ...prevDatas,
                metasSession: {
                    ...prevDatas.metasSession,
                    programmeSession: updatedProgrammeSession
                }
            };
        });
        setAlert(null)
    };    

    const deleteIntervenant = (indexToDeleteI) => {
        setDatas(prevDatas => {
            const updateIntervenantsSession = prevDatas.metasSession.intervenants.filter((_, index) => index !== indexToDeleteI);
            return {
                ...prevDatas,
                metasSession: {
                    ...prevDatas.metasSession,
                    intervenants: updateIntervenantsSession
                }
            };
        });
        setAlert(null)
    };    

    const requestDeleteTranche = (index) => {
        setIndexToDelete(index);
        setAlert({
            icon: 'warning',
            text: 'Êtes-vous sûr de vouloir supprimer cette section ?',
            // Supposons que `action` sera appelé si l'utilisateur confirme
            action: () => deleteTranche(index)
        });
    };

    const requestDeleteIntervenant = (index) => {
        setIndexToDeleteI(index);
        setAlert({
            icon: 'warning',
            text: 'Êtes-vous sûr de vouloir supprimer cet intervenant ?',
            // Supposons que `action` sera appelé si l'utilisateur confirme
            action: () => deleteIntervenant(index)
        });
    };

    const handleChange = (event) => {
        const { name, value, dataset } = event.target;
        const index = dataset.index; // Récupérer l'index pour les éléments du tableau, si défini
    
        setDatas(prevDatas => {
            // Gestion des champs dans le tableau programmeModule
            if (name.startsWith("metasSession.programmeSession") && index !== undefined) {
                const fieldName = name.split(".")[2]; // Obtient 'horaires' de "metasSession.programmeSession.horaires"
    
                // Copie profonde pour éviter la mutation directe (optionnelle mais recommandée)
                const updatedDatas = JSON.parse(JSON.stringify(prevDatas));
    
                // Assurez-vous que programmeSession est initialisé
                if (!updatedDatas.metasSession.programmeSession) {
                    updatedDatas.metasSession.programmeSession = [];
                }
    
                // Mettre à jour l'élément spécifique dans le tableau
                if (updatedDatas.metasSession.programmeSession[index]) {
                    updatedDatas.metasSession.programmeSession[index][fieldName] = value;
                }
    
                return updatedDatas;
            }
            else if (name.startsWith("metasSession.intervenants") && index !== undefined) {
                const fieldName = name.split(".")[2]; // Obtient 'horaires' de "metasSession.programmeSession.horaires"
    
                // Copie profonde pour éviter la mutation directe (optionnelle mais recommandée)
                const updatedDatas = JSON.parse(JSON.stringify(prevDatas));
    
                // Assurez-vous que programmeSession est initialisé
                if (!updatedDatas.metasSession.intervenants) {
                    updatedDatas.metasSession.intervenants = [];
                }
    
                // Mettre à jour l'élément spécifique dans le tableau
                if (updatedDatas.metasSession.intervenants[index]) {
                    updatedDatas.metasSession.intervenants[index][fieldName] = value;
                }
    
                return updatedDatas;
            }
            else if (name.includes('.')) {
                // Gestion des champs imbriqués mais pas dans un tableau
                const [parent, key] = name.split('.');
                return {
                    ...prevDatas,
                    [parent]: {
                        ...prevDatas[parent],
                        [key]: value
                    }
                };
            } else {
                // Gérer les champs de niveau supérieur
                return {
                    ...prevDatas,
                    [name]: value
                };
            }
        });
    };

    const moveSectionUp = (index) => {
        if (index === 0) return; // Ne peut pas déplacer plus haut que le premier élément
    
        setDatas((prevDatas) => {
            const updatedProgrammeSession = [...prevDatas.metasSession.programmeSession];
            [updatedProgrammeSession[index], updatedProgrammeSession[index - 1]] = [updatedProgrammeSession[index - 1], updatedProgrammeSession[index]]; // Échanger les éléments
    
            return {
                ...prevDatas,
                metasSession: {
                    ...prevDatas.metasSession,
                    programmeSession: updatedProgrammeSession,
                },
            };
        });
    };

    const moveSectionUpI = (index) => {
        if (index === 0) return; // Ne peut pas déplacer plus haut que le premier élément
    
        setDatas((prevDatas) => {
            const updatedIntervenantsSession = [...prevDatas.metasSession.intervenants];
            [updatedIntervenantsSession[index], updatedIntervenantsSession[index - 1]] = [updatedIntervenantsSession[index - 1], updatedIntervenantsSession[index]]; // Échanger les éléments
    
            return {
                ...prevDatas,
                metasSession: {
                    ...prevDatas.metasSession,
                    intervenants: updatedIntervenantsSession,
                },
            };
        });
    };
    
    const moveSectionDown = (index) => {
        if (index === datas.metasSession.programmeSession.length - 1) return; // Ne peut pas déplacer en dessous du dernier élément
    
        setDatas((prevDatas) => {
            const updatedProgrammeSession = [...prevDatas.metasSession.programmeSession];
            [updatedProgrammeSession[index], updatedProgrammeSession[index + 1]] = [updatedProgrammeSession[index + 1], updatedProgrammeSession[index]]; // Échanger les éléments
    
            return {
                ...prevDatas,
                metasSession: {
                    ...prevDatas.metasSession,
                    programmeSession: updatedProgrammeSession,
                },
            };
        });
    };  
    
    const moveSectionDownI = (index) => {
        if (index === datas.metasSession.intervenants.length - 1) return; // Ne peut pas déplacer en dessous du dernier élément
    
        setDatas((prevDatas) => {
            const updateIntervenantsSession = [...prevDatas.metasSession.intervenants];
            [updateIntervenantsSession[index], updateIntervenantsSession[index + 1]] = [updateIntervenantsSession[index + 1], updateIntervenantsSession[index]]; // Échanger les éléments
    
            return {
                ...prevDatas,
                metasSession: {
                    ...prevDatas.metasSession,
                    intervenants: updateIntervenantsSession,
                },
            };
        });
    };  

    async function addSession(sessionData, metasSessionData, moduleId) {
        const response = await fetch('/api/sessions/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionData: sessionData,
            metasSessionData: metasSessionData,
            moduleId: moduleId
          }),
        });
      
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erreur HTTP: ${response.status} - ${errorMessage}`);
        }
      
        return await response.json();
      }

      const saveModifs = async () => {

        const sessionData = {
          departement: datas.departement,
          region: datas.region,
          status: 'brouillon'
        };

        const metasSessionData = {
            dateHoraires: datas.metasSession.dateHoraires,
            lieuRencontre: datas.metasSession.lieuRencontre,
            nombrePlaces: datas.metasSession.nombrePlaces,
            infosTransport: datas.metasSession.infosTransport,
            dateLimiteInscription: datas.metasSession.dateLimiteInscription,
            infosComplementaires: datas.metasSession.infosComplementaires,
            intervenants: datas.metasSession.intervenants,
            programmeSession: datas.metasSession.programmeSession,
            urlsPDF: datas.metasSession.urlsPDF
        }

        if(sessionData.moduleId != '' 
        && sessionData.departement != '' 
        && sessionData.region != '' 
        && metasSessionData.dateHoraires != ''
        && metasSessionData.lieuRencontre != ''
        && metasSessionData.nombrePlaces != ''
        && metasSessionData.infosTransport != ''
        && metasSessionData.intervenants.length >= 0
        && metasSessionData.programmeSession.length >= 0
        ){
            const add = await addSession(sessionData, metasSessionData, id)
            setNotif({
                text: 'Session ajoutée !',
                icon: 'done'
            })
            setOpen({ type: 'sessions', id: id, nom: nom })
        }
        else{
            setNotif({
                text: 'Des champs obligatoires ne sont pas remplis !',
                icon: 'close'
            })            
        }
    }

    

    return (
        <>
            <div className="mBot30">
                <span onClick={() => setOpen({ id:id, type:'sessions', nom: nom })} className={styles.Back}>Retour aux sessions</span>
            </div>
            <div className="flex aligncenter space-between w100">
                <span className={`${styles.Title} w70`}>Ajouter une session pour le module :<br />{nom}</span>
                <button onClick={saveModifs} className="btn__normal btn__dark w23">Enregistrer la session</button>
                {/* <button className="btn__normal btn__dark w15">Publier</button> */}
            </div>
            <div>
                <span className={styles.Subtitle}>Informations principales</span>
                <div className="mTop20">
                    <div className="flex gap20">
                        <div className="select w50">
                            <select onChange={handleChange} name="region" value={datas?.region} className="input-select">
                                <option>Région</option>
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
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                        <div className="select w50">
                            <select onChange={handleChange} name="departement" value={datas?.departement} className="input-select">
                                <option>Département</option>
                                <option>01 - Ain</option>
                                <option>02 - Aisne</option>
                                <option>03 - Allier</option>
                                <option>04 - Alpes-de-Haute-Provence</option>
                                <option>05 - Hautes-Alpes</option>
                                <option>06 - Alpes-Maritimes</option>
                                <option>07 - Ardèche</option>
                                <option>08 - Ardennes</option>
                                <option>09 - Ariège</option>
                                <option>10 - Aube</option>
                                <option>11 - Aude</option>
                                <option>12 - Aveyron</option>
                                <option>13 - Bouches-du-Rhône</option>
                                <option>14 - Calvados</option>
                                <option>15 - Cantal</option>
                                <option>16 - Charente</option>
                                <option>17 - Charente-Maritime</option>
                                <option>18 - Cher</option>
                                <option>19 - Corrèze</option>
                                <option>2A - Corse-du-Sud</option>
                                <option>2B - Haute-Corse</option>
                                <option>21 - Côte-d'Or</option>
                                <option>22 - Côtes-d'Armor</option>
                                <option>23 - Creuse</option>
                                <option>24 - Dordogne</option>
                                <option>25 - Doubs</option>
                                <option>26 - Drôme</option>
                                <option>27 - Eure</option>
                                <option>28 - Eure-et-Loir</option>
                                <option>29 - Finistère</option>
                                <option>30 - Gard</option>
                                <option>31 - Haute-Garonne</option>
                                <option>32 - Gers</option>
                                <option>33 - Gironde</option>
                                <option>34 - Hérault</option>
                                <option>35 - Ille-et-Vilaine</option>
                                <option>36 - Indre</option>
                                <option>37 - Indre-et-Loire</option>
                                <option>38 - Isère</option>
                                <option>39 - Jura</option>
                                <option>40 - Landes</option>
                                <option>41 - Loir-et-Cher</option>
                                <option>42 - Loire</option>
                                <option>43 - Haute-Loire</option>
                                <option>44 - Loire-Atlantique</option>
                                <option>45 - Loiret</option>
                                <option>46 - Lot</option>
                                <option>47 - Lot-et-Garonne</option>
                                <option>48 - Lozère</option>
                                <option>49 - Maine-et-Loire</option>
                                <option>50 - Manche</option>
                                <option>51 - Marne</option>
                                <option>52 - Haute-Marne</option>
                                <option>53 - Mayenne</option>
                                <option>54 - Meurthe-et-Moselle</option>
                                <option>55 - Meuse</option>
                                <option>56 - Morbihan</option>
                                <option>57 - Moselle</option>
                                <option>58 - Nièvre</option>
                                <option>59 - Nord</option>
                                <option>60 - Oise</option>
                                <option>61 - Orne</option>
                                <option>62 - Pas-de-Calais</option>
                                <option>63 - Puy-de-Dôme</option>
                                <option>64 - Pyrénées-Atlantiques</option>
                                <option>65 - Hautes-Pyrénées</option>
                                <option>66 - Pyrénées-Orientales</option>
                                <option>67 - Bas-Rhin</option>
                                <option>68 - Haut-Rhin</option>
                                <option>69 - Rhône</option>
                                <option>70 - Haute-Saône</option>
                                <option>71 - Saône-et-Loire</option>
                                <option>72 - Sarthe</option>
                                <option>73 - Savoie</option>
                                <option>74 - Haute-Savoie</option>
                                <option>75 - Paris</option>
                                <option>76 - Seine-Maritime</option>
                                <option>77 - Seine-et-Marne</option>
                                <option>78 - Yvelines</option>
                                <option>79 - Deux-Sèvres</option>
                                <option>80 - Somme</option>
                                <option>81 - Tarn</option>
                                <option>82 - Tarn-et-Garonne</option>
                                <option>83 - Var</option>
                                <option>84 - Vaucluse</option>
                                <option>85 - Vendée</option>
                                <option>86 - Vienne</option>
                                <option>87 - Haute-Vienne</option>
                                <option>88 - Vosges</option>
                                <option>89 - Yonne</option>
                                <option>90 - Territoire de Belfort</option>
                                <option>91 - Essonne</option>
                                <option>92 - Hauts-de-Seine</option>
                                <option>93 - Seine-Saint-Denis</option>
                                <option>94 - Val-de-Marne</option>
                                <option>95 - Val-d'Oise</option>
                                <option>971 - Guadeloupe</option>
                                <option>972 - Martinique</option>
                                <option>973 - Guyane</option>
                                <option>974 - Réunion</option>
                                <option>976 - Mayotte</option>
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                    </div>
                </div>
                <span className={styles.Subtitle}>Détails pratiques de la rencontre</span>
                <div className="flex gap20 mTop20">
                    <div className="w50">
                        <div className="flex aligncenter gap5 w50">
                            <div className="w10">
                                <img src="/medias/icon-date.png" alt="icon" className="w80" />
                            </div>
                            <div className="w80">
                                <span className={styles.dLabel}>Date de la session :</span>
                            </div>
                        </div>
                        <input type="date" onChange={handleChange} name="metasSession.dateHoraires" value={datas?.metasSession.dateHoraires} className="input-text mTop10" placeholder="Date de la session" />
                    </div>
                    <div className="w50">
                        <div className="flex aligncenter gap5 w50">
                            <div className="w10">
                                <img src="/medias/icon-lieu.png" alt="icon" className="w80" />
                            </div>
                            <div className="w80">
                                <span className={styles.dLabel}>Lieu de la rencontre :</span>
                            </div>
                        </div>
                        <input type="text" onChange={handleChange} name="metasSession.lieuRencontre" value={datas?.metasSession.lieuRencontre} className="input-text mTop10" placeholder="Adresse complète" />
                    </div>
                </div>
                <div className="flex gap20 mTop20">
                    <div className="w50">
                        <div className="flex aligncenter gap5 w50">
                            <div className="w10">
                                <img src="/medias/icon-places.png" alt="icon" className="w80" />
                            </div>
                            <div className="w80">
                                <span className={styles.dLabel}>Nombre de places :</span>
                            </div>
                        </div>
                        <input type="text" onChange={handleChange} name="metasSession.nombrePlaces" value={datas?.metasSession.nombrePlaces} className="input-text mTop10" placeholder="10, 20, 30, ..." />
                    </div>
                    <div className="w50">
                        <div className="flex aligncenter gap5 w50">
                            <div className="w10">
                                <img src="/medias/icon-transport.png" alt="icon" className="w80" />
                            </div>
                            <div className="w80">
                                <span className={styles.dLabel}>Pour venir :</span>
                            </div>
                        </div>
                        <input type="text" onChange={handleChange} name="metasSession.infosTransport" value={datas?.metasSession.infosTransport} className="input-text mTop10" placeholder="Transport, etc..." />
                    </div>
                </div>
                <div className="w100 mTop20">
                        <div className="flex aligncenter gap5 w50">
                            <div className="w5">
                                <img src="/medias/icon-date.png" alt="icon" className="w80" />
                            </div>
                            <div className="w95">
                                <span className={styles.dLabel}>Date limite d'inscription :</span>
                            </div>
                        </div>
                        <input type="date" onChange={handleChange} name="metasSession.dateLimiteInscription" value={datas?.metasSession.dateLimiteInscription} className="input-text mTop10" placeholder="Date et horaires" />
                    </div>
                <div>
                <div className="w100 mTop20">
                    <div className="flex aligncenter gap5 w50">
                        <div className="w5">
                            <img src="/medias/icon-infos.png" alt="icon" className="w80" />
                        </div>
                        <div className="w95">
                            <span className={styles.dLabel}>Infos complémentaires :</span>
                        </div>
                    </div>
                    <textarea className="textarea mTop10" onChange={handleChange} name="metasSession.infosComplementaires" value={datas?.metasSession.infosComplementaires} placeholder="Informations additionnelles..."></textarea>
                </div>
                </div>

                <span className={styles.Subtitle}>Intervenants pour ce module</span>
                <div>
                {datas?.metasSession.intervenants.length > 0 && datas?.metasSession.intervenants.map((intervenant, index) => {
                        return (
                            <>
                                <div key={index} className="flex aligncenter gap20">
                                    <div className="w90">
                                        <div className="flex gap20 mTop20">
                                            <input type="text" onChange={handleChange} data-index={index} name="metasSession.intervenants.nom" value={intervenant.nom} className="input-text w50" placeholder="Nom / Prénom" />
                                            <input type="text" onChange={handleChange} data-index={index} name="metasSession.intervenants.fonction" value={intervenant.fonction} className="input-text w50" placeholder="Fonction" />
                                            <input type="text" onChange={handleChange} data-index={index} name="metasSession.intervenants.structure" value={intervenant.structure} className="input-text w50" placeholder="Structure" />
                                        </div>         
                                        <div className="flex mTop20 w100">
                                            <input type="mail" onChange={handleChange} data-index={index} name="metasSession.intervenants.email" value={intervenant.email} className="input-text" placeholder="Adresse e-mail de l'intervenant" />
                                        </div>  
                                    </div>
                                    <div className="w10 flex aligncenter flex-end gap5">
                                        <span
                                            className={`material-icons ${styles.DeleteT}`}
                                            onClick={() => requestDeleteIntervenant(index)}
                                        >
                                            delete
                                        </span>
                                        <span onClick={() => moveSectionUpI(index)} className={`material-icons ${styles.NavT}`}>expand_less</span>
                                        <span onClick={() => moveSectionDownI(index)} className={`material-icons ${styles.NavT}`}>expand_more</span>
                                    </div>
                                </div>                            
                            </>
                        )
                    })}
                    <button onClick={addIntervenant} className={`mTop20 ${styles.AddTranche}`}>
                        <span className="material-icons">add</span>
                        Ajouter un intervenant
                    </button>
                </div>

                <span className={styles.Subtitle}>Programme de la session</span>
                <div>
                    {datas?.metasSession.programmeSession.length > 0 && datas?.metasSession.programmeSession.map((programme, index) => {
                        return (
                            <>
                                <div key={index} className="flex aligncenter gap20">
                                    <div className="w90">
                                        <div className="flex gap20 mTop20">
                                            <input type="text" onChange={handleChange} data-index={index} name="metasSession.programmeSession.horaires" value={programme.horaires} className="input-text w50" placeholder="Horaires" />
                                            <input type="text" onChange={handleChange} data-index={index} name="metasSession.programmeSession.titre" value={programme.titre} className="input-text w50" placeholder="Titre" />
                                        </div>         
                                        <div className="flex mTop20">
                                            <textarea className="textarea" onChange={handleChange} data-index={index} name="metasSession.programmeSession.description" value={programme.description} placeholder="Description"></textarea>
                                        </div>  
                                    </div>
                                    <div className="w10 flex aligncenter flex-end gap5">
                                        <span
                                            className={`material-icons ${styles.DeleteT}`}
                                            onClick={() => requestDeleteTranche(index)}
                                        >
                                            delete
                                        </span>
                                        <span onClick={() => moveSectionUp(index)} className={`material-icons ${styles.NavT}`}>expand_less</span>
                                        <span onClick={() => moveSectionDown(index)} className={`material-icons ${styles.NavT}`}>expand_more</span>
                                    </div>
                                </div>                            
                            </>
                        )
                    })}
                    <button onClick={addTranche} className={`mTop20 ${styles.AddTranche}`}>
                        <span className="material-icons">add</span>
                        Ajouter une tranche horaire
                    </button>
                </div>

                <span className={styles.Subtitle}>Documents spécifiques à cette rencontre</span>
                <div>
                    <div className="flex wrap gap20 mTop20">
                        <div className="w48 text-left">
                            <input type="file" id="doc" className="input-file" />
                            <label for="doc">
                                + Ajouter un document
                            </label>
                        </div>
                    </div>
                </div>
                <div className="mTop25">
                    <button onClick={saveModifs} className="btn__normal btn__dark">Enregistrer la session</button>
                </div>
            </div>
            {alert != null && (
                <Alert datas={alert} setAlert={setAlert} />
            )}  
            {notif != null && (
                <Notif datas={notif} setNotif={setNotif} />
            )}
        </>
    )
}