import Link from 'next/link';
import { useState, useEffect } from 'react';
import Alert from '@/components/Alert';
import { Notif } from '@/components/Notif';
import SessionBox from '@/components/SessionBox';
import Rating from '@mui/material/Rating';
import styles from '@/styles/Account.module.css';

export default function RencontreDetail({ id, registrationId, setOpen, userId, user }) {

    console.log("ID =>", registrationId)

    const [alert, setAlert] = useState(null);
    const [notif, setNotif] = useState(null);
    const [passed, setPassed] = useState(true);
    const [rating, setRating] = useState(0);
    const [commentaires, setCommentaires] = useState('');
    const [data, setData] = useState({});
    const [reviewDisabled, setReviewDisabled] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [otherInputs, setOtherInputs] = useState({});
    const [responses, setResponses] = useState({});
    const [hasResponded, setHasResponded] = useState(false);

    const [modules, setModules] = useState([])

    const getModules = async () => {
        const geter = await fetch(`/api/modules`)
        const json = await geter.json()
        setModules(json)
    }

    console.log(responses)

    useEffect(() => {
        getModules()
    }, [])

    const questions = [
        {
            id: 1,
            text: "De 1 à 5, comment évaluez-vous la qualité générale de la Rencontre ?*",
            options: [
                { value: 5, label: "5/5 - Très satisfaisant" },
                { value: 4, label: "4/5 - Satisfaisant" },
                { value: 3, label: "3/5 - Moyennement satisfaisant" },
                { value: 2, label: "2/5 - Peu satisfaisant" },
                { value: 1, label: "1/5 - Pas du tout satisfaisant" },
            ],
        },
        {
            id: 2,
            text: "De 1 à 5, comment évaluez-vous la qualité du contenu technique partagé lors de la Rencontre ?*",
            options: [
                { value: 5, label: "5/5 - Très satisfaisant" },
                { value: 4, label: "4/5 - Satisfaisant" },
                { value: 3, label: "3/5 - Moyennement satisfaisant" },
                { value: 2, label: "2/5 - Peu satisfaisant" },
                { value: 1, label: "1/5 - Pas du tout satisfaisant" },
            ],
        },
        {
            id: 3,
            text: "De 1 à 5, comment évaluez-vous la pertinence des intervenants (expertises, témoignages ...) présents à la Rencontre ?*",
            options: [
                { value: 5, label: "5/5 - Très satisfaisant" },
                { value: 4, label: "4/5 - Satisfaisant" },
                { value: 3, label: "3/5 - Moyennement satisfaisant" },
                { value: 2, label: "2/5 - Peu satisfaisant" },
                { value: 1, label: "1/5 - Pas du tout satisfaisant" },
            ],
        },
        {
            id: 4,
            text: "De 1 à 5, comment évaluez-vous la richesse des échanges avec les autres participants durant la Rencontre ?*",
            options: [
                { value: 5, label: "5/5 - Très satisfaisant" },
                { value: 4, label: "4/5 - Satisfaisant" },
                { value: 3, label: "3/5 - Moyennement satisfaisant" },
                { value: 2, label: "2/5 - Peu satisfaisant" },
                { value: 1, label: "1/5 - Pas du tout satisfaisant" },
            ],
        },
        {
            id: 5,
            text: "De 1 à 5, comment évaluez-vous la qualité de l’animation (formats participatifs, dynamisme de l’animateur, etc.) de la Rencontre ?*",
            options: [
                { value: 5, label: "5/5 - Très satisfaisant" },
                { value: 4, label: "4/5 - Satisfaisant" },
                { value: 3, label: "3/5 - Moyennement satisfaisant" },
                { value: 2, label: "2/5 - Peu satisfaisant" },
                { value: 1, label: "1/5 - Pas du tout satisfaisant" },
            ],
        },
        {
            id: 6,
            text: "De 1 à 5 comment évaluez-vous la qualité de l’organisation de la Rencontre (inscription, communication, lieu, repas, etc.) ?*",
            options: [
                { value: 5, label: "5/5 - Très satisfaisant" },
                { value: 4, label: "4/5 - Satisfaisant" },
                { value: 3, label: "3/5 - Moyennement satisfaisant" },
                { value: 2, label: "2/5 - Peu satisfaisant" },
                { value: 1, label: "1/5 - Pas du tout satisfaisant" },
            ],
        },
        {
            id: 7,
            text: "Avez-vous d’autres commentaires, suggestions ou remarques à partager concernant cette Rencontre ?*",
            type: "textarea",
        },
        {
            id: 8,
            text: "Comment avez-vous connu les Rencontres Territoire Engagé Transition Ecologique ?*",
            options: [
                { value: "Via un emailing de la Direction Régionale de l'ADEME", label: "Via un emailing de la Direction Régionale de l'ADEME" },
                { value: "Via des articles de presse", label: "Via des articles de presse" },
                { value: "Via des post sur les réseaux sociaux comme LinkedIn ou X", label: "Via des post sur les réseaux sociaux comme LinkedIn ou X" },
                { value: "Via un des partenaires de l’ADEME", label: "Via un des partenaires de l’ADEME" },
                { value: "Via un évènement (salon, forum, etc.)", label: "Via un évènement (salon, forum, etc.)" },
                { value: "Via une autre collectivité qui a déjà participé à une Rencontre", label: "Via une autre collectivité qui a déjà participé à une Rencontre" },
                { value: "autre", label: "Autre : à préciser" },
            ],
            type: 'radioWithText',
        },
        {
            id: 9,
            text: "Il existe d’autres Rencontres Territoire Engagé Transition Ecologique. Quelles sont les thématiques susceptibles de vous intéresser ? (max. 5 réponses)",
            options: modules.map(module => ({ value: module.nom, label: module.nom })),
            type: "checkbox"
        }
    ];

    const handleOptionChange = (questionId, value, checked) => {
        setOtherInputs(prevState => ({
            ...prevState,
            [questionId]: value === 'autre',
        }));
    
        if (questions.find(q => q.id === questionId).type === 'checkbox') {
            setResponses(prevState => {
                const newValues = prevState[questionId] ? [...prevState[questionId]] : [];
                if (checked) {
                    newValues.push(value);
                } else {
                    const index = newValues.indexOf(value);
                    if (index > -1) {
                        newValues.splice(index, 1);
                    }
                }
                return {
                    ...prevState,
                    [questionId]: newValues,
                };
            });
        } else {
            setResponses(prevState => ({
                ...prevState,
                [questionId]: value,
            }));
        }
    };
    

    const handleTextareaChange = (questionId, value) => {
        setResponses(prevState => ({
            ...prevState,
            [questionId]: value,
        }));
    };

    const handleOtherInputChange = (questionId, value) => {
        setResponses(prevState => ({
            ...prevState,
            [`${questionId}_autre`]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const requiredQuestions = questions;
        const unansweredQuestions = requiredQuestions.filter((q) => 
            !responses[q.id] || 
            (q.type === 'radioWithText' && responses[q.id] === 'autre' && !responses[`${q.id}_autre`]) || 
            (q.type === 'textarea' && !responses[q.id]) ||
            (q.type === 'checkbox' && (!responses[q.id] || responses[q.id].length === 0))
        );
    
        if (unansweredQuestions.length > 0) {
            setNotif({
                icon: 'warning',
                text: 'Veuillez répondre à toutes les questions obligatoires avant de soumettre.',
            });
            return;
        }
    
        const typeUser = user.type == "Administrateur" || user.type == "DR" ? "special" : "user";
    
        const response = await fetch('/api/satisfaction/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                sessionId: data.id,
                registrationId: registrationId,
                responses: responses,
                type: typeUser,
            }),
        });
    
        if (response.ok) {
            setNotif({
                icon: 'done',
                text: 'Votre réponse a été enregistrée avec succès.',
            });
            setHasResponded(true);
        } else {
            setNotif({
                icon: 'error',
                text: 'Une erreur s\'est produite. Veuillez réessayer plus tard.',
            });
        }
    };
    
    

    function formatDate(dateString) {
        if(dateString){
            const base = dateString.split('T');
            const [year, month, day] = base[0].split('-')
            return `${day}/${month}/${year}`;
        } else{
            return '---'
        }
    }    

    const getUserSession = async () => {
        const fetcher = await fetch(`/api/sessions/${id}`);
        const json = await fetcher.json();
        setData(json[0]);
    };

    const registerReview = async () => {
        setAlert(null);
        const typeUser = user.type == "Administrateur" || user.type == "DR" ? "special" : "user"
        const fetcher = await fetch('/api/reviews/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                note: rating,
                commentaire: commentaires,
                userId: userId,
                sessionId: data.id,
                type: typeUser
            }),
        });
        const json = await fetcher.json();
        if (json.id) {
            setNotif({
                text: 'Votre avis a bien été enregistré !',
                icon: 'done',
            });
            setReviewDisabled(true);
        }
    };
    
    const addReview = async () => {
        if (commentaires !== '') {
            setAlert({
                icon: 'warning',
                text: 'Une fois votre avis validé vous ne pourrez plus le modifier. Validez-vous votre avis ?',
                action: () => registerReview(),
            });
        } else {
            setNotif({
                text: "Vous n'avez pas laissé de commentaires.",
                icon: 'close',
            });
        }
    };
    
    const checkReview = async () => {
        if(user.type == "Administrateur" || user.type == "DR") {
            const fetcher = await fetch(`/api/reviews/check?userId=${userId}&sessionId=${data.id}&specialAccount=true`);
            const json = await fetcher.json();
            setReviewDisabled(true);
            if (json.length > 0) {
                setRating(json[0].note);
                setCommentaires(json[0].commentaire);
            } else {
                setReviewDisabled(false);
            }
        } else {
            const fetcher = await fetch(`/api/reviews/check?userId=${userId}&sessionId=${data.id}`);
            const json = await fetcher.json();
            setReviewDisabled(true);
            if (json.length > 0) {
                setRating(json[0].note);
                setCommentaires(json[0].commentaire);
            } else {
                setReviewDisabled(false);
            }
        }
    };

    const checkSatisfaction = async () => {
        if(user.type == "Administrateur" || user.type == "DR"){
            const fetcher = await fetch(`/api/satisfaction/checkSatisfaction?userId=${userId}&sessionId=${data.id}&specialAccount=true`);
            const json = await fetcher.json();
            setHasResponded(json.hasResponded);
        } else {
            const fetcher = await fetch(`/api/satisfaction/checkSatisfaction?userId=${userId}&sessionId=${data.id}`);
            const json = await fetcher.json();
            setHasResponded(json.hasResponded);
        }
    };

    useEffect(() => {
        getUserSession();
    }, []);

    useEffect(() => {
        if (data.id) {
            checkReview();
            checkSatisfaction();
        }
    }, [data]);

    useEffect(() => {
        if (data && data.dateDebut) {
            const now = new Date();
            const dateDebut = new Date(data.dateDebut);

            if (dateDebut > now) {
                setPassed(false);
            } else {
                setPassed(true);
            }
        }
    }, [data]);

    useEffect(() => {
        if (user) {
            if(user.type == "Administrateur" || user.type == "DR"){
                const getUserIn = async () => {
                    const fetcher = await fetch(`/api/accounts/${user.id}`);
                    const json = await fetcher.json();
                    setUserData(json[0]);
                };
                getUserIn();
            } else {
                const getUserIn = async () => {
                    const fetcher = await fetch(`/api/users/${user.id}`);
                    const json = await fetcher.json();
                    setUserData(json[0]);
                };
                getUserIn();
            }
        }
    }, [user]);

    const generateBadge = async () => {
        setLoading(true);
        const datas = {
            nom: userData.nom,
            prenom: userData.prenom,
            program: data?.metasSession?.programmeSession,
            organisation: userData.organisation,
        };

        const response = await fetch('/api/generate-badge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datas),
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = "Badge de participation.pdf";
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setLoading(false);
    };

    const tryCancel = async () => {
        setAlert({
            icon: 'warning',
            text: 'Êtes-vous sur de ne plus vouloir participer à cette rencontre ?',
            action: () => cancel(),
        });
    };

    const cancel = async () => {
        if(user.type == "Administrateur" || user.type == "DR"){
            const fetcher = await fetch('/api/registrations/cancel', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    sessionId: id,
                    type: "special"
                }),
            });
            const json = await fetcher.json();
            setOpen(null);
        } else {
            const fetcher = await fetch('/api/registrations/cancel', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    sessionId: id,
                    type: "user"
                }),
            });
            const json = await fetcher.json();
            setOpen(null);
        }
    };

    const transformLinks = (html) => {
        // Cette regex trouve les liens et capture l'URL
        const urlRegex = /<a href="(http[s]?:\/\/.*?)".*?>(.*?)<\/a>/g;
        
        return html.replace(urlRegex, (match, url, linkText) => {
          // Remplacez "Cliquez ici" par le texte que vous voulez montrer comme lien
          const clickableText = "Lien externe";
          
          // Retourne le HTML modifié avec le texte cliquable qui garde l'URL comme destination
          return `<a target="_blank" rel="noreferer noopener" href="${url}">${clickableText}</a>`;
        });
      };

    const [transformedHTML, setTransformedHTML] = useState('')

    useEffect(() => {
        if(data?.metasSession?.explications){
            setTransformedHTML(transformLinks(data?.metasSession?.explications))
        }
    }, [data])
    

    return (
        <>
            <span onClick={() => setOpen(null)} className={styles.Back}>Retour à mes rencontres</span>
            <div className="mTop20 flex aligncenter toColumn gap10">
                <button onClick={generateBadge} className="btn__normal btn__dark">Générer mon badge</button>
                <button onClick={tryCancel} className="btn__normal btn__light">Je souhaite retirer mon inscription</button>
            </div>
            <div className="w100 mTop25">
                <SessionBox
                    date={formatDate(data.dateDebut)}
                    region={data.region}
                    title={data?.module?.nom}
                    dept={data?.departement}
                    register="false"
                    see='true'
                    data={data}
                    detail="yes"
                />
            </div>
            <div className="flex alignstart gap30 mTop30">
                <div className="flex alignstart gap10 w35">
                    <div className="w7">
                        <img src="/medias/icon-lieu.png" alt="icon" className="w80" />
                    </div>
                    <div className="w80">
                        <span className={styles.dLabel}>Lieu de la rencontre :</span>
                        <span className={styles.dValue}>{data.metasSession !== undefined ? data.metasSession.lieuRencontre : 'Chargement...'}</span>
                    </div>
                </div>
                <div className="flex alignstart gap10 w20">
                    <div className="w10">
                        <img src="/medias/icon-date.png" alt="icon" className="w90" />
                    </div>
                    <div className="w80">
                        <span className={styles.dLabel}>Date :</span>
                        <span className={styles.dValue}>{data !== undefined ? formatDate(data?.dateDebut) : 'Chargement...'}</span>
                    </div>
                </div>
                <div className="flex alignstart gap10 w20">
                    <div className="w10">
                        <img src="/medias/icon-date.png" alt="icon" className="w90" />
                    </div>
                    <div className="w80">
                        <span className={styles.dLabel}>Tarif :</span>
                        <span className={styles.dValue}>{data.module !== undefined ? data.module.metasModule.tarif : 'Chargement...'}</span>
                    </div>
                </div>
            </div>
            <span className={styles.Subtitle}>En savoir plus sur ce module :</span>
            <p>{data.module !== undefined ? data.module.description : 'Chargement...'}</p>
            
            {(data?.metasSession?.urlsPDF.length > 0 || data?.metasSession?.explications) ? (
                <div className="mBot20">
                    <span className={styles.Subtitle}>Ressources :</span>
                    <div className={styles.Align}>
                        {data?.metasSession?.explications && (
                            <div dangerouslySetInnerHTML={{ __html: data.metasSession.explications }}></div>
                        )}
                    </div>
                    {data?.metasSession?.urlsPDF.length > 0 && (
                        <ul className={styles.Ressources}>
                            {data?.metasSession?.urlsPDF.map((item, index) => (
                                <li key={index}><Link target="_blank" href={item.url}>{item.nom}</Link></li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <div>
                    <span className={styles.Subtitle}>Ressources :</span>
                    <span className="block mTop20">Pas de ressources disponibles.</span>
                    {data?.metasSession?.mail_referent != null && data.metasSession.mail_referent !== undefined && (
                        <>
                            <span className={styles.Subtitle}>Contact du référent :</span>
                            <span className="block mTop20">{data.metasSession.mail_referent}</span>
                        </>
                    )}
                </div>
            )}
            {passed && !hasResponded && (
                <>
                    {/* <span className={styles.Subtitle}>Donnez votre avis sur la rencontre :</span>
                    <div className="mTop15">
                        <Rating
                            name="simple-controlled"
                            value={rating}
                            size="small"
                            onChange={(event, newValue) => {
                                setRating(newValue);
                            }}
                        />
                    </div>
                    <textarea disabled={reviewDisabled} name="commentaires" value={commentaires} onChange={(event) => setCommentaires(event.target.value)} className="textarea mTop15"></textarea>
                    {!reviewDisabled && (
                        <div className='mTop20 flex alignright'>
                            <button onClick={addReview} className="btn__normal btn__dark">Valider mon avis</button>
                        </div>
                    )} */}

                    <span className={styles.Subtitle}>Nous vous remercions de prendre 5 minutes pour répondre à ce questionnaire de satisfaction. Vos réponses permettront d’améliorer l’offre des Rencontres Territoire Engagé Transition Ecologique de l’ADEME.</span>
                    <form onSubmit={handleSubmit}>
                        {questions.map((question) => (
                            <div key={question.id}>
                                <span className={styles.askTitle}>{question.id}) {question.text}</span>
                                {question.type === "textarea" ? (
                                    <p className={styles.asker}>
                                        <textarea
                                            name={`question_${question.id}`}
                                            id={`question_${question.id}`}
                                            rows="4"
                                            cols="50"
                                            value={responses[question.id] || ''}
                                            className={styles.textareaF}
                                            onChange={(e) => handleTextareaChange(question.id, e.target.value)}
                                        ></textarea>
                                    </p>
                                ) : (
                                    question.type === "checkbox" ? (
                                        question.options.map((option, index) => (
                                            <div key={index}>
                                                <p className={styles.asker}>
                                                    <input
                                                        type="checkbox"
                                                        name={`question_${question.id}`}
                                                        id={`question_${question.id}_${option.value}`}
                                                        value={option.value}
                                                        checked={(responses[question.id] || []).includes(option.value)}
                                                        onChange={(e) => handleOptionChange(question.id, option.value, e.target.checked)}
                                                    />
                                                    <label htmlFor={`question_${question.id}_${option.value}`}>{option.label}</label>
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        question.options.map((option, index) => (
                                            <div key={index}>
                                                <p className={styles.asker}>
                                                    <input
                                                        type="radio"
                                                        name={`question_${question.id}`}
                                                        id={`question_${question.id}_${option.value}`}
                                                        value={option.value}
                                                        onChange={() => handleOptionChange(question.id, option.value)}
                                                    />
                                                    <label htmlFor={`question_${question.id}_${option.value}`}>{option.label}</label>
                                                </p>
                                                {option.value === 'autre' && otherInputs[question.id] && (
                                                    <p className={styles.asker}>
                                                        <input
                                                            type="text"
                                                            name={`question_${question.id}_autre`}
                                                            id={`question_${question.id}_autre`}
                                                            placeholder="Veuillez préciser"
                                                            value={responses[`${question.id}_autre`] || ''}
                                                            className={styles.textF}
                                                            onChange={(e) => handleOtherInputChange(question.id, e.target.value)}
                                                        />
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        ))}
                        <button className="btn__normal btn__dark mBot20 mTop10" type="submit">Soumettre</button>
                    </form>

                </>
            )}
            {hasResponded && (
                <div className="mTop30 mBot20">
                    <span className={styles.Subtitle}>Merci pour votre participation.</span>
                </div>
            )}
            {alert != null && (
                <Alert datas={alert} setAlert={setAlert} />
            )}
            {notif != null && (
                <Notif datas={notif} setNotif={setNotif} />
            )}
            {loading && (
                <div className={styles.Loading}>
                    <img src="/medias/loading.gif" alt="loading" />
                </div>
            )}
        </>
    );
}
