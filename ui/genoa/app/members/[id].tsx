//détail membre
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { getRole, getToken } from "../../services/auth";
import { API_BASE_URL } from "../../config";
import { globalStyles as styles } from '../../styles/global.styles';

interface Member {
  _id: string;
  nom: string;
  prenom: string;
  sexe?: string;
  photo?: string;
  dateNaissance?: string;
  dateDeces?: string | null;
  professions?: string[];
  coordonnees?: {
    adresses?: string[];
    telephone?: string;
    emails?: string[];
  };
  informationsComplementaires?: {
    publique?: string;
    privee?: string;
  };
}

export default function MemberDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [member, setMember] = useState<Member | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = role === "admin" || role === "editeur";

  const fetchMember = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const savedRole = await getRole();
      setRole(savedRole);

      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté");
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/members/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMember(data);
      } else {
        Alert.alert("Erreur", data.error || data.message || "Membre introuvable");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMember();
    }, [id])
  );

  const confirmAndDelete = async () => {
    try {
        const token = await getToken();

        const response = await fetch(`${API_BASE_URL}/members/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

        const data = await response.json();

        if (response.ok) {
        Alert.alert("Succès", "Membre supprimé");
        router.replace("/members");
        } else {
        Alert.alert(
            "Erreur",
            data.error || data.message || "Suppression impossible"
        );
        }
    } catch (error) {
        console.error(error);
        Alert.alert("Erreur", "Impossible de contacter le serveur");
    }
    };

    
  const handleDelete = async () => {
    if (Platform.OS === "web") {
        const confirmed = window.confirm(
        "Voulez-vous vraiment supprimer ce membre ?"
        );

        if (confirmed) {
        await confirmAndDelete();
        }
        return;
    }

    Alert.alert(
        "Confirmation",
        "Voulez-vous vraiment supprimer ce membre ?",
        [
        { text: "Annuler", style: "cancel" },
        {
            text: "Supprimer",
            style: "destructive",
            onPress: () => {
            confirmAndDelete();
            },
        },
        ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={styles.button.backgroundColor} />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Membre introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {member.prenom} {member.nom}
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informations générales</Text>
        <Text style={styles.info}>Sexe : {member.sexe || "Non renseigné"}</Text>
        <Text style={styles.info}>
          Date de naissance : {member.dateNaissance || "Non renseignée"}
        </Text>
        <Text style={styles.info}>
          Date de décès : {member.dateDeces || "Non renseignée"}
        </Text>
        <Text style={styles.info}>
          Professions :{" "}
          {member.professions && member.professions.length > 0
            ? member.professions.join(", ")
            : "Non renseignées"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Coordonnées</Text>
        <Text style={styles.info}>
          Téléphone : {member.coordonnees?.telephone || "Non renseigné"}
        </Text>
        <Text style={styles.info}>
          Emails :{" "}
          {member.coordonnees?.emails && member.coordonnees.emails.length > 0
            ? member.coordonnees.emails.join(", ")
            : "Non renseignés"}
        </Text>
        <Text style={styles.info}>
          Adresses :{" "}
          {member.coordonnees?.adresses && member.coordonnees.adresses.length > 0
            ? member.coordonnees.adresses.join(" | ")
            : "Non renseignées"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informations complémentaires</Text>
        <Text style={styles.info}>
          Publique :{" "}
          {member.informationsComplementaires?.publique || "Non renseignée"}
        </Text>

        {member.informationsComplementaires?.privee ? (
          <Text style={styles.info}>
            Privée : {member.informationsComplementaires.privee}
          </Text>
        ) : null}
      </View>

      {canEdit && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/members/edit/${member._id}`)}
          >
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.buttonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

