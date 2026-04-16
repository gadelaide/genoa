//liste les membres
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { getToken, getRole } from "../../services/auth";
import { API_BASE_URL } from "../../config";
import { Colors } from "../../constants/Colors";

interface Member {
  _id: string;
  nom: string;
  prenom: string;
  sexe?: string;
  dateNaissance?: string;
}

export default function MembersScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
    loadRole();
  }, []);

  const loadRole = async () => {
    const savedRole = await getRole();
    setRole(savedRole);
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté");
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/members`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMembers(data);
      } else {
        Alert.alert("Erreur", data.error || data.message || "Impossible de charger les membres");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  const renderMember = ({ item }: { item: Member }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/members/${item._id}`)}
    >
      <Text style={styles.name}>
        {item.prenom} {item.nom}
      </Text>

      {item.sexe ? <Text style={styles.info}>Sexe : {item.sexe}</Text> : null}
      {item.dateNaissance ? (
        <Text style={styles.info}>Naissance : {item.dateNaissance}</Text>
      ) : null}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Membres de la famille</Text>

        {(role === "admin" || role === "editeur") && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/members/create")}
          >
            <Text style={styles.addButtonText}>+ Ajouter</Text>
          </TouchableOpacity>
        )}
      </View>

      {members.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Aucun membre trouvé</Text>
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item._id}
          renderItem={renderMember}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.secondary,
  },
});