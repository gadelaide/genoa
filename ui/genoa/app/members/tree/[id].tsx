import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { getToken } from '../../../services/auth';
import { API_BASE_URL } from '../../../config';
import { globalStyles as styles } from '../../../styles/global.styles';

interface Person {
  _id: string;
  nom: string;
  prenom: string;
}

export default function MemberTreeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [member, setMember] = useState<Person | null>(null);
  const [relations, setRelations] = useState<{
    parents: Person[];
    conjoints: Person[];
    enfants: Person[];
    fratrie: Person[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTree = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const token = await getToken();

      const memberRes = await fetch(`${API_BASE_URL}/members/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const memberData = await memberRes.json();

      const relRes = await fetch(`${API_BASE_URL}/members/${id}/relations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const relData = await relRes.json();

      if (memberRes.ok) {
        setMember(memberData);
      }

      if (relRes.ok) {
        setRelations({
          parents: relData.parents || [],
          conjoints: relData.conjoints || [],
          enfants: relData.enfants || [],
          fratrie: relData.fratrie || [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTree();
    }, [id])
  );

  const renderPersonCard = (person: Person, variant: 'main' | 'secondary' = 'secondary') => (
    <TouchableOpacity
      key={person._id}
      onPress={() => router.push(`/members/tree/${person._id}`)}
      style={[
        styles.card,
        {
          minWidth: 170,
          alignItems: 'center',
          borderWidth: variant === 'main' ? 2 : 1,
          borderColor: variant === 'main' ? '#2e7d32' : '#dcdcdc',
          marginBottom: 12,
        },
      ]}
    >
      <Text style={styles.name}>{person.prenom} {person.nom}</Text>
      <Text style={styles.linkText}>Voir l’arbre</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
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
      <Text style={styles.title}>Arbre familial</Text>

      <Text style={styles.sectionTitle}>Parents</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {relations?.parents?.length
            ? relations.parents.map((p) => renderPersonCard(p))
            : <Text style={styles.info}>Aucun parent renseigné</Text>}
        </View>
      </ScrollView>

      <Text style={styles.sectionTitle}>Membre central</Text>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        {renderPersonCard(member, 'main')}
      </View>

      <Text style={styles.sectionTitle}>Fratrie</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {relations?.fratrie?.length
            ? relations.fratrie.map((f) => renderPersonCard(f))
            : <Text style={styles.info}>Aucune fratrie renseignée</Text>}
        </View>
      </ScrollView>

      <Text style={styles.sectionTitle}>Conjoints</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {relations?.conjoints?.length
            ? relations.conjoints.map((c) => renderPersonCard(c))
            : <Text style={styles.info}>Aucun conjoint renseigné</Text>}
        </View>
      </ScrollView>

      <Text style={styles.sectionTitle}>Enfants</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {relations?.enfants?.length
            ? relations.enfants.map((e) => renderPersonCard(e))
            : <Text style={styles.info}>Aucun enfant renseigné</Text>}
        </View>
      </ScrollView>
    </ScrollView>
  );
}