import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { saveToken } from '../services/auth';
import { styles } from '../styles/login.styles';
import { Colors } from '../constants/Colors';

import { API_BASE_URL } from '../config';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await saveToken(data.token);
        if (data.role) {
          await import('../services/auth').then(m => m.saveRole(data.role));
        }
        Alert.alert('Succès', 'Connexion réussie !');
        router.push('/'); // Rediriger vers l'accueil
      } else {
        Alert.alert('Erreur', data.message || 'Identifiants incorrects');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Genoa</Text>
      <Text style={styles.subtitle}>Espace membre</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.linkText}>Pas encore de compte ? S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
