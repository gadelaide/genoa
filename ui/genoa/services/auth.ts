import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'genoa_auth_token'; //clé utilisé pour stocker le token 
const ROLE_KEY = 'genoa_user_role';

// sauvegarde du token
export async function saveToken(token: string) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token', error);
  }
}

// récupérer le token
export async function getToken() {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du token', error);
    return null;
  }
}

// supprimer du token
export async function deleteToken() {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du token', error);
  }
}


// sauvegarde du role
export async function saveRole(role: string) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(ROLE_KEY, role);
    } else {
      await SecureStore.setItemAsync(ROLE_KEY, role);
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du role', error);
  }
}

// récupérer le role
export async function getRole() {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(ROLE_KEY);
    } else {
      return await SecureStore.getItemAsync(ROLE_KEY);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du role', error);
    return null;
  }
}

// supprimer le role
export async function deleteRole() {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(ROLE_KEY);
    } else {
      await SecureStore.deleteItemAsync(ROLE_KEY);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du role', error);
  }
}
