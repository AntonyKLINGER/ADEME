# Migration de rencontres-tete : Supabase + Koyeb → Scaleway (infra mutualisée de quartet)

## Contexte

rencontres-tete tourne sur Koyeb, avec sa base Postgres et son bucket de fichiers sur Supabase Cloud. TET (dépôt `../quartet`) a migré vers Scaleway : une VM Coolify par tier, Postgres managé, Object Storage, le tout en Terraform dans `quartet/infra/`. On y mutualise rencontres.

Ce que l'app utilise réellement de Supabase est mince :

| Brique | Usage actuel | Travail |
|---|---|---|
| **Auth** | Aucune dépendance à Supabase Auth : JWT maison (`utils/session.js`, `utils/auth.js`) et hash bcrypt dans les tables `User` / `Account` | Rien à migrer. Garder le même `JWT_SECRET` : les sessions et les mots de passe survivent |
| **Base** | Postgres Supabase via Prisma (`DATABASE_URL`), schéma `public` uniquement | Dump/restore vers le Postgres managé de prod, changer `DATABASE_URL` |
| **Bucket** | `supabase-js` dans 2 routes seulement (`pages/api/upload.js`, `pages/api/uploadVisuel.js`), bucket public `ademe`, dossier `uploads/` | Bucket Scaleway + client S3, copie des fichiers, réécriture des URL stockées en base |
| **Hébergement** | Koyeb | Déjà traité par la PR quartet #5795 (ouverte) : app Git Coolify sur `tet-prod-apps`, base et Storage laissés sur Supabase |
| **Emails** | SMTP Brevo | Conservé. Un seul point : le port (voir étape 1) |
| **Cron** | `lib/cron.js` dans le process Node | Rien, piloté par `CRON_ENABLED` |

Décisions prises : infra mutualisée avec quartet, Brevo conservé, bascule de la base pendant une courte fenêtre de maintenance (pas de réplication).

Trois bascules indépendantes, dans cet ordre, chacune réversible séparément : hébergement, puis fichiers, puis base.

## Étape 1 — Hébergement : finir la PR quartet #5795

Rien à concevoir, la procédure est dans `quartet/infra/README.md` § « Applications Git ». Un prérequis manque côté app :

- **Port SMTP** : les 9 routes `pages/api/emails/*.js` ouvrent `smtp-relay.brevo.com:587`. Scaleway bloque par défaut les ports 25/465/587 en sortie des Instances. Passer à `port: 2525` (accepté par Brevo, fonctionne aussi sur Koyeb), sauf si le déblocage a déjà été obtenu sur le projet `tet-prod` — à vérifier d'abord avec un `nc -vz smtp-relay.brevo.com 587` depuis `tet-prod-apps`.

Puis la séquence du README : merge de #5795 et apply, test `curl --resolve`, DNS Cloudflare (CNAME Koyeb → A vers le serveur), domaine en `https://`, `CRON_ENABLED=true`, Koyeb en pause.

## Étape 2 — Fichiers : bucket Supabase → Object Storage Scaleway

### Infra (dépôt quartet)

Les permissions IAM Object Storage de Scaleway valent pour un projet entier, pas pour un bucket. Une clé créée dans `tet-prod` atteindrait donc aussi le bucket des fichiers de TET. Le bucket de rencontres vit dans **son propre projet Scaleway, `tet-rencontres`**, qui ne contient rien d'autre : c'est le modèle déjà appliqué à `tet-backups` (`infra/platform/main.tf`, README § « Prérequis admin »).

Prérequis admin (droits d'organisation, hors Terraform, comme pour `tet-coolify-backups`) :

1. Créer le projet `tet-rencontres`.
2. Donner aux opérateurs Terraform `ObjectStorageFullAccess` limité à ce projet.
3. Créer l'application IAM `tet-rencontres-storage` avec une politique limitée à `tet-rencontres` : `ObjectStorageObjectsRead` et `ObjectStorageObjectsWrite` uniquement. Pas de `ObjectsDelete` (l'app ne supprime jamais de fichier) ni de `BucketsWrite` (la clé ne touche pas à la configuration du bucket).
4. Créer sa clé d'API avec `tet-rencontres` comme **projet par défaut** (l'API S3 résout les buckets dans le projet par défaut de la clé), puis la déposer avec `infra/scripts/coolify-env-secret-set.sh prod rencontres-s3-access-key-id` / `rencontres-s3-secret-access-key`.

Terraform, nouveau fichier `infra/prod/rencontres.tf` :

- variable `rencontres_project_id` (même validation UUID que `backups_project_id`) ;
- `scaleway_object_bucket` `tet-prod-rencontres` avec `project_id = var.rencontres_project_id` (privé, `prevent_destroy`) : le listing reste fermé, la lecture publique est portée par l'ACL de chaque objet.

Résultat : une clé de rencontres compromise ne peut que lire et écrire des objets dans ce seul bucket. Elle ne voit ni les fichiers de TET, ni `tet-tfstate`, ni les backups.

`infra/coolify/env-manifest.tf`, bloc `rencontres` :

- retirer `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_KEY` ;
- ajouter `S3_BUCKET = { value = "tet-prod-rencontres" }`, `S3_ACCESS_KEY_ID` et `S3_SECRET_ACCESS_KEY` en secrets.

### Code (ce dépôt)

- `package.json` : `@supabase/supabase-js` remplacé par `@aws-sdk/client-s3`.
- Nouveau `lib/storage.js` (une quinzaine de lignes) : un `S3Client` (endpoint `https://s3.fr-par.scw.cloud`, région `fr-par`) et une fonction `uploadPublic(key, buffer, contentType)` qui fait un `PutObject` avec `ACL: 'public-read'` et renvoie `https://<bucket>.s3.fr-par.scw.cloud/<key>`.
- `pages/api/upload.js` et `pages/api/uploadVisuel.js` : les trois appels Supabase (`list`, `upload`, `getPublicUrl`) deviennent un appel à `uploadPublic`. La vérification d'existence par `list` disparaît : la clé est toujours préfixée par `Date.now()_`, donc jamais de collision ni d'écrasement. Le format de réponse `{ urlsPDF: [{ nom, url }] }` ne change pas, les composants `AddSession`, `EditSession`, `AddModule` ne sont pas touchés.
- Au passage, retirer l'URL Supabase codée en dur et le `env1` renvoyé par `upload.js`.

### Données

1. Copie, clés conservées à l'identique (`uploads/<fichier>`) :
   `rclone sync supa:ademe scw:tet-prod-rencontres --s3-acl public-read`, où `supa` est l'endpoint S3 du projet Supabase (clés « S3 access keys » du dashboard) et `scw` utilise les credentials de l'opérateur, pas la clé de l'app.
2. Déployer le code et les variables (push des envs puis redéploiement Coolify).
3. Repasser le même `rclone sync` pour le delta.
4. Réécrire les URL stockées en base (elles partent avec le dump de l'étape 3) — préfixe `https://eazuwwpllqueujyivlce.supabase.co/storage/v1/object/public/ademe/` → `https://tet-prod-rencontres.s3.fr-par.scw.cloud/` :
   - `"Module".visuel` (texte) ;
   - `"MetasSession"."urlsPDF"` et `"urlsPDFAval"` (jsonb : `replace(col::text, …)::jsonb`).
   Avant et après, compter les lignes contenant `supabase.co` dans toutes les colonnes texte/json (contenus Quill, FAQ, emails éditables) pour ne rien oublier.

Aucune coupure : seuls les admins téléversent, il suffit de les prévenir pendant les étapes 2 à 4. Les anciennes URL Supabase restent valides tant que le projet existe.

## Étape 3 — Base : Postgres Supabase → Postgres managé `tet-prod-pg`

### Infra (dépôt quartet)

Dans `infra/prod/rencontres.tf` : une base et un rôle dédiés sur l'instance existante (`module.postgres` de `infra/prod/main.tf`), sur le modèle des rôles `supabase_auth_admin` du même fichier.

- `scaleway_rdb_database` `rencontres`, `random_password` (mêmes `override_special` que le module, pour tenir dans une URL), `scaleway_rdb_user` `rencontres`, `scaleway_rdb_privilege` `all` sur cette base uniquement.
- Secret dérivé `rencontres-database-url` ajouté à `local.coolify_env_secrets` de `infra/prod/coolify-env-secrets.tf` :
  `postgres://rencontres:<mdp>@<ip privée>:<port>/rencontres?sslmode=require&connection_limit=5`
  - `sslmode=require` : Prisma chiffre sans vérifier le certificat, ce qui convient au certificat auto-signé de RDB sur le réseau privé ;
  - `connection_limit=5` : l'instance est partagée avec TET ;
  - retirer les paramètres Supabase de l'ancienne URL (`pgbouncer=true`, port 6543).
- `DATABASE_URL` du manifeste pointe déjà sur ce nom de secret : seule sa valeur change, saisie à la main aujourd'hui, dérivée de Terraform ensuite.

### Code

Aucun. `prisma/schema.prisma` reste tel quel. Ne pas lancer `prisma migrate deploy` : les migrations du dépôt s'arrêtent en février 2024 et le schéma a évolué depuis directement en base. Le dump fait foi, table `_prisma_migrations` comprise.

### Répétition (sans coupure, quelques jours avant)

1. `select version()` sur Supabase. La cible est en PostgreSQL 15 : utiliser un `pg_dump` au moins aussi récent que la source.
2. Ouvrir l'endpoint public : son IP dans `pg_allowed_ips` (`infra/prod/terraform.tfvars`), apply.
3. Dump par la connexion directe Supabase (port 5432, pas le pooler) :
   `pg_dump -Fc --schema=public --no-owner --no-acl -f rencontres.dump`
4. Restauration **avec le rôle `rencontres`**, pour qu'il soit propriétaire des tables et ne soit pas bloqué par la RLS activée côté Supabase (au moins sur `Satisfaction`) :
   `pg_restore --no-owner --no-acl -d rencontres rencontres.dump`, avec `PGSSLMODE=require` et les variables libpq plutôt qu'une URI, comme `infra/scripts/restore-db.sh`.
   Erreurs attendues et sans effet : `schema "public" already exists`, policies RLS visant les rôles `anon` / `authenticated`, `transaction_timeout` si `pg_restore` ≥ 17.
5. Contrôles : nombre de lignes par table identique des deux côtés ; `max(id)` cohérent avec chaque séquence ; l'app lancée en local contre cette base (connexion, liste des sessions, une inscription).
6. Vider la base de test (`drop schema public cascade; create schema public;`) pour repartir propre le jour J.

### Bascule (fenêtre d'environ 30 min)

1. Arrêter l'application dans Coolify : plus aucune écriture, et le cron ne tourne plus.
2. Dump frais, restauration, contrôles de l'étape 5.
3. `terraform apply` de `infra/prod` (secret `rencontres-database-url`), incrémenter `coolify_env_revision`, apply de `infra/coolify`, redéployer (`infra/scripts/coolify-deploy.sh`, `APP_ID=prod/rencontres`).
4. Tests de fumée (voir Vérification).
5. Vider `pg_allowed_ips` et apply.

Retour arrière : remettre l'ancienne valeur du secret et redéployer. Sans perte tant que personne n'a écrit sur la nouvelle base ; sinon les écritures faites entre-temps sont à rejouer à la main.

## Étape 4 — Nettoyage

- Mettre en pause le projet Supabase, le garder 14 jours (même délai que TET), puis le supprimer. Supprimer le service Koyeb.
- Supprimer les secrets `rencontres-supabase-key` de Secret Manager.
- Mettre à jour les commentaires de `git-applications.tf` et `env-manifest.tf` (« Base et Storage restent sur Supabase Cloud ») et le README de ce dépôt (variables d'environnement).
- Sauvegardes : la base est couverte par les backups automatiques de l'instance RDB (30 jours en prod). Le dump logique nocturne de TET ne couvre que la base `tet` ; à étendre seulement si un besoin de restauration fine apparaît.

## Points d'attention

- **Dépendance à quartet** : la base atterrit sur `tet-prod-pg`, dont TET prod n'est pas encore l'occupant en production (`is_ha_cluster = false`, CD encore sur `preprod-scaleway`). La restauration de TET ne touche que la base `tet`, mais toute recréation de l'instance emporterait `rencontres` : à garder en tête lors de la bascule de TET.
- **Écritures sur disque local** : `pages/api/modules/add.js` et `update.js` écrivent encore dans `public/uploads` (disque éphémère, sur Koyeb comme sur Coolify). Vérifier en base s'il existe des `Module.visuel` commençant par `/uploads/` : ils sont déjà cassés aujourd'hui. Hors périmètre, à traiter à part si c'est le cas.

## Fichiers touchés

Ce dépôt :
- `lib/storage.js` (nouveau)
- `pages/api/upload.js`, `pages/api/uploadVisuel.js`
- `pages/api/emails/*.js` (port SMTP, 9 fichiers)
- `package.json`, `package-lock.json`, `README.md`

Dépôt quartet :
- `infra/prod/rencontres.tf` (nouveau), `infra/prod/variables.tf`, `infra/prod/coolify-env-secrets.tf`
- `infra/README.md` (§ « Prérequis admin » : projet `tet-rencontres` et son application IAM)
- `infra/coolify/env-manifest.tf`, `infra/coolify/git-applications.tf` (commentaires)

## Vérification

- **Stockage, en local avant déploiement** : variables `S3_*` d'un bucket de test, `npm run dev`, téléverser un PDF sur une session et un visuel sur un module depuis `/admin`, ouvrir l'URL renvoyée dans un onglet privé (lecture publique), vérifier que `https://<bucket>.s3.fr-par.scw.cloud/` seul refuse le listing.
- **Périmètre de la clé** : avec la clé de l'app, `aws s3 ls s3://tet-prod-rencontres` et un `PutObject` avec `--acl public-read` passent (si l'ACL est refusée avec `ObjectsWrite` seul, c'est ici qu'on le voit) ; un `ls` sur le bucket de fichiers de TET et un `rm` sur un objet de rencontres sont refusés.
- **Après la copie** : `rclone check supa:ademe scw:tet-prod-rencontres` ; ouvrir une session ancienne sur le site et télécharger ses PDF ; plus aucune occurrence de `supabase.co` en base.
- **Après la bascule de la base** : connexion avec un compte participant existant et un compte admin existant (hash bcrypt et `JWT_SECRET` inchangés) ; une inscription à une session ; `GET /api/cron/status` (tâches planifiées, `enabled: true`) ; « mot de passe oublié » pour valider l'envoi Brevo depuis Scaleway ; logs `{env="production", service="rencontres"}` dans le Cockpit `tet-prod`.
