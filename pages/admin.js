import Head from 'next/head'
import { useState, uesEffect } from 'react'
import nextCookies from 'next-cookies';
import { verifyToken } from '@/utils/auth';
import Modules from '@/components/Modules'
import Comptes from '@/components/Comptes'
import Sessions from '@/components/Sessions'
import AllSessions from '@/components/AllSessions'
import styles from '@/styles/Admin.module.css'

export async function getServerSideProps(context) {
    const { auth: token } = nextCookies(context);

    const user = verifyToken(token);
  
    if (!user || (user.id != 10 && user.type != 'Administrateur' && user.type != 'DR')) {
      return {
        redirect: {
          destination: '/connexion',
          permanent: false,
        },
      };
    }

    return { props: { user } };
}

export default function Admin({ user }){

    console.log('User in Admin component:', user);
    const [page, setPage] = useState(0)
    const [userInfo, setUserInfo] = useState(user)

    const logout = async () => {
        const unlog = await fetch('/api/logout')
        window.location.href = "/"
    }

    return (
        <>
            <div className={styles.Account}>
                <Head>
                    <title>ADEME | Tableau de bord</title>
                </Head>
                <div className="section blued">
                    <div className="boxed">
                        <h1>Tableau de bord</h1>
                        <div className={styles.Box}>
                            <div className="flex gap50">
                                <div className={`w20 ${styles.Sidebar}`}>
                                    <ul>
                                        <li onClick={() => {setPage(0)}}><span className={page == 0 ? styles.active : undefined}>Voir les modules</span></li>
                                        <li onClick={() => {setPage(2)}}><span className={page == 2 ? styles.active : undefined}>Voir les sessions</span></li>
                                        <li onClick={() => {setPage(1)}}><span className={page == 1 ? styles.active : undefined}>Comptes</span></li>
                                        {/* <li onClick={() => {setPage(1)}}><span className={page == 1 ? styles.active : undefined}>Inscriptions</span></li> */}
                                        <li onClick={logout}><span className={page == 3 ? styles.active : undefined}>Déconnexion</span></li>
                                    </ul>
                                </div>
                                <div className="w80">
                                    <div className={styles.Dash}>
                                        {page == 0 && (
                                            <Modules user={userInfo} setPage={setPage} />
                                        )}
                                        {page == 1 && (
                                            <Comptes user={userInfo} />
                                        )}
                                        {page == 2 && (
                                            <AllSessions user={userInfo} page={page} setPage={setPage} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}