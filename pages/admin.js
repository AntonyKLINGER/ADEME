import Head from 'next/head'
import { useState, uesEffect } from 'react'
import nextCookies from 'next-cookies';
import { verifyToken, isAdmin } from '@/utils/auth';
import Modules from '@/components/Modules'
import Comptes from '@/components/Comptes'
import Sessions from '@/components/Sessions'
import AllSessions from '@/components/AllSessions'
import Faq from '@/components/Faq'
import Avis from '@/components/Avis'
import EditEmails from '@/components/EditEmails'
import styles from '@/styles/Admin.module.css'

export async function getServerSideProps(context) {
    const { auth: token } = nextCookies(context);

    const user = verifyToken(token);
  
    if (!isAdmin(user)) {
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
                                        <li onClick={() => {setPage(3)}}><span className={page == 3 ? styles.active : undefined}>FAQ</span></li>
                                        <li onClick={() => {setPage(4)}}><span className={page == 4 ? styles.active : undefined}>Avis</span></li>
                                        <li onClick={() => {setPage(5)}}><span className={page == 5 ? styles.active : undefined}>Gestion des E-mails</span></li>
                                        {/* <li onClick={() => {setPage(1)}}><span className={page == 1 ? styles.active : undefined}>Inscriptions</span></li> */}
                                        <li onClick={logout}><span className={page == 6 ? styles.active : undefined}>Déconnexion</span></li>
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
                                        {page == 3 && (
                                            <Faq user={userInfo} page={page} setPage={setPage} />
                                        )}
                                        {page == 4 && (
                                            <Avis user={userInfo} page={page} setPage={setPage} />
                                        )}
                                        {page == 5 && (
                                            <EditEmails user={userInfo} page={page} setPage={setPage} />
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