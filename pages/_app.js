import Router, { useRouter } from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import Head from 'next/head'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import '@/styles/responsify-min.css'
import '@/styles/globals.css'

export default function App({ Component, pageProps }) {

  NProgress.configure({ showSpinner: false });

  Router.events.on('routeChangeStart', () => NProgress.start());
  Router.events.on('routeChangeComplete', () => NProgress.done());
  Router.events.on('routeChangeError', () => NProgress.done());

  const router = useRouter();
  const isPresencePage = router.pathname === '/presence';

  return (
    <>
      <Head>
        <link rel="icon" href="favicon.ico" />
      </Head>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet" />
      {!isPresencePage && <Header />}
      <div className="page">
        <Component {...pageProps} />
      </div>
      {!isPresencePage && <Footer />}
    </>
  )
}
