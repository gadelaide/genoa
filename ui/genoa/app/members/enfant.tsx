import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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

interface Couple {
  _id: string;
  membre1_id: string;
  membre2_id: string;
}

export default function EnfantScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCouple, setSelectedCouple] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [nature, setNature] = useState<'biologique' | 'adopte'>('biologique');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await getToken();

      const membersRes = await fetch(`${API_BASE_URL}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const membersData = await membersRes.json();

      if (!membersRes.ok) {
        Alert.alert('Erreur', 'Impossible de charger les membres');
        return;
      }

      const couplesMap = new Map<string, Couple>();

      for (const m of membersData) {
        const relRes = await fetch(`${API_BASE_URL}/members/${m._id}/relations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const relData = await relRes.json();

        if (relRes.ok && relData.couples) {
          relData.couples.forEach((c: any) => {
            couplesMap.set(c._id, {
              _id: c._id,
              membre1_id: c.membre1_id,
              membre2_id: c.membre2_id
            });
          });
        }
      }

      setMembers(membersData);
      setCouples(Array.from(couplesMap.values()));
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  const getMemberName = (id: string) => {
    const member = members.find((m) => m._id === id);
    return member ? `${member.prenom} ${member.nom}` : id;
  };

  const handleAddChild = async () => {
    if (!selectedCouple || !selectedChild) {
      Alert.alert('Erreur', 'Sélectionnez un couple et un enfant');
      return;
    }

    try {
      const token = await getToken();

      const res = await fetch(`${API_BASE_URL}/members/enfants`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          couple_id: selectedCouple,
          enfant_id: selectedChild,
          nature
        })
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert('Succès', 'Lien enfant créé avec succès');
        router.back();
      } else {
        Alert.alert('Erreur', data.error || data.message || 'Ajout impossible');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginTop: 40 }]}>Ajouter un enfant</Text>

      <Text style={styles.sectionTitle}>Choisir un couple</Text>
      <FlatList
        data={couples}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              selectedCouple === item._id ? { borderWidth: 2, borderColor: '#2e7d32' } : null
            ]}
            onPress={() => setSelectedCouple(item._id)}
          >
            <Text style={styles.name}>
              {getMemberName(item.membre1_id)} + {getMemberName(item.membre2_id)}
            </Text>
          </TouchableOpacity>
        )}
        style={{ maxHeight: 180, marginBottom: 15 }}
      />

      <Text style={styles.sectionTitle}>Choisir l'enfant</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              selectedChild === item._id ? { borderWidth: 2, borderColor: '#2e7d32' } : null
            ]}
            onPress={() => setSelectedChild(item._id)}
          >
            <Text style={styles.name}>{item.prenom} {item.nom}</Text>
          </TouchableOpacity>
        )}
        style={{ maxHeight: 180, marginBottom: 15 }}
      />

      <Text style={styles.sectionTitle}>Nature du lien</Text>
      <View style={styles.roleSelector}>
        {['biologique', 'adopte'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.roleButton,
              nature === option && styles.roleButtonActive
            ]}
            onPress={() => setNature(option as 'biologique' | 'adopte')}
          >
            <Text
              style={[
                styles.roleButtonText,
                nature === option && styles.roleButtonTextActive
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAddChild}>
        <Text style={styles.buttonText}>Ajouter l'enfant</Text>
      </TouchableOpacity>
    </View>
  );
}