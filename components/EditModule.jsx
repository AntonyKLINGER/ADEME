import { useState, useEffect } from 'react'
import Alert from '@/components/Alert'
import { Notif } from '@/components/Notif'
import DynamicQuill from '@/components/DynamicQuill';
import styles from '@/styles/Admin.module.css'
import 'react-quill/dist/quill.snow.css';

export default function EditModule({setOpen, id}){

    const [alert, setAlert] = useState(null)
    const [notif, setNotif] = useState(null)
    const [indexToDelete, setIndexToDelete] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editObjectifs, setEditObjectifs] = useState('');
    const [datas, setDatas] = useState({
        nom: '',
        description: '',
        code: '',
        metasModule: {
          resumeProgramme: '',
          objectifs: '',
          duree: '',
          publicCible: '',
          tarif: '',
          programmeModule: []
        }
    });

    const addTranche = () => {
        setDatas(prevDatas => {
            // Copie profonde pour éviter les mutations directes
            const updatedDatas = JSON.parse(JSON.stringify(prevDatas));
    
            // Vérifie si le tableau programmeModule existe, sinon crée un tableau vide
            if (!updatedDatas.metasModule.programmeModule) {
                updatedDatas.metasModule.programmeModule = [];
            }
    
            // Ajoute un nouvel objet tranche avec des valeurs vides ou par défaut
            updatedDatas.metasModule.programmeModule.push({
                horaires: '',
                titre: '',
                description: ''
            });
    
            return updatedDatas;
        });
    };

    const deleteTranche = (indexToDelete) => {
        setDatas(prevDatas => {
            const updatedProgrammeModule = prevDatas.metasModule.programmeModule.filter((_, index) => index !== indexToDelete);
            return {
                ...prevDatas,
                metasModule: {
                    ...prevDatas.metasModule,
                    programmeModule: updatedProgrammeModule
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

    const getDatas = async () => {
        const fetcher = await fetch(`/api/modules/${id}`)
        const json = await fetcher.json()
        setDatas(json[0])
        setEditContent(json[0].metasModule.resumeProgramme)
        setEditObjectifs(json[0].metasModule.objectifs)
    }

    const handleChange = (event) => {
        const { name, value, dataset } = event.target;
        const index = dataset.index; // Récupérer l'index pour les éléments du tableau, si défini
    
        setDatas(prevDatas => {
            // Gestion des champs dans le tableau programmeModule
            if (name.startsWith("metasModule.programmeModule") && index !== undefined) {
                const fieldName = name.split(".")[2]; // Obtient 'horaires' de "metasModule.programmeModule.horaires"
    
                // Copie profonde pour éviter la mutation directe (optionnelle mais recommandée)
                const updatedDatas = JSON.parse(JSON.stringify(prevDatas));
    
                // Assurez-vous que programmeModule est initialisé
                if (!updatedDatas.metasModule.programmeModule) {
                    updatedDatas.metasModule.programmeModule = [];
                }
    
                // Mettre à jour l'élément spécifique dans le tableau
                if (updatedDatas.metasModule.programmeModule[index]) {
                    updatedDatas.metasModule.programmeModule[index][fieldName] = value;
                }
    
                return updatedDatas;
            } else if (name.includes('.')) {
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
            const updatedProgrammeModule = [...prevDatas.metasModule.programmeModule];
            [updatedProgrammeModule[index], updatedProgrammeModule[index - 1]] = [updatedProgrammeModule[index - 1], updatedProgrammeModule[index]]; // Échanger les éléments
    
            return {
                ...prevDatas,
                metasModule: {
                    ...prevDatas.metasModule,
                    programmeModule: updatedProgrammeModule,
                },
            };
        });
    };
    
    const moveSectionDown = (index) => {
        if (index === datas.metasModule.programmeModule.length - 1) return; // Ne peut pas déplacer en dessous du dernier élément
    
        setDatas((prevDatas) => {
            const updatedProgrammeModule = [...prevDatas.metasModule.programmeModule];
            [updatedProgrammeModule[index], updatedProgrammeModule[index + 1]] = [updatedProgrammeModule[index + 1], updatedProgrammeModule[index]]; // Échanger les éléments
    
            return {
                ...prevDatas,
                metasModule: {
                    ...prevDatas.metasModule,
                    programmeModule: updatedProgrammeModule,
                },
            };
        });
    };    
    
    async function updateModule(moduleId, moduleData, metasModuleData) {
        const response = await fetch('/api/modules/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_ADMIN_KEY
          },
          body: JSON.stringify({
            id: moduleId,
            moduleData: moduleData,
            metasModuleData: metasModuleData,
          }),
        });
      
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erreur HTTP: ${response.status} - ${errorMessage}`);
        }
      
        return await response.json();
      }
      

    const saveModifs = async () => {

        const moduleId = datas.id

        const formData = new FormData();

        // Sérialisez `moduleData` et `metasModuleData` en JSON et ajoutez-les au formData
        formData.append('moduleData', JSON.stringify({
          nom: datas.nom,
          description: datas.description,
          pilier: datas.pilier,
          pilier2: datas.pilier2 ? datas.pilier2 : undefined,
          thematique: datas.thematique,
          code: datas.code
        }));
    
        formData.append('metasModuleData', JSON.stringify({
          duree: datas.metasModule.duree,
          objectifs: datas.metasModule.objectifs,
          publicCible: datas.metasModule.publicCible,
          resumeProgramme: datas.metasModule.resumeProgramme,
          tarif: datas.metasModule.tarif,
          programmeModule: datas.metasModule.programmeModule
        }));

        formData.append('moduleId', moduleId)
    
        // Ajoutez l'image au formData si elle a été sélectionnée
        if (selectedImage) {
            formData.append('visuel', selectedImage);
            console.log("visuel ajouté ! => ", selectedImage)
        }
    
        // Assurez-vous que l'API peut gérer le formData pour l'upload d'image et les données sérialisées
        try {
            const response = await fetch('/api/modules/update', {
              method: 'POST',
              headers: {
                'x-api-key': process.env.NEXT_PUBLIC_ADMIN_KEY
              },
              body: formData,
            });
          
            if (!response.ok) {
              const errorMessage = await response.text();
              throw new Error(`Erreur HTTP: ${response.status} - ${errorMessage}`);
            }
          
            const updateResponse = await response.json();
            setNotif({
                text: 'Modifications enregistrées',
                icon: 'done'
            });
        } catch (error) {
            setNotif({
                text: `Erreur lors de l'enregistrement : ${error.message}`,
                icon: 'close'
            });
        }

    }

    useEffect(() => {
        getDatas()
    }, [])

    useEffect(() => {
        setDatas(prev => {
            return {
                ...prev,
                metasModule: {
                    ...prev.metasModule,
                    resumeProgramme: editContent
                }
            };
        });
    }, [editContent]);

    useEffect(() => {
        setDatas(prev => {
            return {
                ...prev,
                metasModule: {
                    ...prev.metasModule,
                    objectifs: editObjectifs
                }
            };
        });
    }, [editObjectifs]);

    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = async (event) => {
        if (event.target.files && event.target.files[0]) {
          const file = event.target.files[0];
          setSelectedImage(file);

          const formData = new FormData();
          formData.append('file', file);
    
          try {
            const response = await fetch('/api/uploadVisuel', {
              method: 'POST',
              body: formData,
            });
    
            const data = await response.json();
    
            if (response.ok) {
              const publicUrl = data.urlsPDF[0].url;
              setPreviewUrl(publicUrl);
            } else {
              console.error('Erreur lors de l\'upload:', data.error);
            }
          } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
          }
        }
    };

    const removeMedia = () => {
        console.log("remove")
        setSelectedImage(null)
        setPreviewUrl(null)
        setDatas(prev => {
            return {...prev, visuel: null}
        })
    }
    


    return (
        <>
            <div className="mBot30">
                <span onClick={() => setOpen()} className={styles.Back}>Retour aux modules</span>
            </div>
            <div className="flex aligncenter space-between w100 gap40">
                <span className={`${styles.Title} w70`}>Modifier le module</span>
                <button onClick={saveModifs} className="btn__normal btn__dark">Enregistrer le module</button>
            </div>
            <span className={styles.Subtitle}>Ajouter un visuel (optionnel)</span>
            <div className="flex gap20 mTop20">
                <input className={styles.visuel} type="file" id="visu" name="visuel" accept="image/*" onChange={handleImageChange} />
                {
                    (datas.visuel || previewUrl ) ? (
                        <label className={styles.visubox} htmlFor="visu">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Aperçu" />
                            ) : datas.visuel ? (
                                <img src={datas.visuel} alt="Visuel actuel du module" />
                            ) : null}
                            <span className="material-icons">photo_library</span>
                            <button onClick={removeMedia} className={styles.remover}><span className="material-icons">close</span></button>
                        </label>
                    ) : (
                        <label className={styles.visubox} htmlFor="visu">
                            <span className="material-icons">add_photo_alternate</span>
                        </label>                        
                    )
                }
            </div>
            <div>
                <span className={styles.Subtitle}>Informations principales</span>
                <div className="mTop20">
                    <div className="flex gap20">
                        <input type="text" className="input-text w70" onChange={handleChange} name="nom" value={datas?.nom} placeholder="Titre du module" />
                        <input type="text" className="input-text w30" onChange={handleChange} name="code" value={datas?.code} placeholder="Code du module" />
                    </div>
                    <div className="flex mTop20">
                        <textarea className="textarea" onChange={handleChange} name="description" value={datas?.description} placeholder="Texte d'introduction"></textarea>
                    </div>
                </div>
                <span className={styles.Subtitle}>Résumé et contenu du module</span>
                <div className={`mTop20 ${styles.Quill}`}>
                    <DynamicQuill theme="snow" value={editContent} onChange={setEditContent} />
                </div>
                <span className={styles.Subtitle}>Informations pratiques</span>
                <div className={`mTop20 ${styles.Quill}`}>
                    <span>Objectifs du module</span><br /><br />
                    <DynamicQuill theme="snow" value={editObjectifs} onChange={setEditObjectifs} />
                </div>
                <div className="flex gap20 mTop20">
                    <input type="text" onChange={handleChange} name="metasModule.duree" value={datas?.metasModule.duree} className="input-text w33" placeholder="Durée du module" />
                    <input type="text" onChange={handleChange} name="metasModule.publicCible" value={datas?.metasModule.publicCible} className="input-text w33" placeholder="Public cible" />
                    <input type="text" onChange={handleChange} name="metasModule.tarif" value={datas?.metasModule.tarif} className="input-text w33" placeholder="Tarif du module" />
                </div>
                <span className={styles.Subtitle}>Programme du module</span>
                <div>
                    {datas?.metasModule.programmeModule.length > 0 && datas?.metasModule.programmeModule.map((programme, index) => {
                        return (
                            <>
                                <div key={index} className="flex aligncenter gap20">
                                    <div className="w90">
                                        <div className="flex gap20 mTop20">
                                            <input type="text" onChange={handleChange} data-index={index} name="metasModule.programmeModule.horaires" value={programme.horaires} className="input-text w50" placeholder="Horaires" />
                                            <input type="text" onChange={handleChange} data-index={index} name="metasModule.programmeModule.titre" value={programme.titre} className="input-text w50" placeholder="Titre" />
                                        </div>         
                                        <div className="flex mTop20">
                                            <textarea className="textarea" onChange={handleChange} data-index={index} name="metasModule.programmeModule.description" value={programme.description} placeholder="Description"></textarea>
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
                <span className={styles.Subtitle}>Attributs du module</span>
                <div className="flex gap20 mTop20">
                    <div className="select w32">
                        <select onChange={handleChange} name="pilier" value={datas?.pilier} className="input-select">
                            <option value="">Axe 1 du module</option>
                            <option>Climat Air Energie</option>
                            <option>Economie circulaire</option>
                            <option>Approche transversale</option>
                        </select>
                        <span className="material-icons">expand_more</span>
                    </div>
                    <div className="select w32">
                        <select onChange={handleChange} name="pilier2" value={datas?.pilier2} className="input-select">
                            <option value="">Axe 2 du module</option>
                            <option>Climat Air Energie</option>
                            <option>Economie circulaire</option>
                            <option>Approche transversale</option>
                        </select>
                        <span className="material-icons">expand_more</span>
                    </div>
                    <div className="select w32">
                        <select onChange={handleChange} name="thematique" value={datas?.thematique} className="input-select">
                            <option value="">Thématique du module</option>
                            <option>Planification territoriale</option>
                            <option>Energie, eau et assainissement</option>
                            <option>Mobilité et qualité de l'air</option>
                            <option>Transition bas carbone</option>
                            <option>Prévention et gestion des déchets</option>
                            <option>Consommation responsable</option>
                            <option>Autres piliers de l'économie circulaire</option>
                            <option>Gouvernance et pilotage</option>
                        </select>
                        <span className="material-icons">expand_more</span>
                    </div>
                </div>
                <div className="mTop25">
                    <button onClick={saveModifs} className="btn__normal btn__dark">Enregistrer le module</button>
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