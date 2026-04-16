import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getToken } from '../../services/auth';
import { API_BASE_URL } from '../../config';
import { globalStyles as styles } from '../../styles/global.styles';

interface Member {
  _id: string;
  nom: string;
  prenom: string;
}

export default function CoupleScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected1, setSelected1] = useState<string | null>(null);
  const [selected2, setSelected2] = useState<string | null>(null);
  const [dateUnion, setDateUnion] = useState('');
  const [dateSeparation, setDateSeparation] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {    
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        setMembers(data);
      } else {
        Alert.alert('Erreur', data.error || 'Impossible de charger les membres');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCouple = async () => {
    setErrorMessage('');

    if (!selected1 || !selected2) {
        setErrorMessage('Sélectionnez deux membres');
        return;
    }

    if (selected1 === selected2) {
        setErrorMessage('Un membre ne peut pas être en couple avec lui-même');
        return;
    }

    try {
        const token = await getToken();

        const res = await fetch(`${API_BASE_URL}/members/couples`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            membre1_id: selected1,
            membre2_id: selected2,
            dateUnion: dateUnion || null,
            dateSeparation: dateSeparation || null
        })
        });

        const data = await res.json();

        if (res.ok) {
            Alert.alert("Succès", "Couple créé avec succès");
            setTimeout(() => router.back(), 1000);
        } else {
            setErrorMessage(data.error || data.message || 'Création impossible');
        }
    } catch (err) {
        setErrorMessage('Impossible de contacter le serveur');
    }
  };

  const renderMember = (
    item: Member,
    selected: string | null,
    setSelected: (id: string) => void
  ) => (
    <TouchableOpacity
      style={[
        styles.card,
        selected === item._id ? { borderWidth: 2, borderColor: '#2e7d32' } : null
      ]}
      onPress={() => setSelected(item._id)}
    >
      <Text style={styles.name}>{item.prenom} {item.nom}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginTop: 40 }]}>Créer un couple</Text>

      <Text style={styles.sectionTitle}>Premier membre</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => `${item._id}-1`}
        renderItem={({ item }) => renderMember(item, selected1, setSelected1)}
        style={{ maxHeight: 180, marginBottom: 15 }}
      />

      <Text style={styles.sectionTitle}>Deuxième membre</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => `${item._id}-2`}
        renderItem={({ item }) => renderMember(item, selected2, setSelected2)}
        style={{ maxHeight: 180, marginBottom: 15 }}
      />

      <TextInput
        style={styles.input}
        placeholder="Date d'union (YYYY-MM-DD)"
        value={dateUnion}
        onChangeText={setDateUnion}
      />

      <TextInput
        style={styles.input}
        placeholder="Date de séparation (YYYY-MM-DD)"
        value={dateSeparation}
        onChangeText={setDateSeparation}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleCreateCouple}>
        <Text style={styles.buttonText}>Créer le couple</Text>
      </TouchableOpacity>
    </View>
  );
}