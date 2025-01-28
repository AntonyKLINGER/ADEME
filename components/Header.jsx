import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '@/styles/Header.module.css'

export default function Header(){

    const [user, setUser] = useState(null);
    const router = useRouter()
    const [activeMenu, setActiveMenu] = useState(true)

    useEffect(() => {
        fetch('/api/auth')
          .then((res) => res.json())
          .then((data) => {
            console.log(data)
            if (data.isAuthenticated) {
              setUser(data.user);
            } else {
              setUser(null);
            }
          });
    }, [router.asPath]);

    return (
        <>
            <div className={styles.Header}>
                <div className="boxed">
                    <div className="flex aligncenter space-between">
                        <div className="flex gap20 aligncenter">
                            <div className={styles.Logo}>
                                <img src="/republique-fr.png" className={styles.Logo} />
                            </div>     
                            <div className={styles.Logo}>
                                <img src="/logo-ademe.png" className={styles.Logo} />
                            </div>      
                            <div className={styles.Logo}>
                                <img src="/rencontres-logo.webp" className={styles.Logo} />
                            </div>                          
                        </div>
                        <div className={`${styles.Menu} ${activeMenu ? undefined : styles.ActiveMenu}`}>
                            <ul>
                                <li onClick={() => setActiveMenu(prev => !prev)}><Link href="/">Accueil</Link></li>
                                <li onClick={() => setActiveMenu(prev => !prev)}><Link href="/rencontres">Les Rencontres</Link></li>
                                {user?.id ? (
                                    <>
                                        {(user.id == 10 || user.type == 'Administrateur' || user.type == 'DR') ? (
                                            <>
                                                <li onClick={() => setActiveMenu(prev => !prev)} className={styles.pf}><Link href="/admin">Administration</Link></li>
                                                <li onClick={() => setActiveMenu(prev => !prev)} className={styles.pf}><Link href="/espace-personnel">Espace personnel</Link></li>
                                            </>
                                        ) : (
                                            <li onClick={() => setActiveMenu(prev => !prev)} className={styles.pf}><Link href="/espace-personnel">Espace personnel</Link></li>
                                        )}
                                    </>                                    
                                ) : (
                                    <>
                                        <li onClick={() => setActiveMenu(prev => !prev)} className={styles.pf}><Link className={`${styles.LinkFunction} ${styles.Login}`} href="/connexion">Se connecter</Link></li>
                                        <li onClick={() => setActiveMenu(prev => !prev)}><Link className={`${styles.LinkFunction} ${styles.Create}`} href="/inscription">Créer un compte</Link></li>
                                    </>
                                )}

                            </ul>
                            <button onClick={() => setActiveMenu(prev => !prev)} className={styles.MobileExit}>Fermer<span className="material-icons">close</span></button>
                        </div>
                    </div>
                    <button onClick={() => setActiveMenu(prev => !prev)} className={styles.MenuToggle}>
                        <span className="material-icons">menu</span>
                    </button>
                </div>
            </div>
        </>
    )
}