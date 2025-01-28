import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import prisma from '@/prisma';
import { useState, useEffect } from 'react'
import PilierBox from '@/components/PilierBox'
import ModuleBox from '@/components/ModuleBox'
import styles from '@/styles/Rencontres.module.css'

export async function getServerSideProps(context) {
    const { query } = context;
    const { pilier, nom, region, departement, thematique, dateDebut } = query;
    

    let sessionWhere = {}; // Initialiser avec un objet vide

    // Construire les conditions pour les sessions si nécessaire
    if (region) sessionWhere.region = region;
    if (departement) sessionWhere.departement = departement;
    if (dateDebut) sessionWhere.dateDebut = { gte: new Date(dateDebut) };

    let queryOptions = {
        where: {},
        include: {
            sessions: {
                where: sessionWhere, // Appliquer les conditions de filtrage des sessions ici
            },
        },
    };

    // Appliquer des filtres liés directement aux modules
    if (pilier) queryOptions.where.pilier = pilier;
    if (thematique) queryOptions.where.thematique = thematique;
    if (nom) queryOptions.where.nom = {
        contains: nom,
        mode: 'insensitive',
    };

    // Assurez-vous que les modules retournés ont des sessions qui correspondent aux critères si région est spécifiée
    // if (region || thematique) {
    //     queryOptions.where.sessions = {
    //         some: sessionWhere,
    //     };
    // }

    // Récupérer les modules depuis la base de données ou une API externe
    let base = await prisma.module.findMany(queryOptions);
    // base = base.filter(module => module.sessions.length > 0);

    // Transformer les dates en chaînes ISO si nécessaire
    base = base.map(module => ({
        ...module,
        datePublication: module.datePublication ? module.datePublication.toISOString() : null,
        lastUpdate: module.lastUpdate ? module.lastUpdate.toISOString() : null,
    }));

    // Retourner les données transformées comme props à la page
    return {
        props: {
            base: JSON.parse(JSON.stringify(base)),
            region: region ? region : '',
            pilier: pilier ? pilier : '',
            thematique: thematique ? thematique : ''
        },
    };
}



export default function Rencontres({ base, region, pilier, thematique }){

    console.log(base)

    const [modules, setModules] = useState(base)
    const [actions, setActions] = useState(0)
    const [loader, setLoader] = useState(false)
    const [filtres, setFiltres] = useState({
        pilier: pilier,
        nom: '',
        region: region,
        departement: '',
        thematique: thematique,
        dateDebut: ''
    })
    const [switcher, setSwitcher] = useState(false)

    function formatDate(dateString) {
        const base = dateString.split('T');
        const [year, month, day] = base[0].split('-')
        return `${day}/${month}/${year}`;
    }    

    useEffect(() => {
        if(region != ''){
            setSwitcher(true)
        }
    }, [region])

    const getModules = async () => {
        const { pilier, nom, region, departement, thematique, dateDebut } = filtres
        let url = '/api/modules/?'

        if(pilier){
            url += 'pilier='+encodeURIComponent(pilier)+'&'
        }

        if(nom){
            url += 'nom='+encodeURIComponent(nom)
        }

        if(region){
            url += 'region='+encodeURIComponent(region)+'&'
        }

        if(departement){
            url += 'departement='+encodeURIComponent(departement)+'&'
        }

        if(thematique){
            url += 'thematique='+encodeURIComponent(thematique)+'&'
        }

        if(dateDebut){
            url += 'dateDebut='+encodeURIComponent(dateDebut)+'&'
        }

        const fetcher = await fetch(url)
        const json = await fetcher.json()
        let alles;
        if (switcher) {
            alles = json.filter(module =>
                module.sessions.some(session => session.status === 'publish')
            );
        } else {
            alles = json;
        }

        setModules(alles)
    }

    useEffect(() => {
        setActions(prev => prev+1)
        if(actions > 0){
            getModules()
        }
    }, [filtres, switcher])

    

    // useEffect(() => {
    //     setFiltres(prev => {
    //         return {
    //             ...prev,
    //             thematique: ''
    //         }
    //     })
    // }, [filtres.pilier])
    

    return (
        <>
            <Head>
                <title>Les rencontres | ADEME</title>
            </Head>
            <div className={styles.Rencontres}>
                <div className="section blued">
                    <div className="boxed">
                        <h1>Les rencontres à venir dans votre région</h1>
                        {/* <div className="flex space-between mTop40 toColumn">
                            <div className="w32 wm100 mmBot20">
                            <PilierBox 
                                pic="climat-air-energie.webp"
                                title="Climat Air Energie" 
                                description="Adaptation au changement climatique, Rafraîchissement urbain, Géothermie, Zéro Artificialisation Nette, … Découvrez les rencontres programmées sur la thématique Climat Air Energie !" 
                                setFiltres={setFiltres}
                                active={filtres.pilier}
                            />
                            </div>
                            <div className="w32 wm100 mmBot20">
                            <PilierBox 
                                pic="climat-air-energie-1.webp"
                                title="Economie Circulaire" 
                                description="Tarification Incitative, Sobriété, Alimentation Durable, Tourisme, Biodéchets, … Découvrez les rencontres programmées sur la thématique Economie Circulaire !" 
                                setFiltres={setFiltres}
                                active={filtres.pilier}
                            />
                            </div>
                            <div className="w32 wm100">
                            <PilierBox 
                                pic="transversal.webp"
                                title="Approche transversale" 
                                description="Pilotage du programme TETE, Budget Vert, Engagement de ses élus, … Découvrez les rencontres programmées sur l’approche transversale de la transition écologique !" 
                                setFiltres={setFiltres}
                                active={filtres.pilier}
                            />
                            </div>
                        </div> */}
                    </div>
                </div>
                <div className="section">
                    <div className="boxed">
                        <div className="flex toColumn gap50">
                            <div className="w70 wm100">
                                <div className="flex aligncenter gap10 mgap15 mBot30">
                                    <div className={`${styles.Switcher} ${switcher ? styles.On : undefined}`} onClick={() => setSwitcher(prev => !prev)}>
                                        <span className={switcher ? styles.Activate : undefined}></span>
                                    </div>
                                    <span className={styles.FilterSwitch}>Afficher uniquement les thématiques avec des Rencontres programmées</span>
                                </div>
                                {/* <h2>Tous les modules disponibles {(filtres.pilier != '' || filtres.nom != '' || filtres.dateDebut != '' || filtres.thematique != '' || filtres.departement != '' || filtres.region != '') && 'suivant vos critères'} :</h2> */}
                                {(filtres.pilier != '' || filtres.nom != '' || filtres.dateDebut != '' || filtres.thematique != '' || filtres.departement != '' || filtres.region != '') && (
                                <div className="flex aligncenter wrap gap10 mBot20">
                                    {filtres.pilier != '' && (
                                        <button
                                            onClick={() => setFiltres(prev => { return { ...prev, pilier: '' } })}
                                            className={styles.AddFilter}>{filtres.pilier}
                                            <span className="material-icons">close</span>
                                        </button>
                                    )}
                                    {filtres.nom != '' && (
                                        <button
                                            onClick={() => setFiltres(prev => { return { ...prev, nom: '' } })}
                                            className={styles.AddFilter}>{filtres.nom}
                                            <span className="material-icons">close</span>
                                        </button>
                                    )}
                                    {filtres.region != '' && (
                                        <button
                                            onClick={() => setFiltres(prev => { return { ...prev, region: '' } })}
                                            className={styles.AddFilter}>{filtres.region}
                                            <span className="material-icons">close</span>
                                        </button>
                                    )}
                                    {filtres.departement != '' && (
                                        <button
                                            onClick={() => setFiltres(prev => { return { ...prev, departement: '' } })}
                                            className={styles.AddFilter}>{filtres.departement}
                                            <span className="material-icons">close</span>
                                        </button>
                                    )}
                                    {filtres.thematique != '' && (
                                        <button
                                            onClick={() => setFiltres(prev => { return { ...prev, thematique: '' } })}
                                            className={styles.AddFilter}>{filtres.thematique}
                                            <span className="material-icons">close</span>
                                        </button>
                                    )}
                                    {filtres.dateDebut != '' && (
                                        <button
                                            onClick={() => setFiltres(prev => { return { ...prev, dateDebut: '' } })}
                                            className={styles.AddFilter}>{formatDate(filtres.dateDebut)}
                                            <span className="material-icons">close</span>
                                        </button>
                                    )}
                                </div>
                                )}
                                {modules.length > 0 ? (
                                <div className="flex wrap gap15">
                                    {!switcher ? 
                                        modules.map((module, index) => {
                                            
                                            const publishedUpcomingSessions = module.sessions.filter(session => {
                                                const isPublished = session.status === "publish";
                                                const isUpcoming = new Date(session.dateDebut) > new Date();
                                                return isPublished && isUpcoming;
                                            });
                        
                                            return (
                                                <div key={index} className="w32 wm100">
                                                    <ModuleBox 
                                                        title={module.nom}
                                                        id={module.id}
                                                        link={`/rencontres/${module.slug}`}
                                                        theme={module.thematique}
                                                        length={publishedUpcomingSessions}
                                                    />
                                                </div>
                                            );
                                            
                                        }) : modules.map((module, index) => {
                                            const publishedUpcomingSessions = module.sessions.filter(session => {
                                                const isPublished = session.status === "publish";
                                                const isUpcoming = new Date(session.dateDebut) > new Date();
                                                return isPublished && isUpcoming;
                                            });
                                            
                                            if (publishedUpcomingSessions.length > 0) {
                                                return (
                                                    <div key={index} className="w32 wm100">
                                                        <ModuleBox 
                                                            title={module.nom}
                                                            id={module.id}
                                                            link={`/rencontres/${module.slug}`}
                                                            theme={module.thematique}
                                                            length={publishedUpcomingSessions}
                                                        />
                                                    </div>
                                                );
                                            }
                                            return null;                                            
                                        })
                                    }
                                </div>
                                ) : (
                                    <div className="mTop20">
                                        {(filtres.region && filtres.pilier) ? (
                                            <span>Aucune rencontre disponible avec les filtres activés dans cette région.<br /> <a className={styles.nothing} onClick={() => setFiltres(prev => { return { ...prev, pilier: '' } })}>Voir les rencontres programmées dans ma région</a></span>
                                        ) : filtres.region ? (
                                            <span>Aucune rencontre disponible avec les filtres activés.<br /> Sélectionnez une autre région pour voir les prochaines rencontres programmées.</span>
                                        ) : (
                                            <span>Aucune rencontre disponible avec les filtres activés.<br /> Sélectionnez une autre thématique pour voir les prochaines rencontres programmées.</span>
                                        )}                                       
                                    </div>                                    
                                )}
                            </div>          
                            <div className="w30 wm100">
                                <div>
                                    <span className={styles.Label}>Rechercher par axe de la transition écologique</span>
                                    <div className="select">
                                        <select name="pilier" value={filtres.pilier} onChange={(event) => setFiltres(prev => { return { ...prev, pilier: event.target.value, nom: '' } })} className="input-select">
                                            <option value="">Tous les axes</option>
                                            <option>Climat Air Energie</option>
                                            <option>Economie circulaire</option>
                                            <option>Approche transversale</option>
                                        </select>
                                        <span className="material-icons">expand_more</span>
                                    </div>
                                </div>
                                <div className="mTop40">
                                    <span className={styles.Label}>Rechercher par thématique</span>
                                    <div className="select">
                                        <select name="thematique" value={filtres.thematique} onChange={(event) => setFiltres(prev => { return { ...prev, thematique: event.target.value, nom: '' } })} className="input-select">
                                            <option value="">Toutes les thématiques</option>
                                            {filtres.pilier == '' ? (
                                            <>
                                                <option>Planification territoriale</option>
                                                <option>Energie, eau et assainissement</option>
                                                <option>Mobilité et qualité de l'air</option>
                                                <option>Transition bas carbone</option>
                                                <option>Prévention et gestion des déchets</option>
                                                <option>Consommation responsable</option>
                                                <option>Autres piliers de l'économie circulaire</option>
                                                <option>Gouvernance et pilotage</option>
                                            </>
                                            ) : (
                                                <>
                                                    {filtres.pilier == 'Climat Air Energie' && (
                                                        <>
                                                            <option>Planification territoriale</option>
                                                            <option>Energie, eau et assainissement</option>
                                                            <option>Mobilité et qualité de l'air</option>
                                                            <option>Transition bas carbone</option> 
                                                        </>                                                       
                                                    )}
                                                    {filtres.pilier == 'Economie circulaire' && (
                                                        <>
                                                            <option>Prévention et gestion des déchêts</option>
                                                            <option>Consommation responsable</option>
                                                            <option>Autres piliers de l'économie circulaire</option>
                                                        </>                                                       
                                                    )}
                                                    {filtres.pilier == 'Approche transversale' && (
                                                        <>
                                                            <option>Gouvernance et pilotage</option>
                                                        </>                                                       
                                                    )}
                                                </>
                                            )}
                                        </select>
                                        <span className="material-icons">expand_more</span>
                                    </div>
                                </div>
                                <div className="mTop40">
                                    <span className={styles.Label}>Rechercher par nom</span>
                                    <input 
                                        name="nom" 
                                        value={filtres.nom} 
                                        onChange={(event) => setFiltres(
                                            prev => { 
                                                return { 
                                                    pilier: '',
                                                    nom: event.target.value,
                                                    region: '',
                                                    departement: '',
                                                    thematique: '',
                                                    dateDebut: ''
                                                } 
                                            }
                                        )} 
                                        type="text" 
                                        className="input-text" 
                                        placeholder="Commencez à taper..." 
                                    />
                                </div>
                                <div className="mTop40">
                                    <span className={styles.Label}>Rechercher par région</span>
                                    <ul className={styles.Regions}>
                                        <li className={filtres.region == 'Auvergne-Rhône-Alpes' ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: 'Auvergne-Rhône-Alpes' } });setSwitcher(true)}}><span className="material-icons">room</span>Auvergne-Rhône-Alpes</li>
                                        <li className={filtres.region == 'Bourgogne-Franche-Comté' ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: 'Bourgogne-Franche-Comté' } });setSwitcher(true)}}><span className="material-icons">room</span>Bourgogne-Franche-Comté</li>
                                        <li className={filtres.region == 'Bretagne' ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: 'Bretagne' } });setSwitcher(true)}}><span className="material-icons">room</span>Bretagne</li>
                                        <li className={filtres.region == 'Centre-Val de Loire' ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: 'Centre-Val de Loire' } });setSwitcher(true)}}><span className="material-icons">room</span>Centre-Val de Loire</li>
                                        <li className={filtres.region == 'Corse' ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: 'Corse' } });setSwitcher(true)}}><span className="material-icons">room</span>Corse</li>
                                        <li className={filtres.region == 'Normandie' ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: 'Normandie' } });setSwitcher(true)}}><span className="material-icons">room</span>Normandie</li>
                                        <li className={filtres.region == 'Nouvelle-Aquitaine' ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: 'Nouvelle-Aquitaine' } });setSwitcher(true)}}><span className="material-icons">room</span>Nouvelle-Aquitaine</li>
                                        <li className={filtres.region == 'Occitanie' ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: 'Occitanie' } });setSwitcher(true)}}><span className="material-icons">room</span>Occitanie</li>
                                        <li className={filtres.region == 'Grand-Est' ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: 'Grand-Est' } });setSwitcher(true)}}><span className="material-icons">room</span>Grand-Est</li>
                                        <li className={filtres.region == 'Hauts-de-France' ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: 'Hauts-de-France' } });setSwitcher(true)}}><span className="material-icons">room</span>Hauts-de-France</li>
                                        <li className={filtres.region == 'Île-de-France' ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: 'Île-de-France' } });setSwitcher(true)}}><span className="material-icons">room</span>Île-de-France</li>
                                        <li className={filtres.region == 'Pays de la Loire' ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: 'Pays de la Loire' } });setSwitcher(true)}}><span className="material-icons">room</span>Pays de la Loire</li>
                                        <li className={filtres.region == "Provence-Alpes-Côte d'Azur" ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: "Provence-Alpes-Côte d'Azur" } });setSwitcher(true)}}><span className="material-icons">room</span>Provence-Alpes-Côte d'Azur</li>
                                        <li className={filtres.region == "Guadeloupe" ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: "Guadeloupe" } });setSwitcher(true)}}><span className="material-icons">room</span>Guadeloupe</li>
                                        <li className={filtres.region == "Martinique" ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: "Martinique" } });setSwitcher(true)}}><span className="material-icons">room</span>Martinique</li>
                                        <li className={filtres.region == "Guyane" ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: "Guyane" } });setSwitcher(true)}}><span className="material-icons">room</span>Guyane</li>
                                        <li className={filtres.region == "Polynésie Française" ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: "Polynésie Française" } });setSwitcher(true)}}><span className="material-icons">room</span>Polynésie Française</li>
                                        <li className={filtres.region == "Saint-Pierre et Miquelon" ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: "Saint-Pierre et Miquelon" } });setSwitcher(true)}}><span className="material-icons">room</span>Saint-Pierre et Miquelon</li>
                                        <li className={filtres.region == "Océan Indien" ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: "Océan Indien" } });setSwitcher(true)}}><span className="material-icons">room</span>Océan Indien</li>
                                        <li className={filtres.region == "Nouvelle Calédonie" ? styles.RegionActive : undefined} onClick={(event) => {setFiltres(prev => { return { ...prev, nom: '', departement: '', region: "Nouvelle Calédonie" } });setSwitcher(true)}}><span className="material-icons">room</span>Nouvelle Calédonie</li>
                                    </ul>
                                </div>
                                <div className="mTop40">
                                    <span className={styles.Label}>Rechercher par département</span>
                                    <div className="select">
                                        <select name="departement" value={filtres.departement} onChange={(event) => setFiltres(prev => { return { ...prev, departement: event.target.value, region: '', nom: '' } })} className="input-select">
                                            <option>Tous les départements</option>
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
                                            <option>974 - La Reunion</option>
                                            <option>976 - Mayotte</option>
                                            <option>Polynésie Française</option>
                                            <option>Saint-Pierre et Miquelon</option>
                                            <option>Océan Indien</option>
                                            <option>Nouvelle Calédonie</option>
                                        </select>
                                        <span className="material-icons">expand_more</span>
                                    </div>
                                </div>
                                <div className="mTop40">
                                    <span className={styles.Label}>Rechercher par date de début</span>
                                    <div className="flex aligncenter gap10">
                                        <input name="dateDebut" value={filtres.dateDebut} onChange={(event) => setFiltres(prev => { return { ...prev, dateDebut: event.target.value, nom: '' } })} type="date" className="input-date" />
                                    </div>                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section-top border-top">
                    <div className="boxed">
                        <div className="flex toColumn">
                            <div className="w60 wm100">
                            <h2><span className="orange">Créez un compte</span> ou connectez-vous pour vous inscrire aux rencontres dans votre région.</h2>
                            <div className="flex aligncenter toColumn gap20 mTop30 mmLeft">
                                <Link href="/inscription" className="btn__normal btn__dark">S'inscrire à la plateforme</Link>
                                <Link href="/connexion" className="btn__normal btn__light">Se connecter</Link>
                            </div>
                            </div>
                            <div className="w40 wm100">
                            <img src="medias/inscription.webp" className="w100" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}