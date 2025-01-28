import Link from 'next/link'
import Head from 'next/head'
import Team from '@/components/Team'
import ProgItem from '@/components/ProgItem'
import Alert from '@/components/Alert'
import { Notif } from '@/components/Notif'
import { useState, useEffect } from 'react'
import nextCookies from 'next-cookies';
import { verifyToken } from '@/utils/auth';
import styles from '@/styles/Session.module.css'

export async function getServerSideProps(context) {
    const { req, query } = context;
    const { category, session } = context.query;

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;

    const { auth: token } = nextCookies(context);
    const user = verifyToken(token);
  
    // if (!user) {
    //   return {
    //     redirect: {
    //       destination: '/connexion',
    //       permanent: false,
    //     },
    //   };
    // }

    const getData = await fetch(`${protocol}://${host}/api/sessions/slug?module_slug=${category}&session=${session}`)
    const json = await getData.json()

    if(json.length > 0){
        let data = json[0]
        return {
            props: { data, user }
        }
    }
    else{
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }
}

export default function Session({ data, user }){

    function formatDate(dateString) {
        const base = dateString.split('T');
        const [year, month, day] = base[0].split('-')
        return `${day}/${month}/${year}`;
    }    

    const [alert, setAlert] = useState(null)
    const [notif, setNotif] = useState(null)
    const [check, setCheck] = useState(false)
    const [inscriptionPasse, setInscriptionPasse] = useState(false)
    const [dispo, setDispo] = useState(true)
    const [reg, setReg] = useState(0)
    const [nbInscrits, setNbInscrits] = useState(0)
    const [other, setOther] = useState(false)
    const [otherSave, setOtherSave] = useState('')
    const [loading, setLoading] = useState(false)

    const [inscription, setInscription] = useState({
        userId: '',
        civilite: '',
        nom: '',
        prenom: '',
        mail: '',
        structure: '',
        fonction: '',
        type_fonction: '',
        ville: '',
        region: '',
        telephone: '',
        transport: '',
        besoins: '',
        hebergement: '',
        regime: 'Omnivore',
        programmeTETE: '',
        participationUlterieure: false,
        days: true,
        repas: false,
        repas2: false,
        rgpd: false,
        rgpd2: false
    })

    const handleChange = (event) => {
        const { name, type, value, checked } = event.target
        setInscription(prev => {
            return {
                ...prev,
                [name]: type == 'checkbox' ? checked : (value == 'false' ? false : value == 'true' ? true : value)
            }
        })
    }

    const registerUser = async () => {
        setLoading(true)
        let inscriptionData = {
            civilite: inscription.civilite,
            mail: inscription.mail,
            nom: inscription.nom,
            prenom: inscription.prenom,
            structure: inscription.structure == 'Autre' ? otherSave : inscription.structure,
            fonction: inscription.fonction,
            typeFonction: inscription.type_fonction,
            ville: inscription.ville,
            region: inscription.region,
            telephone: inscription.telephone,
            transport: inscription.transport,
            repas: inscription.repas,
            repas2: inscription.repas2,
            besoins: inscription.besoins,
            regime: inscription.regime,
            programmeTETE: inscription.programmeTETE,
            participationUlterieure: inscription.participationUlterieure,
            days: inscription.days
        }


        const userType = (user.type == "Administrateur" || user.type == "DR") ? "special" : "user"

        console.log("TYPE => ", userType)


        const registering = await fetch('/api/registrations/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inscriptionData: inscriptionData,
                userId: inscription.userId,
                sessionId: data.id,
                type: userType
            })
        })

        const json = await registering.json()

        setCheck(true)

        setAlert(null)
        setNotif({
            text: 'Votre inscription a bien été prise en compte !',
            icon: 'done'
        }) 
        setInscription({
            userId: '',
            civilite: '',
            nom: '',
            prenom: '',
            mail: '',
            structure: '',
            fonction: '',
            type_fonction: '',
            ville: '',
            region: '',
            telephone: '',
            transport: '',
            besoins: '',
            hebergement: '',
            regime: 'Omnivore',
            programmeTETE: '',
            participationUlterieure: false,
            repas: false,
            repas2: false,
            days: true,
            rgpd: false,
            rgpd2: false
        })
        setLoading(false)
    }

    const register = async () => {
        const { civilite, nom, prenom, mail, structure, fonction, type_fonction, ville, region, telephone, transport, besoins, hebergement, programmeTETE, repas, rgpd, rgpd2 } = inscription
        if(civilite && nom && prenom && mail && structure && fonction && type_fonction && region && programmeTETE && transport){
            if(rgpd && rgpd2){
                if(mail.includes('@') && mail.includes('.')){
                    setAlert({
                        icon: 'warning',
                        text: 'Êtes-vous sûr de vouloir participer à cette session ?',
                        // Supposons que `action` sera appelé si l'utilisateur confirme
                        action: () => registerUser()
                    })
                }
                else{
                    setNotif({
                        text: 'Verifiez votre adresse e-mail',
                        icon: 'close'
                    })                        
                }
            }
            else{
                setNotif({
                    text: 'Veuillez accepter les conditions',
                    icon: 'close'
                })                
            }
        }
        else{
            setNotif({
                text: 'Veuillez remplir tous les champs',
                icon: 'close'
            })
        }
    }

    const getAvailable = async () => {
        try {
            const fetcher = await fetch(`/api/registrations/bySession?sessionId=${data.id}`);
            const json = await fetcher.json();
    
            const max = parseInt(data.metasSession.nombrePlaces) || 0;
    
            // Filtrer uniquement les inscriptions valides (non supprimées)
            const validRegistrations = json.filter(registration => !registration.deleted);
    
            // Vérifier si le nombre de places disponibles est atteint
            if (validRegistrations.length >= max) {
                setDispo(false);
            } else {
                setDispo(true);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des inscriptions :', error);
        }
    };
    

    useEffect(() => {
        const getUserInfo = async () => {
            if(user != null && (user.type == "Administrateur" || user.type == "DR")){
                const fetcher = await fetch(`/api/accounts/${user.id}`)
                const json = await fetcher.json()
                let userDetail = await json[0]
                setInscription(prev => {
                    return {
                        ...prev,
                        userId: userDetail.id,
                        mail: userDetail.email,
                    }
                })
            } else {
                const fetcher = await fetch(`/api/users/${user.id}`)
                const json = await fetcher.json()
                let userDetail = await json[0]
                setInscription(prev => {
                    return {
                        ...prev,
                        userId: userDetail.id,
                        nom: userDetail.nom,
                        prenom: userDetail.prenom,
                        mail: userDetail.mail,
                        telephone: userDetail.telephone,
                        fonction:userDetail.fonction
                    }
                })
            }
        }

        if(user != null){
            getUserInfo()
        }


    }, [user])

    function convertTextToHTML(text) {
        // Échapper le texte pour éviter les injections XSS
        let escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      
        // Remplacer les sauts de ligne par <br />
        escapedText = escapedText.replace(/\n/g, "<br />");
      
        // // Convertir les URL en liens cliquables
        // const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        // const htmlWithLinks = escapedText.replace(urlRegex, function(url) {
        //   return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        // });
      
        return escapedText;
    }

    useEffect(() => {
        if(user != null && (user.type == "Administrateur" || user.type == "DR")){
            const checker = async () => {
                const fetcher = await fetch(`/api/registrations/byUserSession?userId=${user.id}&sessionId=${data.id}&specialAccount=true`)
                const json = await fetcher.json()
                if(json.length > 0 && json[0].deleted == false){
                    setCheck(true)
                }
            }
            if(user != null){
                checker()
            }
        } else {
            const checker = async () => {
                const fetcher = await fetch(`/api/registrations/byUserSession?userId=${user.id}&sessionId=${data.id}`)
                const json = await fetcher.json()
                if(json.length > 0 && json[0].deleted == false){
                    setCheck(true)
                }
            }
            if(user != null){
                checker()
            }
        }
    }, [data, alert, user])

    useEffect(() => {
        const checker = async () => {
            const fetcher = await fetch(`/api/registrations/bySession?sessionId=${data.id}`)
            const json = await fetcher.json()
            if(json.length > 0){
                setNbInscrits(json.filter((item) => !item.deleted).length)
            }
        }
        checker()
    }, [data, alert])

    useEffect(() => {
        const maintenant = new Date();
        const dateLimite = new Date(data.metasSession.dateLimiteInscription);

        getAvailable()
    
        if (dateLimite < maintenant) {
          setInscriptionPasse(true);
        } else {
          setInscriptionPasse(false);
        }
      }, [data]);

      const nextStep = () => {
        const { civilite, nom, prenom, mail, structure, fonction, type_fonction, ville, region, programmeTETE, telephone } = inscription
        if(civilite && nom && prenom && mail && structure && fonction && type_fonction && region && programmeTETE){
            setReg(1)
        }
        else{
            setNotif({
                text: 'Veuillez remplir tous les champs',
                icon: 'close'
            })            
        }
      }

      const transformLinks = (html) => {
        // Cette regex trouve les liens et capture l'URL
        const urlRegex = /<a href="(http[s]?:\/\/.*?)".*?>(.*?)<\/a>/g;
        
        return html.replace(urlRegex, (match, url, linkText) => {
          // Remplacez "Cliquez ici" par le texte que vous voulez montrer comme lien
          const clickableText = "Lien externe";
          
          // Retourne le HTML modifié avec le texte cliquable qui garde l'URL comme destination
          return `<a target="_blank" rel="noreferer noopener" href="${url}">${clickableText}</a>`;
        });
      };
      
    const transformedHTML = transformLinks(data.metasSession.explications);

    useEffect(() => {
        if(inscription.structure == 'Autre'){
            setOther(true)
        }
        else{
            setOther(false)
            setOtherSave('')
        }
    }, [inscription.structure])

    function groupByDay(programmes) {
        const groups = {};
    
        programmes.forEach(programme => {
            const dayMatch = programme.horaires.match(/Jour (\d+)/);
            if (dayMatch) {
                const day = dayMatch[1];
                if (!groups[day]) {
                    groups[day] = [];
                }
                groups[day].push(programme);
            } else {
                const unspecified = "Non spécifié";
                if (!groups[unspecified]) {
                    groups[unspecified] = [];
                }
                groups[unspecified].push(programme);
            }
        });
    
        return groups;
    }
    

    const groupedData = groupByDay(data.metasSession.programmeSession);


    return (
        <>
            <Head>
                <title>{data.module.nom} | Session du {formatDate(data.dateDebut)} - {data.region}</title>
            </Head>
            <div className={styles.Session}>
                <div className="section">
                    <div className="boxed">
                        <div className="flex gap30">
                            <div className={`${styles.Header} w70`}>
                                <h1>{formatDate(data.dateDebut)} : {data.module.nom}</h1>
                                <p className={styles.Breadcrump}>
                                    <Link href="/">Accueil</Link> /
                                    <Link href="/rencontres">Toutes les rencontres</Link> /
                                    <Link href={`/rencontres/${data.module.slug}`}>{data.module.nom}</Link> /
                                    <span>Rencontre du {formatDate(data.dateDebut)}</span>
                                </p>
                                <div className="flex aligncenter gap10">
                                    <span className={styles.Region}>{data.departement+' - '+data.region}</span>
                                    <span className={styles.Tag}>{data.module.nom}</span>
                                </div>                            
                                <p>{data.module.description}</p>
                                {/* <p>Code rencontre : #{data.module.code} - Dernière mise à jour : {formatDate(data.lastUpdate)}</p> */}
                                <div className={styles.additional}>
                                    {data.metasSession.explications && (
                                        <div dangerouslySetInnerHTML={{ __html: transformedHTML }}>
                                        </div>
                                    )}
                                </div>
                                {data.module.visuel != null && (
                                    <img src={data.module.visuel} alt="visuel" className={styles.visu} />
                                )}       
                            </div>
                            <div className="w30 wm100">
                                <div className={styles.Box}>
                                    <span className={styles.Title}>Détails pratiques</span>
                                    <div className="flex alignstart gap10 mTop30">
                                        <div className="w10">
                                            <img src="/medias/icon-date.webp" alt="icon" className="w70" />
                                        </div>
                                        <div className="w80">
                                            <span className={styles.dLabel}>Date :</span>
                                            <span className={styles.dValue}>{formatDate(data.metasSession.dateHoraires)}</span>
                                        </div>
                                    </div>
                                    <div className="flex alignstart gap10 mTop30">
                                        <div className="w10">
                                            <img src="/medias/icon-date.webp" alt="icon" className="w70" />
                                        </div>
                                        <div className="w80">
                                            <span className={styles.dLabel}>Durée du module :</span>
                                            <span className={styles.dValue}>{data.metasSession.nombreJours} jour{data.metasSession.nombreJours > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                    <div className="flex alignstart gap10 mTop20">
                                        <div className="w10">
                                            <img src="/medias/icon-date.webp" alt="icon" className="w70" />
                                        </div>
                                        <div className="w80">
                                            <span className={styles.dLabel}>Date limite d'inscription :</span>
                                            <span className={styles.dValue}>{formatDate(data.metasSession.dateLimiteInscription)}</span>
                                        </div>
                                    </div>
                                    <div className="flex alignstart gap10 mTop20">
                                        <div className="w10">
                                            <img src="/medias/icon-lieu.webp" alt="icon" className="w70" />
                                        </div>
                                        <div className="w80">
                                            <span className={styles.dLabel}>Lieu de la rencontre :</span>
                                            <span className={styles.dValue}>{data.metasSession.lieuRencontre}</span>
                                        </div>
                                    </div>
                                    <div className="flex alignstart gap10 mTop20">
                                        <div className="w10">
                                            <img src="/medias/icon-places.webp" alt="icon" className="w70" />
                                        </div>
                                        <div className="w80">
                                            <span className={styles.dLabel}>Nombre de places :</span>
                                            <span className={styles.dValue}>{data.metasSession.nombrePlaces}</span>
                                        </div>
                                    </div>
                                    <div className="flex alignstart gap10 mTop20">
                                        <div className="w10">
                                            <img src="/medias/icon-places.webp" alt="icon" className="w70" />
                                        </div>
                                        <div className="w80">
                                            <span className={styles.dLabel}>Nombre de places restantes :</span>
                                            <span className={styles.dValue}>{!dispo ? 0 : data.metasSession.nombrePlaces-nbInscrits}</span>
                                        </div>
                                    </div>
                                    {data.metasSession.infosTransport != '' && (
                                        <div className="flex alignstart gap10 mTop20">
                                            <div className="w10">
                                                <img src="/medias/icon-transport.webp" alt="icon" className="w70" />
                                            </div>
                                            <div className="w80">
                                                <span className={styles.dLabel}>Pour venir :</span>
                                                <span className={styles.dValue}>{data.metasSession.infosTransport}</span>
                                            </div>
                                        </div>
                                    )}
                                    {data.metasSession.infosComplementaires && (
                                        <div className="flex alignstart gap10 mTop20">
                                            <div className="w10">
                                                <img src="/medias/icon-infos.webp" alt="icon" className="w70" />
                                            </div>
                                            <div className="w80">
                                                <span className={styles.dLabel}>Infos complémentaires :</span>
                                                <span className={styles.dValue}>{data.metasSession.infosComplementaires}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="">
                    <div className="boxed">
                        <h2>Découvrez le programme de la session</h2>
                        {data.metasSession.programmeSession.length > 0 ? (
                            <div className="flex wrap gap25 mTop40">
                                {Object.keys(groupedData).map(day => (
                                    <div key={day}>
                                        {data.module.metasModule.duree == "2 jours" && (
                                            <span className={styles.dayTitle}>Jour {day}</span>
                                        )}
                                        <div className="flex wrap gap25">
                                            {groupedData[day].map((programme, index) => (
                                                <div key={index} className="w23 wm100">
                                                    <ProgItem
                                                        type={programme.horaires}
                                                        title={programme.titre}
                                                        description={programme.description}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mTop40">
                                <span>À venir.</span>
                            </div>       
                        )}
                    </div>
                </div>
                <div className="section whited mTop100">
                    <div className="boxed">
                        <h2>Les intervenants</h2>
                        {data.metasSession.intervenants.length > 0 ? (
                            <div className="flex wrap gap25 mTop40">
                                {data.metasSession.intervenants.map((inter, index) => {
                                    return (
                                        <div key={index} className="w32 wm100">
                                            <Team
                                                img="/medias/user.webp"
                                                name={inter.nom}
                                                description={`${inter.fonction} - ${inter.structure}`}
                                                linkedin={inter.linkedin}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="mTop40">
                                <span>À venir.</span>
                            </div>                        
                        )}
                    </div>
                </div>
                <div className="section">
                    <div className="boxed">
                        <h2 className="text-center">Inscription à cette rencontre</h2>
                        <div className="flex alignstart justicenter toColumn gap40 mTop40">
                            <div className={`w70 wm100 ${styles.Box}`}>
                                {user == null ? (
                                    <>
                                        <div className={styles.Already}>
                                            <span className="material-icons">error_outline</span>
                                            <div>Vous devez vous connecter à la plateforme pour pouvoir vous inscrire aux différentes sessions proposées.</div>
                                        </div>                                    
                                        <div className="flex toColumn gap10 justicenter mTop15">
                                            <Link className="btn__normal btn__dark" href="/inscription">Créer un compte</Link>
                                            <Link className="btn__normal btn__light" href="/connexion">Se connecter</Link>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                    {check ? (
                                        <div className={styles.Already}>
                                            <span className="material-icons">done</span>
                                            <div>Vous participez à cette rencontre ! Retrouvez tous les informations sur la rencontre "{data.module.nom}" directement dans votre <Link href="/espace-personnel">espace personnel</Link>.</div>
                                        </div>
                                    ) : (
                                        <>
                                            {inscriptionPasse ? (
                                                <div className={styles.Already}>
                                                    <span className="material-icons">error_outline</span>
                                                    <div><strong>Date limite d'inscription atteinte.</strong> Les inscriptions sont fermées pour cette session !</div>
                                                </div>
                                            ) : (
                                                <>
                                                    {(!dispo || data.metasSession.nombrePlaces-nbInscrits < 1) && (
                                                        <div className={styles.Already}>
                                                            <span className="material-icons">error_outline</span>
                                                            <div><strong>Il ne reste plus de place pour cette session.</strong> Les inscriptions sont fermées.</div>
                                                        </div>                                                    
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                    {(!check && dispo) && (
                                        <>
                                        <div className={`regbox ${reg == 0 ? styles.Act : undefined}`}>
                                            <span className={styles.Title}>Vos informations personnelles</span>
                                            <div className={styles.Form}>
                                                <div className="flex gap15 mTop20">
                                                    <div className="select w20">
                                                        <select name="civilite" onChange={handleChange} value={inscription.civilite} className="input-select">
                                                            <option>Civilité</option>
                                                            <option>Monsieur</option>
                                                            <option>Madame</option>
                                                            <option>Ne se prononce pas</option>
                                                        </select>
                                                        <span className="material-icons">expand_more</span>
                                                    </div>
                                                    <input name="nom" onChange={handleChange} value={inscription.nom} type="text" className="input-text w50" placeholder="Nom*" />
                                                    <input name="prenom" onChange={handleChange} value={inscription.prenom} type="text" className="input-text w50" placeholder="Prénom*" />
                                                </div>
                                                <div className="flex gap15 mTop20">
                                                    <input type="mail" name="mail" onChange={handleChange} value={inscription.mail} className="input-mail w50" placeholder="Adresse email professionnelle*" />
                                                    <input type="text" name="structure" onChange={handleChange} value={inscription.structure} className="input-mail w50" placeholder="Nom de votre structure*" />
                                                </div>
                                                <div className="mTop20">
                                                    <div className="flex aligncenter gap10">
                                                        <p className="w60">Votre organisation est-elle engagée dans le programme Territoire Engagé Transition Ecologique (TETE) de l’ADEME ?</p>
                                                        <div className="select w40">
                                                            <select name="programmeTETE" onChange={handleChange} value={inscription.programmeTETE} className="input-select">
                                                                <option value="">-</option>
                                                                <option>Oui</option>
                                                                <option>Non</option>
                                                                <option>Non concerné (je ne représente pas une collecitivté)</option>
                                                            </select>
                                                            <span className="material-icons">expand_more</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap15 mTop20">
                                                    <input name="fonction" onChange={handleChange} value={inscription.fonction} type="text" className="input-text w50" placeholder="Poste" />
                                                    <div className="select w50">
                                                        <select name="type_fonction" onChange={handleChange} value={inscription.type_fonction} className="input-select">
                                                            <option value="">Type de poste</option>
                                                            <option>Chargé de mission en collectivité</option>
                                                            <option>Directeur ou chef de service en collectivité</option>
                                                            <option>Élu en collectivité</option>
                                                            <option>Conseiller Territoire Engagé Transition écologique</option>
                                                            <option>Partenaire de la région</option>
                                                        </select>
                                                        <span className="material-icons">expand_more</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap15 mTop20 mBot20">
                                                    <input name="ville" onChange={handleChange} value={inscription.ville} type="text" className="input-text w50" placeholder="Ville de résidence" />
                                                    <div className="select w50">
                                                        <select name="region" onChange={handleChange} value={inscription.region} className="input-select">
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
                                                            <option>La Reunion</option>
                                                            <option>Mayotte</option>
                                                            <option>Polynésie Française</option>
                                                            <option>Saint-Pierre et Miquelon</option>
                                                            <option>Océan Indien</option>
                                                            <option>Nouvelle Calédonie</option>
                                                        </select>
                                                        <span className="material-icons">expand_more</span>
                                                    </div>
                                                    <input name="telephone" onChange={handleChange} value={inscription.telephone} type="text" className="input-text" placeholder="Numéro de téléphone" />
                                                </div>
                                                <div className="text-right">
                                                    <button onClick={() => nextStep()} className="btn__normal btn__dark">Continuer</button>
                                                </div>
                                            </div>
                                            </div>
                                            <div className={`regbox ${reg == 1 ? styles.Act : undefined}`}>
                                                <span className={styles.Title}>Collecte de données pour le calcul de l'empreinte environnementale de l'évènement</span>
                                                <div className="select w100 mTop20 mBot20">
                                                    <select name="transport" onChange={handleChange} value={inscription.transport} className="input-select">
                                                        <option value="">Mode de transport principal pour vous rendre à la rencontre :*</option>
                                                        <option>À pied</option>
                                                        <option>En vélo</option>
                                                        <option>Deux-roues (scooter, trottinette)</option>
                                                        <option>Transport en commun (Bus-Tram)</option>
                                                        <option>Train</option>
                                                        <option>Co-Voiturage</option>
                                                        <option>Voiture</option>
                                                        <option>Voiture électrique</option>
                                                        <option>Avion</option>
                                                    </select>
                                                    <span className="material-icons">expand_more</span>
                                                </div>
                                                <div className={`select w100 mTop20 mBot30 ${data.metasSession.nombreJours == 1 ? "noneall" : undefined}`}>
                                                    <select name="hebergement" onChange={handleChange} value={inscription.hebergement} className="input-select">
                                                        <option>Votre type d'hébergement*</option>
                                                        <option>Hôtel</option>
                                                        <option>Airbnb</option>
                                                        <option>Chez des amis</option>
                                                        <option>Chez moi</option>
                                                    </select>
                                                    <span className="material-icons">expand_more</span>
                                                </div>
                                                <div className="flex gap50 mBot30">
                                                    <div className="w50">
                                                        <span className={styles.Title}>Souhaitez-vous déjeuner sur place {data.metasSession.nombreJours > 1 && 'le jour 1'} ?</span>
                                                        <div className="flex aligncenter gap10 mTop10">
                                                            <input name="repas" onChange={handleChange} value="true" type="radio" /> Oui
                                                            <input name="repas" onChange={handleChange} value="false" type="radio" /> Non
                                                        </div>
                                                    </div>
                                                    <div className={`w50 ${(data.metasSession.nombreJours > 1 && inscription.days) ? undefined : 'disnone'}`}>
                                                        <span className={styles.Title}>Souhaitez-vous déjeuner sur place {data.metasSession.nombreJours > 1 && 'le jour 2'} ?</span>
                                                        <div className="flex aligncenter gap10 mTop10">
                                                            <input name="repas2" onChange={handleChange} value="true" type="radio" /> Oui
                                                            <input name="repas2" onChange={handleChange} value="false" type="radio" /> Non
                                                        </div>
                                                    </div>
                                                </div>
                                                {(inscription.repas || inscription.repas2) && (
                                                    <>
                                                        <span className={styles.Title}>Quel est votre type de régime alimentaire ?</span>
                                                        <div className="select w100 mTop20 mBot20">
                                                            <select value={inscription.regime} name="regime" onChange={handleChange} className="input-select">
                                                                <option>Omnivore</option>
                                                                <option>Végétarien</option>
                                                                <option>Vegan</option>
                                                            </select>
                                                            <span className="material-icons">expand_more</span>
                                                        </div>                                                
                                                    </>
                                                )}
                                                <span className={styles.Title}>Besoins spécifiques complémentaires</span>                           
                                                <textarea value={inscription.besoins} name="besoins" onChange={handleChange} className="textarea mBot20 mTop20" placeholder="Précisez-nous vos besoins (accès PMR, handicaps, allergies, …)"></textarea>
                                                <div className="flex gap50 mBot10">
                                                    <div className={`w50 ${data.metasSession.optionjour == true ? undefined : 'disnone'}`}>
                                                        <span className={styles.Title}>Participerez vous les deux jours ?</span>
                                                        <div className="flex aligncenter gap10 mTop10">
                                                            <input name="days" checked={inscription.days} onChange={handleChange} value="true" type="radio" /> Oui
                                                            <input name="days" onChange={handleChange} value="false" type="radio" /> Non
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mBot30">
                                                    <span className={styles.Title}>Avez-vous déjà participé à un événement organisé par l'ADEME ?</span>
                                                    <div className="flex aligncenter gap10 mTop10">
                                                        <input name="participationUlterieure" onChange={handleChange} value="true" type="radio" /> Oui
                                                        <input name="participationUlterieure" onChange={handleChange} value="false" type="radio" /> Non
                                                    </div>
                                                </div>
                                                <div className="mBot10">
                                                    <div className="checkbox">
                                                        <input name="rgpd" onChange={handleChange} value={inscription.rgpd} type="checkbox" /> <span>J’ai lu et j’accepte que l’ADEME collecte mes données afin de garantir la bonne utilisation des services offerts et reconnais avoir pris connaissance de sa politique de protection des données personnelles.</span>
                                                    </div>
                                                </div>
                                                <div className="mBot30">
                                                    <div className="checkbox">
                                                        <input name="rgpd2" onChange={handleChange} value={inscription.rgpd2} type="checkbox" /> <span>En m'inscrivant, je m'engage à participer à cette rencontre</span>
                                                    </div>
                                                </div>
                                                {(!check && !inscriptionPasse && dispo) && (
                                                    <div className="flex gap10 alignright">
                                                        <button onClick={() => setReg(0)} className="btn__normal btn__light">Retour</button>
                                                        <button onClick={register} className="btn__normal btn__dark">
                                                            Valider mon inscription
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}                                    
                                    </>
                                )}
                                {data.metasSession.mail_referent != undefined && data.metasSession.mail_referent != null && (
                                    <>
                                        <p><strong>Référent(e) DR {data.region}</strong></p>
                                        <p>Une question concernant cette Rencontre ? Contactez le référent sur l’adresse mail suivante :<br />{data.metasSession.mail_referent}</p>
                                    </>
                                )}                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {alert != null && (
                <Alert datas={alert} setAlert={setAlert} />
            )}  
            {notif != null && (
                <Notif datas={notif} setNotif={setNotif} />
            )}
            {loading && (
                <div className={styles.Loading}>
                    <img src="/medias/loading.gif" alt="loading" />
                </div>
            )}
        </>
    )
}