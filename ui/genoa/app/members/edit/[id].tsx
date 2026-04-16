//modifier membre
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { getToken } from "../../../services/auth";
import { API_BASE_URL } from "../../../config";
import { globalStyles as styles } from '../../../styles/global.styles';

export default function EditMemberScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [sexe, setSexe] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [dateDeces, setDateDeces] = useState("");
  const [profession, setProfession] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");
  const [infoPublique, setInfoPublique] = useState("");
  const [infoPrivee, setInfoPrivee] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const token = await getToken();

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
        setNom(data.nom || "");
        setPrenom(data.prenom || "");
        setSexe(data.sexe || "");
        setDateNaissance(data.dateNaissance || "");
        setDateDeces(data.dateDeces || "");
        setProfession(
          data.professions && data.professions.length > 0
            ? data.professions[0]
            : ""
        );
        setTelephone(data.coordonnees?.telephone || "");
        setEmail(
          data.coordonnees?.emails && data.coordonnees.emails.length > 0
            ? data.coordonnees.emails[0]
            : ""
        );
        setAdresse(
          data.coordonnees?.adresses && data.coordonnees.adresses.length > 0
            ? data.coordonnees.adresses[0]
            : ""
        );
        setInfoPublique(data.informationsComplementaires?.publique || "");
        setInfoPrivee(data.informationsComplementaires?.privee || "");
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

  const handleSave = async () => {
    if (!nom.trim() || !prenom.trim()) {
      Alert.alert("Erreur", "Le nom et le prénom sont obligatoires");
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();

      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté");
        router.replace("/login");
        return;
      }

      const payload = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        sexe: sexe.trim() || undefined,
        dateNaissance: dateNaissance.trim() || undefined,
        dateDeces: dateDeces.trim() || undefined,
        professions: profession.trim() ? [profession.trim()] : [],
        coordonnees: {
          telephone: telephone.trim() || undefined,
          emails: email.trim() ? [email.trim()] : [],
          adresses: adresse.trim() ? [adresse.trim()] : [],
        },
        informationsComplementaires: {
          publique: infoPublique.trim() || undefined,
          privee: infoPrivee.trim() || undefined,
        },
      };

      const response = await fetch(`${API_BASE_URL}/members/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Succès", "Membre modifié avec succès");
        router.replace(`/members/${id}`);
      } else {
        Alert.alert(
          "Erreur",
          data.error || data.message || "Impossible de modifier le membre"
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={styles.button.backgroundColor} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Modifier le membre</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nom *"
          value={nom}
          onChangeText={setNom}
        />

        <TextInput
          style={styles.input}
          placeholder="Prénom *"
          value={prenom}
          onChangeText={setPrenom}
        />

        <TextInput
          style={styles.input}
          placeholder="Sexe (M/F)"
          value={sexe}
          onChangeText={setSexe}
        />

        <TextInput
          style={styles.input}
          placeholder="Date de naissance (YYYY-MM-DD)"
          value={dateNaissance}
          onChangeText={setDateNaissance}
        />

        <TextInput
          style={styles.input}
          placeholder="Date de décès (YYYY-MM-DD)"
          value={dateDeces}
          onChangeText={setDateDeces}
        />

        <TextInput
          style={styles.input}
          placeholder="Profession"
          value={profession}
          onChangeText={setProfession}
        />

        <TextInput
          style={styles.input}
          placeholder="Téléphone"
          value={telephone}
          onChangeText={setTelephone}
        />

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
          placeholder="Adresse"
          value={adresse}
          onChangeText={setAdresse}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Information publique"
          value={infoPublique}
          onChangeText={setInfoPublique}
          multiline
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Information privée"
          value={infoPrivee}
          onChangeText={setInfoPrivee}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={styles.button.backgroundColor} />
          ) : (
            <Text style={styles.buttonText}>Enregistrer les modifications</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

