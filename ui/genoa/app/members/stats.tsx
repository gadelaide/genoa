import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { getToken } from '../../services/auth';
import { API_BASE_URL } from '../../config';
import { globalStyles as styles } from '../../styles/global.styles';

interface StatsData {
  totalMembers: number;
  totalHommes: number;
  totalFemmes: number;
  moyenneEsperanceVie: number;
  moyenneEnfantsParCouple: number;
  nombreGenerations: number;
}

export default function MembersStatsScreen() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const token = await getToken();

      const res = await fetch(`${API_BASE_URL}/members/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setStats(data);
      } else {
        setErrorMessage(data.error || data.message || 'Impossible de charger les statistiques');
      }
    } catch (err) {
      setErrorMessage('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Statistiques familiales</Text>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {stats && (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Membres</Text>
            <Text style={styles.info}>Nombre total de membres : {stats.totalMembers}</Text>
            <Text style={styles.info}>Nombre d'hommes : {stats.totalHommes}</Text>
            <Text style={styles.info}>Nombre de femmes : {stats.totalFemmes}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Famille</Text>
            <Text style={styles.info}>Espérance de vie moyenne : {stats.moyenneEsperanceVie} ans</Text>
            <Text style={styles.info}>Nombre moyen d'enfants par couple : {stats.moyenneEnfantsParCouple}</Text>
            <Text style={styles.info}>Nombre de générations : {stats.nombreGenerations}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}