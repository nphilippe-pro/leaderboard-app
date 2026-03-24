## Flux mot de passe oublié (Supabase)
- `Login.html` : connexion avec pseudo + mot de passe, lien vers `ForgotPassword.html`
- `ForgotPassword.html` : demande l'email et envoie un lien de réinitialisation
- `ResetPassword.html` : permet de choisir le nouveau mot de passe
- `api/auth-login-lookup.js` : convertit le pseudo en email côté serveur pour la connexion

### À configurer dans Supabase
Ajouter l'URL de redirection vers `ResetPassword.html` dans les URL de redirection autorisées.
Exemple :
`https://ton-site.vercel.app/ResetPassword.html`