import Link from 'next/link'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Notif } from '@/components/Notif'
import styles from '@/styles/Login.module.css'

export default function Login(){

    const [resetPass, setResetPass] = useState(false)
    const [notif, setNotif] = useState(null)
    const [userLogin, setUserLogin] = useState({ mail: '', motDePasse: '' })
    const [lostMail, setLostMail] = useState('')
    const router = useRouter();

    // Retour du lien de réinitialisation (api/users/lib/reset-password).
    useEffect(() => {
        if (router.query.reset === 'ok') {
            setNotif({ text: 'Un nouveau mot de passe vous a été envoyé par e-mail.', icon: 'done' })
        } else if (router.query.reset === 'invalide') {
            setNotif({ text: 'Ce lien de réinitialisation est expiré ou a déjà servi.', icon: 'close' })
        }
    }, [router.query.reset])

    const handleChange = async (event) => {
        const { name, type, checked, value } = event.target
        setUserLogin(prev => {
            return {
                ...prev,
                [name]: type == 'checkbox' ? checked : value
            }
        })
    }

    const login = async () => {
        const { mail, motDePasse, isAdmin } = userLogin;
        if (mail && motDePasse) {
            // La route vérifie le mot de passe et pose le cookie de session.
            const response = await fetch(isAdmin ? '/api/accounts/lib/jwt' : '/api/users/lib/jwt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mail, motDePasse }),
            });
            const json = await response.json();
            if (json.success == true) {
                if (isAdmin) {
                    router.push('/admin');
                }
                else if (json.id != 115) {
                    router.push('/espace-personnel');
                }
                else {
                    router.push('/presence');
                }
            } else {
                setNotif({
                    text: json.error || 'Identifiant ou mot de passe invalide(s)',
                    icon: 'close'
                });
            }
        }
        else {
            setNotif({
                text: 'Veuillez remplir tous les champs !',
                icon: 'close'
            });
        }
    };

    const forgetPassword = async () => {
        if(lostMail){
            if(lostMail.includes("@") && lostMail.includes(".")){
                const fetcher = await fetch('/api/users/lib/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ mail: lostMail })
                })
                const json = await fetcher.json()
                if(json){
                    setNotif({
                        text: json.error || 'Si un compte existe pour cette adresse, un e-mail vous a été envoyé pour réinitialiser votre mot de passe.',
                        icon: json.error ? 'close' : 'done'
                    });  
                    setResetPass(false)                    
                }
            }
            else{
                setNotif({
                    text: 'Format d\'adresse e-mail incorrect.',
                    icon: 'close'
                });                   
            }
        }
        else{
            setNotif({
                text: 'Veuillez saisir votre adresse e-mail.',
                icon: 'close'
            });            
        }
    }
    

    return (
        <>
            <Head>
                <title>ADEME | Connexion</title>
            </Head>
            <div className={styles.Login}>
                <div className="boxed">
                    <div className="flex justicenter">
                        <div className={styles.Logbox}>
                            <h1>Se connecter aux rencontres</h1>
                            <div className={styles.Box}>
                                {!resetPass ? (
                                    <>
                                        <div className="mBot20">
                                            <input type="mail" name="mail" onChange={handleChange} value={userLogin.mail} className="input-mail" placeholder="Adresse e-mail..." />
                                        </div>
                                        <div className="mBot20">
                                            <input type="password" name="motDePasse" onChange={handleChange} value={userLogin.motDePasse} className="input-text" placeholder="Mot de passe" />
                                        </div>
                                        <div className="mBot20">
                                            <input 
                                                type="checkbox" 
                                                name="isAdmin" 
                                                onChange={handleChange} 
                                                checked={userLogin.isAdmin ? true : false} 
                                            />
                                            &nbsp;&nbsp;
                                            <span>Je suis administrateur ou DR</span>
                                        </div>
                                        <div className="flex flex-end toColumn mCenter gap10">
                                            <Link href="/inscription" className="btn__normal btn__light">
                                                Créer un compte
                                            </Link>
                                            <button onClick={login} className="btn__normal btn__dark">
                                                Se connecter
                                            </button>
                                        </div>
                                        <div className="alignright">
                                            <button className="link mTop15" onClick={(() => setResetPass(prev => !prev))}>Mot de passe oublié ?</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h2>Réinitialisez votre mot de passe</h2>
                                        <div className="mBot20 mTop20">
                                            <input type="mail" name="lostMail" value={lostMail} onChange={(event) => setLostMail(event.target.value)} className="input-mail" placeholder="Adresse e-mail..." />
                                        </div>
                                        <div className="flex toColumn flex-end gap10">
                                            <button onClick={(() => setResetPass(prev => !prev))} className="btn__normal btn__light">
                                                Revenir à la connexion
                                            </button>
                                            <button onClick={forgetPassword} className="btn__normal btn__dark">
                                                Valider
                                            </button>
                                        </div>
                                    </>
                                )}                                
                            </div>
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