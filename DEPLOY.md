# 🚀 Déploiement Echo AI Sparring Partner sur Vercel

## 📋 **Prérequis**

1. **Compte Vercel** : [vercel.com](https://vercel.com)
2. **Clé API Gemini** : [AI Studio Google](https://aistudio.google.com/app/apikey)
3. **Repository GitHub** : https://github.com/Lofp34/coachMindset.git

## 🔧 **Étapes de Déploiement**

### 1. **Connexion Vercel → GitHub**
```bash
# Optionnel: Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login
```

### 2. **Configuration sur Vercel Dashboard**
1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Cliquer **"New Project"**
3. Importer le repository : `Lofp34/coachMindset`
4. **Framework Preset** : `Vite` (détection automatique)

### 3. **Variables d'Environnement**
Dans les **Project Settings → Environment Variables** :

| Variable | Value | Environnement |
|----------|-------|---------------|
| `GEMINI_API_KEY` | `your_gemini_api_key_here` | Production, Preview, Development |

⚠️ **IMPORTANT** : Votre clé API Gemini est obligatoire pour le fonctionnement.

### 4. **Configuration Build (Automatique)**
Vercel détecte automatiquement :
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

## 🎯 **Configuration Vercel Optimisée**

### Headers de Sécurité
Le fichier `vercel.json` configure automatiquement :
- ✅ **PWA Support** : Service Worker et Manifest
- ✅ **Security Headers** : X-Frame-Options, CSP
- ✅ **SPA Routing** : Redirection vers index.html
- ✅ **Cache Optimisé** : Service Worker sans cache

### Permissions API
- ✅ **Microphone** : Autorisé (transcription vocale)
- ✅ **Camera** : Bloqué (non utilisé)
- ✅ **Géolocalisation** : Bloqué (non utilisé)

## 🚀 **Déploiement**

### Option A : Via Vercel Dashboard
1. Push votre code sur GitHub
2. Vercel déploie automatiquement
3. URL de production : `https://your-project.vercel.app`

### Option B : Via CLI
```bash
# Déploiement preview
npm run deploy:preview

# Déploiement production
npm run deploy
```

## 📱 **Test PWA en Production**

1. **Ouvrir l'URL Vercel** dans Chrome/Edge
2. **Vérifier l'icône d'installation** dans la barre d'adresse
3. **Cliquer "📱 Installer"** dans l'interface
4. **Tester l'application** installée

## 🔍 **Vérifications Post-Déploiement**

### ✅ **Checklist Fonctionnelle**
- [ ] **Interface charge** correctement
- [ ] **Transcription vocale** fonctionne
- [ ] **API Gemini** répond (besoin clé API)
- [ ] **Synthèse vocale** active
- [ ] **Installation PWA** disponible
- [ ] **Service Worker** enregistré

### 🛠️ **Debug Courant**

**Problème** : API Gemini ne répond pas
**Solution** : Vérifier variable `GEMINI_API_KEY` dans Vercel

**Problème** : Service Worker erreur
**Solution** : HTTPS obligatoire (Vercel le fournit automatiquement)

**Problème** : Installation PWA indisponible
**Solution** : Vérifier manifest.json et icônes dans `/public/`

## 📊 **Monitoring & Analytics**

Vercel fournit automatiquement :
- ✅ **Analytics de performance**
- ✅ **Logs de fonction**
- ✅ **Monitoring d'uptime**

## 🔄 **Mises à Jour**

Pour déployer une nouvelle version :
1. `git push` vers GitHub
2. Vercel redéploie automatiquement
3. PWA se met à jour automatiquement

---

🎉 **Votre Echo AI Sparring Partner sera accessible mondialement avec HTTPS, PWA et performance optimisée !**