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
            if(isAdmin){
                const test = await fetch(`/api/accounts/lib/auth/?mail=${mail}&motDePasse=${motDePasse}`);
                const json = await test.json();
                if (json.success == true) {                       
                    const jwtResponse = await fetch(`/api/accounts/lib/jwt`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id: json.account.id, mail: json.account.mail, type: json.account.type, modules: json.account.modules, regions: json.account.regions }),
                    });
                
                    const jwtJson = await jwtResponse.json();
                    if(jwtJson.success){
                        router.push('/admin');                  
                    }
                } else {
                    setNotif({
                        text: 'Identifiant ou mot de passe invalide(s)',
                        icon: 'close'
                    });
                }
            }
            else{
                const test = await fetch(`/api/users/lib/auth/?mail=${mail}&motDePasse=${motDePasse}`);
                const json = await test.json();
                if (json.success == true) {                       
                    const jwtResponse = await fetch(`/api/users/lib/jwt`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id: json.user.id, mail: json.user.mail, type: 'user' }),
                    });
                
                    const jwtJson = await jwtResponse.json();
                    if(jwtJson && json.user.id != 115){
                        router.push('/espace-personnel');                       
                    }
                    else{
                        router.push('/presence');
                    }
                    
                } else {
                    setNotif({
                        text: 'Identifiant ou mot de passe invalide(s)',
                        icon: 'close'
                    });
                }
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
                        text: 'Un e-mail avec votre nouveau mot de passe vous a été envoyé !',
                        icon: 'done'
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