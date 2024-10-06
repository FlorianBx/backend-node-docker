# 🔐 Projet Express avec Authentification JWT et Refresh Token

1. Introduction
Ce projet est une application Express qui implémente un système d'authentification robuste utilisant JWT (JSON Web Tokens) avec un mécanisme de refresh token. Il est conçu pour fournir une base solide pour la création d'applications web sécurisées.
2. Configuration Docker
Le projet utilise Docker pour faciliter le déploiement et assurer la cohérence de l'environnement.
Dockerfile
dockerfileCopyFROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
docker-compose.yml
yamlCopyversion: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/mydb
    depends_on:
      - db
  db:
    image: postgres:13
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
Pour démarrer l'application :
Copydocker-compose up --build
Pour l'arrêter :
Copydocker-compose down
3. Architecture du projet
Le projet est structuré comme suit :
Copyproject-root/
│
├── controllers/
│   ├── authController.js
│   └── userController.js
│
├── middlewares/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── refreshTokenMiddleware.js
│
├── routes/
│   ├── routes.js
│   └── tests/
│       └── testRoutes.js
│
├── services/
│   └── authService.js
│
├── app.js
├── config.js
├── server.js
└── schema.prisma

## 4. L'aventure de Marye : Un voyage à travers notre système d'authentification

Suivons Marye, une nouvelle utilisatrice, dans son périple à travers notre application. Son voyage nous montrera concrètement comment fonctionne notre système d'authentification.

### 🚪 Étape 1 : Marye tente d'accéder à une zone réservée

Marye, curieuse, essaie d'accéder à la liste des utilisateurs sans être connectée :

```
GET /api/auth/users
```

🛑 Oups ! Le serveur répond :

```json
{
  "error": "Authentication required"
}
```

### 📝 Étape 2 : Marye s'inscrit

Marye comprend qu'elle doit créer un compte. Elle envoie :

```
POST /api/auth/register
{
  "email": "marye@example.com",
  "password": "secret123"
}
```

✅ Le serveur répond :

```json
{
  "message": "User registered successfully"
}
```

En coulisses, voici ce qui se passe dans `authController.js` :

```javascript
const hashedPassword = await authService.hashPassword(password);
const user = await prisma.user.create({
  data: { email, password: hashedPassword },
});
```

### 🔑 Étape 3 : Marye se connecte

Marye utilise ses nouveaux identifiants :

```
POST /api/auth/login
{
  "email": "marye@example.com",
  "password": "secret123"
}
```

🎉 Le serveur répond :

```json
{
  "message": "Logged in successfully",
  "user": {
    "id": 1,
    "email": "marye@example.com"
  }
}
```

Le serveur envoie également deux cookies : `accessToken` et `refreshToken`.

Dans `authController.js`, voici ce qui se passe :

```javascript
const accessToken = authService.generateToken(user.id, JWT_SECRET, '15m');
const refreshToken = authService.generateToken(user.id, JWT_REFRESH_SECRET, '7d');

res.cookie('accessToken', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
});

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

### 👀 Étape 4 : Marye accède enfin à la liste des utilisateurs

Marye réessaie d'accéder à la liste des utilisateurs, cette fois avec ses cookies :

```
GET /api/auth/users
Cookie: accessToken=...; refreshToken=...
```

✨ Le serveur répond avec la liste des utilisateurs :

```json
[
  {
    "id": 1,
    "email": "marye@example.com"
  },
  {
    "id": 2,
    "email": "bob@example.com"
  }
]
```

Le middleware `authenticateAndRefreshToken` vérifie le token :

```javascript
const decoded = jwt.verify(accessToken, JWT_SECRET);
req.user = decoded;
// Si tout est OK, la requête continue
```

### ⏳ Étape 5 : Le temps passe, l'accessToken expire

15 minutes plus tard, Marye essaie à nouveau d'accéder à la liste :

```
GET /api/auth/users
Cookie: accessToken=expired...; refreshToken=...
```

🔄 Le serveur détecte que l'`accessToken` est expiré, mais le `refreshToken` est valide. Il génère automatiquement un nouvel `accessToken` :

```javascript
const newAccessToken = jwt.sign(
  { userId: user.id },
  JWT_SECRET,
  { expiresIn: '15m' }
);

res.cookie('accessToken', newAccessToken, { ... });
```

Marye reçoit la liste des utilisateurs sans avoir à se reconnecter !

### 🚪 Étape 6 : Marye se déconnecte

Après une journée bien remplie, Marye décide de se déconnecter :

```
POST /api/auth/logout
Cookie: accessToken=...; refreshToken=...
```

👋 Le serveur répond :

```json
{
  "message": "Logged out successfully"
}
```

En coulisses, le serveur supprime le `refreshToken` de la base de données et efface les cookies.

## 5. Système de Refresh Token : Les coulisses

Le système de refresh token que Marye a expérimenté fonctionne ainsi :

1. Quand l'`accessToken` expire, le client utilise automatiquement le `refreshToken`.
2. Le middleware `tokenRefreshMiddleware` intercepte les requêtes :
   - Si l'`accessToken` est invalide mais le `refreshToken` valide, un nouveau `accessToken` est généré.
   - Le nouveau token est envoyé via un cookie HTTP-only.

Extrait de `refreshTokenMiddleware.js` :

```javascript
const newAccessToken = jwt.sign(
  { userId: user.id, role: user.role },
  JWT_SECRET,
  { expiresIn: '15m' }
);

res.cookie('accessToken', newAccessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
});
```

Cette approche offre plusieurs avantages :
- 🔒 Sécurité accrue : les `accessToken` ont une courte durée de vie.
- 😊 Meilleure expérience utilisateur : renouvellement transparent des sessions.
- 🚫 Possibilité de révoquer l'accès en invalidant le `refreshToken`.

## 6. Sécurité et bonnes pratiques

Stockage sécurisé des tokens :

Utilisation de cookies HTTP-only pour prévenir les attaques XSS.


Protection contre les attaques CSRF :

Utilisation du flag SameSite sur les cookies.


Hachage des mots de passe :

Utilisation de bcrypt pour un stockage sécurisé.


Gestion des erreurs :

Messages d'erreur génériques pour ne pas divulguer d'informations sensibles.


Validation des entrées :

Vérification systématique des données reçues côté serveur.



Exemple de hachage de mot de passe dans authService.js :
javascriptCopyexport const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

Avec cette architecture et ces pratiques de sécurité, Marye peut naviguer en toute tranquillité dans notre application, sachant que ses données sont bien protégées ! 🛡️
