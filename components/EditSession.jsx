import { useState, useEffect } from 'react'
import Alert from '@/components/Alert'
import { Notif } from '@/components/Notif'
import DynamicQuill from '@/components/DynamicQuill';
import styles from '@/styles/Admin.module.css'
import 'react-quill/dist/quill.snow.css';

export default function EditSession({setOpen, id, nom, moduleId, page}){

    const [alert, setAlert] = useState(null)
    const [notif, setNotif] = useState(null)
    const [indexToDelete, setIndexToDelete] = useState(null);
    const [indexToDeleteI, setIndexToDeleteI] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [importing, setImporting] = useState('Importer le programme du module')
    const [datas, setDatas] = useState({
        moduleId: id,
        departement: '',
        region: '',
        metasSession: {
          dateHoraires: '',
          lieuRencontre: '',
          mail_referent: '',
          nombrePlaces: '',
          nombreJours: '',
          optionjour: false,
          infosTransport: '',
          dateLimiteInscription: '',
          infosComplementaires: '',
          explications: '',
          intervenants: [],
          programmeSession: [],
          urlsPDF: [],
          selectedFiles: []
        }
    });

    const addTranche = () => {
        setDatas(prevDatas => {

            const updatedDatas = JSON.parse(JSON.stringify(prevDatas));

            if (!updatedDatas.metasSession.programmeSession) {
                updatedDatas.metasSession.programmeSession = [];
            }
    
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
            const updatedDatas = JSON.parse(JSON.stringify(prevDatas));

            if (!updatedDatas.metasSession.intervenants) {
                updatedDatas.metasSession.intervenants = [];
            }
    
            updatedDatas.metasSession.intervenants.push({
                nom: '',
                fonction: '',
                structure: '',
                email: '',
                linkedin: ''
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
            action: () => deleteTranche(index)
        });
    };

    const requestDeleteIntervenant = (index) => {
        setIndexToDeleteI(index);
        setAlert({
            icon: 'warning',
            text: 'Êtes-vous sûr de vouloir supprimer cet intervenant ?',
            action: () => deleteIntervenant(index)
        });
    };

    const getDatas = async () => {
        const fetcher = await fetch(`/api/sessions/${id}`)
        const json = await fetcher.json()
        setEditContent(json[0].metasSession.explications)
        setDatas(prevDatas => ({
            ...prevDatas,
            ...json[0],
            metasSession: {
                ...prevDatas.metasSession,
                ...json[0].metasSession,
                selectedFiles: []
            }
        }))
    }

    const handleChange = (event) => {
        const { name, value, dataset } = event.target;
        const index = dataset.index;
    
        setDatas(prevDatas => {
            if (name.startsWith("metasSession.programmeSession") && index !== undefined) {
                const fieldName = name.split(".")[2];
    
                const updatedDatas = JSON.parse(JSON.stringify(prevDatas));
    
                if (!updatedDatas.metasSession.programmeSession) {
                    updatedDatas.metasSession.programmeSession = [];
                }

                if (updatedDatas.metasSession.programmeSession[index]) {
                    updatedDatas.metasSession.programmeSession[index][fieldName] = value;
                }
    
                return updatedDatas;
            }
            else if (name.startsWith("metasSession.intervenants") && index !== undefined) {
                const fieldName = name.split(".")[2];

                const updatedDatas = JSON.parse(JSON.stringify(prevDatas));
    
                if (!updatedDatas.metasSession.intervenants) {
                    updatedDatas.metasSession.intervenants = [];
                }
    
                if (updatedDatas.metasSession.intervenants[index]) {
                    updatedDatas.metasSession.intervenants[index][fieldName] = value;
                }
    
                return updatedDatas;
            }
            else if (name.includes('.')) {
                const [parent, key] = name.split('.');
                return {
                    ...prevDatas,
                    [parent]: {
                        ...prevDatas[parent],
                        [key]: value
                    }
                };
            } else {
                return {
                    ...prevDatas,
                    [name]: value
                };
            }
        });
    };

    const moveSectionUp = (index) => {
        if (index === 0) return;
    
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
        if (index === 0) return;
    
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
        if (index === datas.metasSession.programmeSession.length - 1) return;
    
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
        if (index === datas.metasSession.intervenants.length - 1) return;
    
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

    async function updateSession(sessionData, metasSessionData, sessionId) {

        const response = await fetch('/api/sessions/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_ADMIN_KEY
          },
          body: JSON.stringify({
            sessionData: sessionData,
            metasSessionData: metasSessionData,
            sessionId: sessionId
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
            status: datas.status
        };

        const uploadedUrlsPDF = await uploadFiles();
    
        const metasSessionData = {
            dateHoraires: datas.metasSession.dateHoraires,
            lieuRencontre: datas.metasSession.lieuRencontre,
            nombrePlaces: datas.metasSession.nombrePlaces,
            nombreJours: datas.metasSession.nombreJours,
            optionjour: datas.metasSession.optionjour,
            mail_referent: datas.metasSession.mail_referent,
            infosTransport: datas.metasSession.infosTransport,
            explications: editContent,
            dateLimiteInscription: datas.metasSession.dateLimiteInscription,
            infosComplementaires: datas.metasSession.infosComplementaires,
            intervenants: datas.metasSession.intervenants,
            programmeSession: datas.metasSession.programmeSession,
            urlsPDF: [...datas.metasSession.urlsPDF, ...uploadedUrlsPDF],
        };

        console.log(metasSessionData)

        if (sessionData.moduleId != '' 
        && sessionData.departement != '' 
        && sessionData.region != '' 
        // && metasSessionData.dateHoraires != ''
        // && metasSessionData.lieuRencontre != ''
        // && metasSessionData.nombrePlaces != ''
        // && metasSessionData.infosTransport != ''
        // && metasSessionData.intervenants.length >= 0
        // && metasSessionData.programmeSession.length >= 0
        ) {
            try {
                const update = await updateSession(sessionData, metasSessionData, id);
                setNotif({
                    text: 'Session mise à jour !',
                    icon: 'done'
                });
            } catch (error) {
                console.error(error);
                setNotif({
                    text: 'Une erreur est survenue lors de la mise à jour de la session.',
                    icon: 'close'
                });
            }
        } else {
            setNotif({
                text: 'Des champs obligatoires ne sont pas remplis !',
                icon: 'close'
            });
        }
    };
    

    const importProgramme = async () => {
        setImporting('Import en cours...')
        const fetcher = await fetch(`/api/modules/${moduleId}`)
        const json = await fetcher.json()
        const res = json[0]
        setDatas(prev => {
            return {
                ...prev,
                metasSession: {
                    ...prev.metasSession,
                    programmeSession: res.metasModule.programmeModule
                }
            }
        })
        setImporting('Importer le programme du module')
    }

    useEffect(() => {
        getDatas()
    }, [])

    function handleFiles(event) {
        const newFiles = Array.from(event.target.files).map(file => ({
            file,
            nom: file.name,
        }));
      
        setDatas(prev => ({
            ...prev,
            metasSession: {
                ...prev.metasSession,
                selectedFiles: [...prev.metasSession.selectedFiles, ...newFiles]
            }
        }));
    }
    
    console.log("datas : ", datas)
    

    function deleteFile(index, type) {
        setDatas(prev => {
            const newDatas = { ...prev, metasSession: { ...prev.metasSession } };
    
            if (type === 'uploaded') {
                newDatas.metasSession.urlsPDF = prev.metasSession.urlsPDF.filter((_, i) => i !== index);
            } else if (type === 'selected') {
                newDatas.metasSession.selectedFiles = prev.metasSession.selectedFiles.filter((_, i) => i !== index);
            }
    
            return newDatas;
        });
    }
    
      

    async function uploadFiles() {
        const files = datas.metasSession.selectedFiles; // Utilisez les fichiers de l'état
        const formData = new FormData();
      
        files.forEach(obj => {
            formData.append("files", obj.file); // Utilisez obj.file au lieu de file directement
        });
      
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
      
        if (response.ok) {
            const { urlsPDF } = await response.json(); // urlsPDF devrait être un tableau d'objets { nom, url }
            // Mettez à jour l'état avec les objets nom + url reçus et retournez-les
            setDatas(prev => ({
                ...prev,
                metasSession: {
                    ...prev.metasSession,
                    urlsPDF: [...prev.metasSession.urlsPDF, ...urlsPDF]
                }
            }));
            return urlsPDF; // Retournez les URLs pour utilisation directe
        } else {
            console.error('Erreur lors de l\'upload des fichiers');
            return []; // Retournez un tableau vide en cas d'erreur
        }
    }

    const handleChangeOption = (event) => {
        setDatas(prev => {
            return {
                ...prev,
                metasSession: {
                    ...prev.metasSession,
                    optionjour: event.target.checked
                }
            };
        });
    };

    useEffect(() => {
        setDatas(prev => {
            return {
                ...prev,
                metasSession: {
                    ...prev.metasSession,
                    explications: editContent
                }
            };
        });
    }, [editContent]);

    console.log("optionjour => ", datas.metasSession.optionjour)


    return (
        <>
            <div className="mBot30">
                <span onClick={() => {page != undefined ? setOpen(null) : setOpen({ id:moduleId, type:'sessions', nom: nom })}} className={styles.Back}>Retour aux sessions</span>
            </div>
            <div className="flex aligncenter space-between w100">
                <span className={`${styles.Title} w70`}>Modifier la session pour le module :<br /> {nom}</span>
                <button onClick={saveModifs} className="btn__normal btn__dark w23">Enregistrer la session</button>
            </div>
            <div>
                <span className={styles.Subtitle}>Informations principales</span>
                <div className="mTop20">
                    <div className="flex gap20">
                        <div className="select w50">
                            <select onChange={handleChange} name="region" value={datas?.region} className="input-select">
                                <option value=''>Région</option>
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
                                <option>Polynésie Française</option>
                                <option>Saint-Pierre et Miquelon</option>
                                <option>Océan Indien</option>
                                <option>Nouvelle Calédonie</option>
                            </select>
                            <span className="material-icons">expand_more</span>
                        </div>
                        <div className="select w50">
                        <select onChange={handleChange} name="departement" value={datas?.departement} className="input-select">
                                <option value=''>Département</option>
                                {datas?.region == 'Auvergne-Rhône-Alpes' && (
                                    <>
                                        <option>01 - Ain</option>
                                        <option>03 - Allier</option>
                                        <option>07 - Ardèche</option>
                                        <option>15 - Cantal</option>
                                        <option>26 - Drôme</option>
                                        <option>38 - Isère</option>
                                        <option>42 - Loire</option>
                                        <option>43 - Haute-Loire</option>
                                        <option>63 - Puy-de-Dôme</option>
                                        <option>69 - Rhône</option>
                                        <option>73 - Savoie</option>
                                        <option>74 - Haute-Savoie</option>
                                    </>
                                )}
                                {datas?.region == 'Bourgogne-Franche-Comté' && (
                                    <>
                                        <option>21 - Côte-d'Or</option>
                                        <option>25 - Doubs</option>
                                        <option>39 - Jura</option>
                                        <option>58 - Nièvre</option>
                                        <option>70 - Haute-Saône</option>
                                        <option>71 - Saône-et-Loire</option>
                                        <option>89 - Yonne</option>
                                        <option>90 - Territoire de Belfort</option>
                                    </>
                                )}
                                {datas?.region == 'Bretagne' && (
                                    <>
                                        <option>22 - Côtes-d'Armor</option>
                                        <option>29 - Finistère</option>
                                        <option>35 - Ille-et-Vilaine</option>
                                        <option>56 - Morbihan</option>
                                    </>
                                )}
                                {datas?.region == 'Centre-Val de Loire' && (
                                    <>
                                        <option>18 - Cher</option>
                                        <option>28 - Eure-et-Loir</option>
                                        <option>36 - Indre</option>
                                        <option>37 - Indre-et-Loire</option>
                                        <option>41 - Loir-et-Cher</option>
                                        <option>45 - Loiret</option>
                                    </>
                                )}
                                {datas?.region == 'Corse' && (
                                    <>
                                        <option>2A - Corse-du-Sud</option>
                                        <option>2B - Haute-Corse</option>
                                    </>
                                )}
                                {datas?.region == 'Grand-Est' && (
                                    <>
                                        <option>08 - Ardennes</option>
                                        <option>10 - Aube</option>
                                        <option>51 - Marne</option>
                                        <option>52 - Haute-Marne</option>
                                        <option>54 - Meurthe-et-Moselle</option>
                                        <option>55 - Meuse</option>
                                        <option>57 - Moselle</option>
                                        <option>67 - Bas-Rhin</option>
                                        <option>68 - Haut-Rhin</option>
                                        <option>88 - Vosges</option>
                                    </>
                                )}
                                {datas?.region == 'Hauts-de-France' && (
                                    <>
                                        <option>02 - Aisne</option>
                                        <option>59 - Nord</option>
                                        <option>60 - Oise</option>
                                        <option>62 - Pas-de-Calais</option>
                                        <option>80 - Somme</option>
                                    </>
                                )}
                                {datas?.region == 'Île-de-France' && (
                                    <>
                                        <option>75 - Paris</option>
                                        <option>77 - Seine-et-Marne</option>
                                        <option>78 - Yvelines</option>
                                        <option>91 - Essonne</option>
                                        <option>92 - Hauts-de-Seine</option>
                                        <option>93 - Seine-Saint-Denis</option>
                                        <option>94 - Val-de-Marne</option>
                                        <option>95 - Val-d'Oise</option>
                                    </>
                                )}
                                {datas?.region == 'Normandie' && (
                                    <>
                                        <option>14 - Calvados</option>
                                        <option>27 - Eure</option>
                                        <option>50 - Manche</option>
                                        <option>61 - Orne</option>
                                        <option>76 - Seine-Maritime</option>
                                    </>
                                )}
                                {datas?.region == 'Nouvelle-Aquitaine' && (
                                    <>
                                        <option>16 - Charente</option>
                                        <option>17 - Charente-Maritime</option>
                                        <option>19 - Corrèze</option>
                                        <option>23 - Creuse</option>
                                        <option>24 - Dordogne</option>
                                        <option>33 - Gironde</option>
                                        <option>40 - Landes</option>
                                        <option>47 - Lot-et-Garonne</option>
                                        <option>64 - Pyrénées-Atlantiques</option>
                                        <option>79 - Deux-Sèvres</option>
                                        <option>86 - Vienne</option>
                                        <option>87 - Haute-Vienne</option>
                                    </>
                                )}
                                {datas?.region == 'Occitanie' && (
                                    <>
                                        <option>09 - Ariège</option>
                                        <option>11 - Aude</option>
                                        <option>12 - Aveyron</option>
                                        <option>30 - Gard</option>
                                        <option>31 - Haute-Garonne</option>
                                        <option>32 - Gers</option>
                                        <option>34 - Hérault</option>
                                        <option>46 - Lot</option>
                                        <option>48 - Lozère</option>
                                        <option>65 - Hautes-Pyrénées</option>
                                        <option>66 - Pyrénées-Orientales</option>
                                        <option>81 - Tarn</option>
                                        <option>82 - Tarn-et-Garonne</option>
                                    </>
                                )}
                                {datas?.region == 'Pays de la Loire' && (
                                    <>
                                        <option>44 - Loire-Atlantique</option>
                                        <option>49 - Maine-et-Loire</option>
                                        <option>53 - Mayenne</option>
                                        <option>72 - Sarthe</option>
                                        <option>85 - Vendée</option>
                                    </>
                                )}
                                {datas?.region == "Provence-Alpes-Côte d'Azur" && (
                                    <>
                                        <option>04 - Alpes-de-Haute-Provence</option>
                                        <option>05 - Hautes-Alpes</option>
                                        <option>06 - Alpes-Maritimes</option>
                                        <option>13 - Bouches-du-Rhône</option>
                                        <option>83 - Var</option>
                                        <option>84 - Vaucluse</option>
                                    </>
                                )}
                                {datas?.region == "Guadeloupe" && (
                                    <>
                                        <option>971 - Guadeloupe</option>
                                    </>
                                )}
                                {datas?.region == "Martinique" && (
                                    <>
                                        <option>972 - Martinique</option>
                                    </>
                                )}
                                {datas?.region == "Guyane" && (
                                    <>
                                        <option>973 - Guyane</option>
                                    </>
                                )}
                                {datas?.region == "La Reunion" && (
                                    <>
                                        <option>974 - La Reunion</option>
                                    </>
                                )}
                                {datas?.region == "Mayotte" && (
                                    <>
                                        <option>976 - Mayotte</option>
                                    </>
                                )}
                                {datas?.region == "Polynésie Française" && (
                                    <>
                                        <option>Polynésie Française</option>
                                    </>
                                )}
                                {datas?.region == "Saint-Pierre et Miquelon" && (
                                    <>
                                        <option>Saint-Pierre et Miquelon</option>
                                    </>
                                )}
                                {datas?.region == "Océan Indien" && (
                                    <>
                                        <option>Océan Indien</option>
                                    </>
                                )}
                                {datas?.region == "Nouvelle Calédonie" && (
                                    <>
                                        <option>Nouvelle Calédonie</option>
                                    </>
                                )}
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
                <div className="w100 mTop20">
                    <div className="flex aligncenter gap5 w50">
                        <div className="w80">
                            <span className={styles.dLabel}>E-mail du référent ADEME :</span>
                        </div>
                    </div>
                    <input type="text" onChange={handleChange} name="metasSession.mail_referent" value={datas?.metasSession.mail_referent} className="input-text mTop10" placeholder="E-mail du référent ADEME" />
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
                <div className="flex gap20 toColumn">
                    <div className="w50">
                        <div className="w100 mTop20">
                            <div className="flex aligncenter gap5 w60">
                                <div className="w8">
                                    <img src="/medias/icon-date.png" alt="icon" className="w80" />
                                </div>
                                <div className="w80">
                                    <span className={styles.dLabel}>Date limite d'inscription :</span>
                                </div>
                            </div>
                            <input type="date" onChange={handleChange} name="metasSession.dateLimiteInscription" value={datas?.metasSession.dateLimiteInscription} className="input-text mTop10" placeholder="Date et horaires" />
                        </div>
                    </div>
                    <div className="w50">
                        <div className="w100 mTop20">
                            <div className="flex aligncenter gap5 w70">
                                <div className="w7">
                                    <img src="/medias/icon-date.png" alt="icon" className="w80" />
                                </div>
                                <div className="w80">
                                    <span className={styles.dLabel}>Nombre de jours de la session :</span>
                                </div>
                            </div>
                            <input type="text" onChange={handleChange} name="metasSession.nombreJours" value={datas?.metasSession.nombreJours} className="input-text mTop10" placeholder="1, 2" />
                        </div>
                    </div>
                </div>
                <div>
                <div className="mTop20">
                    <input type="checkbox" checked={datas?.metasSession.optionjour} onChange={handleChangeOption} name="metasSession.optionjour" />&nbsp;&nbsp;
                    <span>Possibilité de s'inscrire à un seul jour sur les deux</span>                   
                </div>
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
                                        <div className="flex mTop20 w100">
                                            <input type="text" onChange={handleChange} data-index={index} name="metasSession.intervenants.linkedin" value={intervenant.linkedin} className="input-text" placeholder="Linkedin" />
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

                <div className="flex aligncenter space-between mTop10">
                    <span className={styles.Subtitle}>Programme de la session</span>
                    <button onClick={importProgramme} className={styles.Import}><span className="material-icons">download</span>{importing}</button>
                </div>
                
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

                <span className={styles.Subtitle}>Ressources à lire avant la rencontre</span>
                <div>
                    <div className={`mTop20 ${styles.Quill}`}>
                        <DynamicQuill theme="snow" value={editContent} onChange={setEditContent} />
                    </div>
                    {/* <textarea onChange={handleChange} name="metasSession.explications" value={datas?.metasSession.explications} className="textarea mTop20" placeholder="Explications facultatives..."></textarea> */}
                    <div className="flex wrap gap20 mTop20">
                        <div className="w48 text-left">
                            <div>
                                <input type="file" id="doc" multiple onChange={handleFiles} style={{ display: 'none' }} />
                                <button className={styles.Fichier} onClick={() => document.getElementById('doc').click()}>+ Ajouter des documents</button>
                                <div>
                                    {/* Affichage des fichiers déjà uploadés */}
                                    {datas.metasSession.urlsPDF.map((file, index) => (
                                        <div className={styles.Filer} key={`uploaded-${index}`}>
                                            {file.nom}
                                            <button onClick={() => deleteFile(index, 'uploaded')}><span className="material-icons">delete</span></button>
                                        </div>
                                    ))}

                                    {/* Affichage des fichiers sélectionnés mais pas encore uploadés */}
                                    {datas.metasSession.selectedFiles.map((fileObj, index) => {
                                        // Assurez-vous que cette ligne correspond à la structure de vos objets dans selectedFiles
                                        const fileName = fileObj.file ? fileObj.file.name : fileObj.name; // Ajustez selon votre structure

                                        // Vérifiez si le fichier sélectionné a déjà été uploadé
                                        const isUploaded = datas.metasSession.urlsPDF.some(uploadedFile => uploadedFile.nom === fileName);

                                        // N'affichez que les fichiers qui n'ont pas encore été uploadés
                                        if (!isUploaded) {
                                            return (
                                                <div className={styles.Filer} key={`selected-${index}`}>
                                                    {fileName}
                                                    <button onClick={() => deleteFile(index, 'selected')}><span className="material-icons">delete</span></button>
                                                </div>
                                            );
                                        } else {
                                            return null; // Le fichier est déjà uploadé, donc on ne l'affiche pas ici
                                        }
                                    })}
                                </div>
                            </div>
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