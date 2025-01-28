import Link from 'next/link'
import styles from '@/styles/SessionBox.module.css'

export default function SessionBox({date, region, title, link, data, register, dept, see, detail, displayDept}){

    function formatDate(dateString) {
        if(dateString){
            const base = dateString.split('T');
            const [year, month, day] = base[0].split('-')
            return `${day}/${month}/${year}`;
        } else{
            return '---'
        }
    }    

    return (
        <>
            <div className={styles.SessionBox}>
                <div className="flex aligncenter space-between">
                    <span className={styles.Date}>{date}</span>
                    <span className={styles.Region}>{displayDept != "no" ? dept && `${dept} - ` : ''}{region}</span>
                </div>
                <div className="flex alignend gap40 mTop20">
                    <div className="w70">
                        <span className={styles.Title}>{title}</span>
                    </div>
                    {(register != 'false' && register != 'true') && (
                    <div className="w30">
                        <Link className={styles.Register} href={link}>S'inscrire</Link>
                    </div>
                    )}
                    {(see == 'true' && detail != "yes") && (
                        <div className="w30 text-right">
                            <button className={styles.Register}>Voir plus</button>
                        </div>
                    )}
                    {detail == "yes" && (
                        <div className="w30 text-right">
                            <Link className={styles.Register} href={`/rencontres/${data?.module?.slug}/session-${formatDate(data?.dateDebut).replaceAll('/', '-')}-${data?.region?.normalize("NFD")
                                        .replace(/[\u0300-\u036f]/g, "")
                                        .replace(/[.,]/g, "")
                                        .replace(/\s+/g, '-')
                                        .toLowerCase()}`}>Voir plus</Link>
                        </div>                        
                    )}
                </div>
            </div>
        </>
    )
}