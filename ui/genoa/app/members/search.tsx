import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
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
  sexe?: string;
}

export default function SearchMembersScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async () => {
    setErrorMessage('');

    if (!query.trim()) {
      setErrorMessage('Entrez un nom ou un prénom');
      return;
    }

    try {
      const token = await getToken();

      const res = await fetch(
        `${API_BASE_URL}/members/search?q=${encodeURIComponent(query.trim())}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setResults(data);
      } else {
        setErrorMessage(data.error || data.message || 'Recherche impossible');
      }
    } catch (err) {
      setErrorMessage('Impossible de contacter le serveur');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginTop: 40 }]}>Recherche de membre</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom ou prénom"
        value={query}
        onChangeText={(text) => {
            setQuery(text);
            handleSearch(text);
        }}
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

    
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingTop: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/members/${item._id}`)}
          >
            <Text style={styles.name}>{item.prenom} {item.nom}</Text>
            <Text style={styles.info}>{item.sexe || 'Sexe non renseigné'}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          results.length === 0 ? (
            <Text style={styles.emptyText}>Aucun résultat</Text>
          ) : null
        }
      />
    </View>
  );
}