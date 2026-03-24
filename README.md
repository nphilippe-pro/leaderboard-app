## Flux mot de passe oublié (Supabase)
- `Login.html` : connexion avec pseudo + mot de passe, lien vers `ForgotPassword.html`
- `ForgotPassword.html` : demande l'email et envoie un lien de réinitialisation
- `ResetPassword.html` : permet de choisir le nouveau mot de passe
- `api/auth-login-lookup.js` : convertit le pseudo en email côté serveur pour la connexion

### À configurer dans Supabase
Ajouter l'URL de redirection vers `ResetPassword.html` dans les URL de redirection autorisées.
Exemple :
`https://ton-site.vercel.app/ResetPassword.html`

## Système de points par tentative
- 1 à 3 tentatives : 100 points
- 4 : 90
- 5 : 80
- 6 : 70
- 7 : 60
- 8 : 50
- 9 : 40
- 10 : 30
- 11 : 20
- 12 : 10
- 13 : 5
- 14 : 3
- 15 : 2
- 16 : 1
- 17 et plus : 0

### Fichiers ajoutés
- `sql/points_system.sql`
- `api/submit-game-result.js`
- `game_points_helper.js`

### Étapes
1. Exécuter `sql/points_system.sql` dans Supabase.
2. Déployer `api/submit-game-result.js` et `game_points_helper.js`.
3. Redéployer Vercel.
4. Tester un jeu connecté : le score du joueur doit augmenter une seule fois par jeu et par jour.
