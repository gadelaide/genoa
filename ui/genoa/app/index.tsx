import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getToken, deleteToken } from "../services/auth";

export default function Index() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await getToken();
    setIsLoggedIn(!!token);
  };

  const handleLogout = async () => {
    await deleteToken();
    setIsLoggedIn(false);
  };

  if (isLoggedIn === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1b4d3e" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fdf9',
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1b4d3e',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#4f796a',
    marginBottom: 50,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    height: 55,
    backgroundColor: '#1b4d3e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1b4d3e',
  },
  secondaryButtonText: {
    color: '#1b4d3e',
  },
});
