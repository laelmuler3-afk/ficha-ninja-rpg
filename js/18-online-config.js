/*
 * Ficha Ninja RPG — configuração do Firebase.
 *
 * Projeto: Ficha Ninja RPG
 * App Web: Ficha Ninja Web
 * Realtime Database: us-central1
 *
 * A configuração Web do Firebase identifica o projeto no cliente e não é
 * uma chave administrativa. A proteção dos dados depende das regras em
 * /firebase/database.rules.json.
 */
window.SHINOBI_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBeMVqmmhrSKDnm0BrgpQnM8A9_NvB6gUY",
  authDomain: "ficha-ninja-rpg.firebaseapp.com",
  databaseURL: "https://ficha-ninja-rpg-default-rtdb.firebaseio.com",
  projectId: "ficha-ninja-rpg",
  storageBucket: "ficha-ninja-rpg.firebasestorage.app",
  messagingSenderId: "683919396463",
  appId: "1:683919396463:web:d033f7ef8d8261c18e879a"
};

window.SHINOBI_FIREBASE_OPTIONS = {
  enabled: true,
  sdkVersion: "12.16.0",
  backupsToKeep: 5,
  sdkMode: "compat",
  sdkTimeoutMs: 18000,
  sdkSources: [
    "https://www.gstatic.com/firebasejs/12.16.0",
    "https://cdn.jsdelivr.net/npm/firebase@12.16.0"
  ]
};
