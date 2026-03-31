import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'genoa_auth_token';

// sauvegarde du token
export async function saveToken(token: string) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token', error);
  }
}

// récupérer le token
export async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Erreur lors de la récupération du token', error);
    return null;
  }
}

// supprimer du token
export async function deleteToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression du token', error);
  }
}

const ROLE_KEY = 'genoa_user_role';

// sauvegarde du role
export async function saveRole(role: string) {
  try {
    await SecureStore.setItemAsync(ROLE_KEY, role);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du role', error);
  }
}

// récupérer le role
export async function getRole() {
  try {
    return await SecureStore.getItemAsync(ROLE_KEY);
  } catch (error) {
    console.error('Erreur lors de la récupération du role', error);
    return null;
  }
}

// supprimer le role
export async function deleteRole() {
  try {
    await SecureStore.deleteItemAsync(ROLE_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression du role', error);
  }
}
