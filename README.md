# Backend Node.js avec Authentification JWT

Ce projet est un backend développé avec Node.js, Express, et Prisma pour gérer une API sécurisée avec authentification JWT. Le backend utilise PostgreSQL comme base de données et est entièrement dockerisé pour faciliter le développement et le déploiement.

## Technologies Utilisées

- **Node.js** : Environnement d'exécution JavaScript côté serveur.
- **Express** : Framework web minimaliste pour Node.js.
- **Prisma** : ORM (Object-Relational Mapping) pour interagir avec la base de données PostgreSQL.
- **PostgreSQL** : Système de gestion de base de données relationnelle.
- **JWT (JSON Web Token)** : Standard pour sécuriser les API.
- **Docker** : Plateforme pour développer, expédier et exécuter des applications dans des conteneurs.
- **Nodemon** : Outil de développement qui redémarre automatiquement l'application Node.js lorsque des fichiers sont modifiés.
- **Bcrypt** : Bibliothèque pour le hachage des mots de passe.
- **ESLint** : Outil pour identifier et corriger les problèmes dans le code JavaScript/TypeScript.

## Structure du Projet

```plaintext
backend-node-docker/
│
├── src/
│   ├── controllers/       # Contient les fichiers de contrôleurs pour les différentes routes
│   ├── middlewares/       # Contient les middlewares d'authentification et autres
│   ├── prisma/            # Contient le schéma Prisma et les migrations
│   ├── routes/            # Contient les fichiers de routes
│   ├── app.js             # Fichier principal pour configurer l'application Express
│   ├── config.js          # Fichier de configuration pour les variables d'environnement
│   └── server.js          # Fichier pour démarrer le serveur
│
├── .dockerignore          # Fichiers et dossiers à ignorer par Docker
├── .eslintrc.json         # Configuration ESLint
├── .gitignore             # Fichiers et dossiers à ignorer par Git
├── Dockerfile             # Fichier Docker pour construire l'image du backend
├── docker-compose.yml     # Configuration Docker Compose pour orchestrer les conteneurs
├── package.json           # Fichier de configuration npm
└── pnpm-lock.yaml         # Fichier de verrouillage des dépendances pour pnpm
```

## Configuration et Installation

### Prérequis

- Docker et Docker Compose doivent être installés sur votre machine.
- Node.js et npm doivent être installés pour le développement local.

### Installation

1. Clonez le dépôt :

```sh
git clone https://github.com/votre-utilisateur/backend-node-docker.git
cd backend-node-docker
```

2. Créez un fichier `.env` à la racine du projet et ajoutez vos variables d'environnement :

```plaintext
DATABASE_URL=postgres://admin:testNewFeatures@db:5432/doctorwho
JWT_SECRET=your_jwt_secret
```

3. Démarrez les conteneurs Docker :

```sh
docker-compose up --build
```

### Utilisation

- L'API sera disponible sur `http://localhost:3000`.
- Utilisez un outil comme [Bruno](https://www.usebruno.com/) ou Postman pour tester les différentes routes de l'API.


## Contribuer

Les contributions sont les bienvenues ! Veuillez créer une nouvelle branche pour vos modifications et soumettre une pull request lorsque vous êtes prêt.
