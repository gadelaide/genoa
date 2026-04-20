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
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { getToken, getRole } from "../../services/auth";
import { API_BASE_URL } from "../../config";
import { globalStyles as styles } from '../../styles/global.styles';

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
        <ActivityIndicator size="large" color={styles.button.backgroundColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 15 }}
        style={{ flexGrow: 0 }}
      >
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/members/search')}
        >
          <Text style={styles.addButtonText}>Recherche</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/members/create')}
        >
          <Text style={styles.addButtonText}>+ Membre</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/members/couple')}
        >
          <Text style={styles.addButtonText}>+ Couple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/members/enfant')}
        >
          <Text style={styles.addButtonText}>+ Enfant</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/members/stats')}
        >
          <Text style={styles.addButtonText}>Stats</Text>
        </TouchableOpacity>
      </ScrollView>

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

