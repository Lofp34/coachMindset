# 🎯 Echo - Sparring Partner IA

> **Progressive Web App** de coaching en vente avec transcription vocale avancée et IA Gemini

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Lofp34/coachMindset)

## 🚀 Fonctionnalités

- 🎤 **Transcription vocale continue** sans écho
- 🤖 **IA Dual-Persona** (prospect + coach)
- 🔊 **Synthèse vocale** française
- 📱 **PWA installable** sur mobile/desktop
- ⚡ **Cache intelligent** avec service worker
- 🎯 **7 Principes du mindset de vente** intégrés

## 📦 Installation Locale

### Prérequis
- **Node.js** 18+ 
- **Clé API Gemini** ([Obtenir ici](https://aistudio.google.com/app/apikey))

### Étapes
```bash
# 1. Cloner le repository
git clone https://github.com/Lofp34/coachMindset.git
cd coachMindset

# 2. Installer les dépendances
npm install

# 3. Configuration environnement
cp env.example .env.local
# Éditer .env.local avec votre clé API Gemini

# 4. Lancer en développement
npm run dev
```

**🌐 Application disponible sur :** http://localhost:5174

## 🚀 Déploiement Vercel

**Déploiement en un clic :** [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Lofp34/coachMindset)

**Configuration manuelle :** Voir [DEPLOY.md](DEPLOY.md) pour instructions détaillées.

## 🛠️ Technologies

- **React 19.1.1** + **TypeScript**
- **Vite 6.2.0** + **PWA Plugin**
- **API Gemini 2.5-flash**
- **Web Speech API**
- **Workbox** (Service Worker)

## 📱 PWA Features

- ✅ Installation native mobile/desktop
- ✅ Fonctionnement hors ligne partiel
- ✅ Mises à jour automatiques
- ✅ Cache API intelligent
- ✅ Raccourcis d'application

---

**Repository :** https://github.com/Lofp34/coachMindset.git
