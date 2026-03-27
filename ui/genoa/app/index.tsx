import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getToken, deleteToken } from "../services/auth";
import { styles } from "../styles/index.styles";
import { Colors } from "../constants/Colors";

export default function Index() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await getToken();
    setIsLoggedIn(!!token); //double négation pour convertir en boolean
  };

  const handleLogout = async () => {
    await deleteToken();
    setIsLoggedIn(false);
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
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Se déconnecter</Text>
          </TouchableOpacity>
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
