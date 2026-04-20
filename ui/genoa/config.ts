/**
 * URL de base de l'API backend.
 *
 * IMPORTANT : Cette URL dépend de l'environnement de test.
 *
 * - Sur navigateur (web) :
 *   → utiliser 'http://localhost:3000/api'
 *   (le frontend et le backend tournent sur le même PC)
 *
 * - Sur téléphone (Expo Go) :
 *   → utiliser 'http://IP_DU_PC:3000/api'
 *   (ex: http://192.168.1.21:3000/api)
 *   car "localhost" sur téléphone pointe vers le téléphone lui-même, pas vers ton ordinateur.
 *
 * - Sur émulateur Android :
 *   → utiliser 'http://10.0.2.2:3000/api'
 *
 *  L'IP du PC se récupère avec la commande "ipconfig" (IPv4).
 *  Le téléphone et le PC doivent être sur le même réseau Wi-Fi.
 */
export const API_BASE_URL = 'http://172.18.60.244:3000/api'; 
