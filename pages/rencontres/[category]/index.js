import Link from 'next/link'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import Team from '@/components/Team'
import ProgItem from '@/components/ProgItem'
import SessionBox from '@/components/SessionBox'
import styles from '@/styles/Module.module.css'

export async function getServerSideProps(context) {
    const { req, query } = context;
    const { category } = context.query;

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;

    const getData = await fetch(`${protocol}://${host}/api/modules/slug?slug=${category}`)
    const json = await getData.json()

    if(json.page === true){
        let data = json.data[0]
        return {
            props: { data }
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

export default function Module({ data }){

    function formatDate(dateString) {
        const base = dateString.split('T');
        const [year, month, day] = base[0].split('-')
        return `${day}/${month}/${year}`;
    }    

    const lastUpdate = formatDate(data.lastUpdate);

    const [sessions, setSessions] = useState([])
    const [region, setRegion] = useState('')

    const getSessions = async (departement) => {
        const fetcher = await fetch(`/api/sessions?id=${data.id}&region=${region}&status=publish`)
        const json = await fetcher.json()
        setSessions(json)
    }

    useEffect(() => {
        getSessions(region)
    }, [region])

    useEffect(() => {
        // Sélectionnez le conteneur qui a le contenu injecté
        const contentDiv = document.querySelector(`.${styles.Content}`);
        if (contentDiv) {
          // Trouvez tous les <p> dans ce conteneur
          contentDiv.querySelectorAll('p').forEach((p) => {
            // Vérifiez si le <p> contient un <br>
            if (p.innerHTML.includes('<br')) {
              // Ajoutez la classe spécifique si un <br> est trouvé
              p.classList.add(styles.pWithBr);
            }
          });
        }
      }, [data.metasModule.resumeProgramme]);

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
    

    const groupedData = groupByDay(data.metasModule.programmeModule);
    return (
        <>
            <Head>
                <title>{data.nom}</title>
            </Head>
            <div className={styles.Module}>
                <div className="section">
                    <div className="boxed">
                        <div className={styles.Header}>
                            <h1>{data.nom}</h1>
                            <p className={styles.Breadcrump}>
                                <Link href="/">Accueil</Link> /
                                <Link href="/rencontres">Toutes les rencontres</Link> /
                                <span>{data.nom}</span>
                            </p>
                            <span className={styles.Tag}>{data.pilier}</span>
                            <p className={styles.Intro}><strong>{data.description}</strong></p>
                            {/* <p>Code rencontre : #{data.code} - Dernière mise à jour : {lastUpdate}</p> */}
                        </div>
                        <div className="flex toColumn gap80 mTop50 paddline">
                            <div className="w70 wm100">   
                            {data.visuel != null && (
                                <img src={data.visuel} alt="visuel" className={styles.visu} />
                            )}                             
                            <div
                                className={styles.Content}
                                dangerouslySetInnerHTML={{ __html: data.metasModule.resumeProgramme }}
                                ></div>
                            </div>
                            <div className={`w30 wm100 ${styles.sticky}`}>
                                {/* <div className="text-center">
                                    <img src="/medias/infos-cles.webp" alt="infos clés" className="w50" />
                                </div> */}
                                <div className={styles.Infos}>
                                    <span>Informations clés</span>
                                    <div className={styles.InfosContent}>
                                        <span className={styles.InfosLabel}>Objectifs :</span>
                                        <span className={styles.InfosValue} dangerouslySetInnerHTML={{ __html: data.metasModule.objectifs}}></span>
                                        <div className="flex aligncenter gap5">
                                            <span className={styles.InfosLabel}>Durée :</span>
                                            <span className={styles.InfosValue}>{data.metasModule.duree}</span>
                                        </div>
                                        <div className="mTop10 aligncenter gap10">
                                            <span className={styles.InfosLabel}>Public cible :</span>
                                            <span className={styles.InfosValue}>{data.metasModule.publicCible}</span>
                                        </div>
                                        <div className="flex aligncenter gap5">
                                            <span className={styles.InfosLabel}>Tarif :</span>
                                            <span className={styles.InfosValue}>{data.metasModule.tarif}</span>
                                        </div>
                                        <div className="text-center mTop15">
                                            <Link href="#sessions" className="btn__normal btn__orange w100">S'inscrire à une session</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <div className="mTop50">
                            <h2>Équipe pédagogique</h2>
                            <div className="flex wrap gap25 mTop40">
                                <div className="w32">
                                    <Team
                                        img="/medias/user.png"
                                        name="Personne A"
                                        description="Descriptif du poste de la personne A"
                                    />
                                </div>
                                <div className="w32">
                                    <Team
                                        img="/medias/user.png"
                                        name="Personne B"
                                        description="Descriptif du poste de la personne B"
                                    />
                                </div>
                                <div className="w32">
                                    <Team
                                        img="/medias/user.png"
                                        name="Personne C"
                                        description="Descriptif du poste de la personne C"
                                    />
                                </div>
                                <div className="w32">
                                    <Team
                                        img="/medias/user.png"
                                        name="Personne D"
                                        description="Descriptif du poste de la personne D"
                                    />
                                </div>
                                <div className="w32">
                                    <Team
                                        img="/medias/user.png"
                                        name="Personne E"
                                        description="Descriptif du poste de la personne E"
                                    />
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
            <div className="section blued">
                <div className="boxed">
                    <h2>Découvrez le programme de la rencontre</h2>
                    <div className="flex wrap gap25 mTop40">
                        {Object.keys(groupedData).map(day => (
                            <div key={day}>
                                {data.metasModule.duree == "2 jours" && (
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
                </div>
            </div>
            <div className="section" id="sessions">
                <div className="boxed">
                    <h2>Les sessions à venir en région</h2>
                    <div className="flex aligncenter gap10 mTop20 toColumn">
                        <div className="w30 wm100">
                            <div className="select">
                                <select name="region" value={region} onChange={(event) => {setRegion(event.target.value)}} className="input-select">
                                    <option value="">Sélectionnez une région</option>
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
                        </div>
                    </div>
                    {sessions.length > 0 ? (
                    <div className="flex wrap gap15 mTop30">
                        {sessions
                        .filter(session => {
                            const dateDebut = new Date(session.dateDebut);
                            const now = new Date();
                            return session.status === 'publish' && dateDebut >= now;
                        })
                        .map((session, index) => {
                            return (
                                <div key={index} className="w32 wm100">
                                    <SessionBox 
                                        date={formatDate(session.dateDebut)}
                                        region={session.region}
                                        title={session.module.nom}
                                        link={`/rencontres/${session.module.slug}/session-${formatDate(session.dateDebut).replaceAll('/', '-')}-${session.region.normalize("NFD")
                                        .replace(/[\u0300-\u036f]/g, "")
                                        .replace(/[.,']/g, "")
                                        .replace(/\s+/g, '-')
                                        .toLowerCase()}`}
                                        dept={session.departement}
                                        displayDept="no"
                                    />
                                </div>
                            )
                        })}
                    </div>
                    ) : (
                        <div className="mTop30">
                            <span>Aucune session disponible pour le moment.</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}