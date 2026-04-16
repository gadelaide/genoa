import React, { useCallback, useState } from "react";
import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getToken, deleteToken, getRole, deleteRole } from "../services/auth";
import { styles } from "../styles/index.styles";
import { Colors } from "../constants/Colors";

export default function Index() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const checkLogin = async () => {
    const token = await getToken();
    setIsLoggedIn(!!token); //double négation pour convertir en boolean
    const role = await getRole();
    setIsAdmin(role === 'admin');
  };

  useFocusEffect(
    useCallback(() => {
      checkLogin();
    }, [])
  );

  const handleLogout = async () => {
    await deleteToken();
    await deleteRole();
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  if (isLoggedIn === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Genoa</Text>
      <Text style={styles.subtitle}>
        {isLoggedIn
          ? "Bienvenue dans votre généalogie"
          : "L'application de gestion généalogique"}
      </Text>

      <View style={styles.buttonContainer}>
        {isLoggedIn ? (
            <>
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.button, { marginBottom: 15 }]}
                  onPress={() => router.push('/admin/users')}
                >
                  <Text style={styles.buttonText}>Gestion des utilisateurs</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, { marginBottom: 15 }]}
                onPress={() => router.push('/members')}
              >
                <Text style={styles.buttonText}>Voir les membres</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleLogout}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Se déconnecter
                </Text>
              </TouchableOpacity>
            </>
          ) : (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.buttonText}>Se connecter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push('/register')}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>S'inscrire</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
