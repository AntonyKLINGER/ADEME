import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Notif } from '@/components/Notif'
import styles from '@/styles/Login.module.css'

export default function Register(){

    const [userDetails, setUserDetails] = useState({})
    const [notif, setNotif] = useState(null)
    const [success, setSuccess] = useState(false)

    const handleChange = async (event) => {
        const { name, type, checked, value } = event.target
        setUserDetails(prev => {
            return {
                ...prev,
                [name]: type == "checkbox" ? checked : value
            }
        })
    }

    const checkMail = async (mail) => {
        const fetcher = await fetch(`/api/users/lib/checkmail/?mail=${mail}`)
        const json = await fetcher.json()
        return json.exist
    }

    const createAccount = async () => {
        const { nom, prenom, mail, telephone, motDePasse, motDePasse2, fonction, newsletter, rgpd, region, organisation } = userDetails
        if(nom && prenom && mail && motDePasse && motDePasse2 && fonction && rgpd && region && organisation){
            if(motDePasse == motDePasse2){
                const mailExist = await checkMail(mail)
                if(!mailExist){
                    if(motDePasse.length > 5){

                        let userData = {
                            nom: nom,
                            prenom: prenom,
                            mail: mail,
                            telephone: telephone,
                            motDePasse: motDePasse,
                            fonction: fonction,
                            region: region,
                            organisation: organisation,
                            newsletter: newsletter ? true : false
                        }

                        const create = await fetch('/api/users/create', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({userData : userData})
                        })
                        const json = await create.json()
                        if(json.id){
                            setSuccess(true)
                        }
                    }
                    else{
                        setNotif({
                            text: 'Mot de passe trop court !',
                            icon: 'close'
                        })                         
                    }
                }
                else{
                    setNotif({
                        text: 'Cette adresse e-mail est déjà utilisée !',
                        icon: 'close'
                    })                      
                }
            }
            else{
                setNotif({
                    text: 'Les mots de passe ne sont pas identiques !',
                    icon: 'close'
                })                
            }
        }
        else{
            if(!rgpd){
                setNotif({
                    text: 'Veuillez accepter les CGV',
                    icon: 'close'
                })
            }
            else{
                setNotif({
                    text: 'Un ou plusieurs champ(s) manquant(s) !',
                    icon: 'close'
                })
            }
        }
    }

    return (
        <>
            <Head>
                <title>ADEME | Créer un compte</title>
            </Head>
            <div className={styles.Login}>
                <div className="boxed">
                    <div className="flex justicenter">
                        <div className={styles.Registerbox}>
                            {success ? (
                                <>
                                    <h1>Votre compte a bien été créé !</h1>
                                    <div className={styles.Box}>
                                        <div className="text-center">
                                            <span className={`material-icons ${styles.SuccessIcon}`}>rocket_launch</span>
                                            <span className={styles.Success}><strong>Félicitations, votre compte a bien été créé !</strong> Vous pouvez dès-à-présent vous connecter pour vous inscrire aux différentes rencontres disponibles.</span>
                                            <div className="mTop20">
                                                <Link className="btn__normal btn__dark" href="/connexion">Se connecter</Link>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1>Créez votre compte</h1>
                                    <div className={styles.Box}>
                                        <p>Votre compte personnel vous permet d’accéder à toutes les informations sur vos rencontres à venir (informations pratiques, ressources documentaires, prérequis, etc.) et à l’historique de vos rencontres passées.</p>
                                        <div className="flex gap20 mBot20 mTop30 toColumn">
                                            <input type="text" name="nom" onChange={handleChange} value={userDetails.nom} className="input-text wm100" placeholder="Nom*" />
                                            <input type="text" name="prenom" onChange={handleChange} value={userDetails.prenom} className="input-text wm100" placeholder="Prénom*" />
                                        </div>
                                        <div className="mBot20">
                                            <input type="mail" name="mail" onChange={handleChange} value={userDetails.mail} className="input-mail wm100" placeholder="Adresse email*" />
                                        </div>
                                        <div className="flex gap20 mBot20 toColumn">
                                            <input type="text" name="telephone" onChange={handleChange} value={userDetails.telephone} className="input-text wm100" placeholder="Numéro de téléphone" />
                                            <input type="text" name="organisation" onChange={handleChange} value={userDetails.organisation} className="input-text wm100" placeholder="Organisation*" />
                                        </div>
                                        <div className="flex gap20 mBot20 toColumn">
                                            <input type="password" name="motDePasse" onChange={handleChange} value={userDetails.motDePasse} className="input-text wm100" placeholder="Mot de passe*" />
                                            <input type="password" name="motDePasse2" onChange={handleChange} value={userDetails.motDePasse2} className="input-text wm100" placeholder="Confirmez le mot de passe*" />
                                        </div>
                                        <div className="flex gap15 mBot30">
                                        <div className="select w50">
                                                <select onChange={handleChange} name="fonction" value={userDetails.fonction} className="input-select">
                                                    <option value=''>Type de fonction</option>
                                                    <option>Chargé de mission en collectivité</option>
                                                    <option>Directeur ou chef de service en collectivité</option>
                                                    <option>Élu en collectivité</option>
                                                    <option>Conseiller Territoire Engagé Transition écologique</option>
                                                    <option>Partenaire de la région</option>
                                                </select>
                                                <span className="material-icons">expand_more</span>
                                            </div>
                                            <div className="select w50">
                                                <select onChange={handleChange} name="region" value={userDetails.region} className="input-select">
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
                                        </div>
                                        <div className="mBot30">
                                            <div className="checkbox mBot20">
                                                <input type="checkbox" name="newsletter" onChange={handleChange} value={userDetails.newsletter}  /> <span>J’accepte de recevoir des actualités de l’ADEME. Vous pourrez vous désabonner à tout moment via le lien de désinscription en bas de nos e-mails.</span>
                                            </div>
                                            <div className="checkbox">
                                                <input type="checkbox" name="rgpd" onChange={handleChange} value={userDetails.rgpd} /> <span>J’ai lu et j’accepte que l’ADEME collecte mes données afin de garantir la bonne utilisation des services offerts et reconnais avoir pris connaissance de sa politique de protection des données personnelles.</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-end gap10">
                                            <button onClick={createAccount} className="btn__normal btn__dark">
                                                Créer un compte
                                            </button>
                                        </div>
                                        <div className="alignright">
                                            <Link className="link mTop15" href="/connexion">Vous avez déjà un compte ?</Link>
                                        </div>                               
                                    </div>                                
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {notif != null && (
                <Notif datas={notif} setNotif={setNotif} />
            )}
        </>
    )
}