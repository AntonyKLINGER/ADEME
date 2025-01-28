import { useState, useEffect } from 'react';
import nextCookies from 'next-cookies';
import { verifyToken } from '@/utils/auth';
import styles from '@/styles/Presence.module.css';

export async function getServerSideProps(context) {
    const { auth: token } = nextCookies(context);
    const user = verifyToken(token);
  
    if (!user && user != 115) {
      return {
        redirect: {
          destination: '/connexion',
          permanent: false,
        },
      };
    }
  
    return { props: { user } };
}

export default function Presence() {
  const [sessions, setSessions] = useState([]);
  const [fiche, setFiche] = useState(0);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const openFiche = async (id_session) => {
    const geter = await fetch(`/api/registrations/bySession?sessionId=${id_session}`);
    const json = await geter.json();
    setUsers(json.sort((a, b) => a.nom.localeCompare(b.nom)));
    setFiche(id_session);
  };

  const back = () => {
    setUsers([]);
    setFiche(0);
  };

  const updatePresence = async (id, sessionId, isPresent, idType) => {
    const response = await fetch(`/api/registrations/updatePresence`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        [idType]: id, // Envoyer soit userId soit accountId
        sessionId,
        presence: isPresent,
      }),
    });

    if (!response.ok) {
      console.error('Failed to update presence');
    }
  };

  const handleCheckboxChange = (id, sessionId, idType, event) => {
    const isPresent = event.target.checked;
    updatePresence(id, sessionId, isPresent, idType); // Passer le type d'ID
  };

  useEffect(() => {
    const getSessions = async () => {
      const geter = await fetch(`/api/sessions`);
      const json = await geter.json();
      
      // Filter sessions
      const today = new Date();
      const minDate = new Date(today);
      minDate.setDate(today.getDate() - 2);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 6);

      const filteredSessions = json.filter(session => {
        const sessionDate = new Date(session.dateDebut);
        return sessionDate >= minDate && sessionDate <= maxDate;
      });

      setSessions(filteredSessions);
    };
    getSessions();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter((user) => 
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.all}>
      <div className={styles.pres}>
        <h1>Sélectionnez une session</h1>
        {fiche == 0 && (
        <div className="mTop20">
        {sessions.length > 0 ? (
          <>
            {sessions.map((session, i) => (
                <div key={i} className={styles.session}>
                    <div className="flex toColumn aligncenter space-between">
                    <span className={styles.date}>{formatDate(session.dateDebut)}</span>
                    <span className={styles.region}>{session.departement} {session.region}</span>
                    </div>
                    <div className="flex align-end toColumn space-between mCenter">
                    <div className="w60 wm100">
                        <span className={styles.module}>Module :</span>
                        <span className={styles.nom}>{session.module.nom}</span>
                    </div>
                    <button className="mTop15" onClick={() => openFiche(session.id)}>Accéder à la fiche de présence</button>
                    </div>
                </div>
                ))}
            </>
            ) : (
            <span>Pas de sessions en cours.</span>
            )}
        </div>
        )}
        {fiche != 0 && (
            <div className="mTop20">
                <button onClick={back} className={styles.back}>Revenir aux sessions</button>
                <input
                  type="text"
                  placeholder="Rechercher une personne"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={styles.search}
                />
                {filteredUsers.length > 0 ? (
                    <>
                        {filteredUsers.map((u, i) => {
                            const idType = u.userId ? 'userId' : 'accountId'; // Identifier le type d'ID
                            const id = u.userId || u.accountId; // Récupérer l'ID correct
                            return (
                                <div key={i} className={styles.user}>
                                    <div className="w80 flex aligncenter">
                                        <span className={styles.nom}>{u.nom}</span>
                                        <span className={styles.nom}>{u.prenom}</span>
                                    </div>
                                    <input
                                      type="checkbox"
                                      name="participe"
                                      defaultChecked={u.presence}
                                      onChange={(e) => handleCheckboxChange(id, fiche, idType, e)} // Passer l'ID et le type d'ID
                                    />
                                </div>
                            );
                        })}
                    </>
                ) : (
                    <span>Pas de participants.</span>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
