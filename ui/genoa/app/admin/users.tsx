import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { getToken } from '../../services/auth';
import { API_BASE_URL } from '../../config';
import { Colors } from '../../constants/Colors';
import { styles } from '../../styles/admin.users.styles';

interface User {
  _id: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('lecteur');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        setError("Non authentifié");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError("Accès refusé. Vous n'êtes pas administrateur.");
        } else {
          setError("Erreur de récupération des utilisateurs");
        }
        return;
      }

      const data = await res.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const validateUser = async (userId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified: true })
      });

      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, isVerified: true } : u));
        Alert.alert('Succès', 'Utilisateur validé');
      } else {
        const data = await res.json();
        Alert.alert('Erreur', data.error || 'Erreur lors de la validation');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    }
  };

  const deleteUser = async (userId: string) => {
    Alert.alert('Confirmation', 'Voulez-vous vraiment supprimer cet utilisateur ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              setUsers(users.filter(u => u._id !== userId));
              Alert.alert('Succès', 'Utilisateur supprimé');
            } else {
              Alert.alert('Erreur', 'Erreur lors de la suppression');
            }
          } catch (err) {
            Alert.alert('Erreur', 'Impossible de contacter le serveur');
          }
        }
      }
    ]);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditEmail('');
    setEditPassword('');
    setEditRole('lecteur'); // Default role for created users
    setModalVisible(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUserId(user._id);
    setEditEmail(user.email);
    setEditRole(user.role);
    setModalVisible(true);
  };

  const saveUserModal = async () => {
    if (!editEmail) {
      Alert.alert('Erreur', 'Email requis');
      return;
    }

    try {
      const token = await getToken();

      if (modalMode === 'create') {
        if (!editPassword) {
          Alert.alert('Erreur', 'Mot de passe requis');
          return;
        }
        const res = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: editEmail, password: editPassword })
        });

        if (res.ok) {
          const data = await res.json();
          // fetch pour rafraichir la liste
          fetchUsers();
          setModalVisible(false);
          Alert.alert('Succès', 'Utilisateur tiers créé avec succès (auto-validé).');
        } else {
          const errData = await res.json();
          Alert.alert('Erreur', errData.error || 'Erreur lors de la création');
        }
      } else {
        // edit mode
        const res = await fetch(`${API_BASE_URL}/users/${selectedUserId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: editEmail, role: editRole })
        });

        if (res.ok) {
          setUsers(users.map(u => u._id === selectedUserId ? { ...u, email: editEmail, role: editRole } : u));
          setModalVisible(false);
          Alert.alert('Succès', 'Utilisateur mis à jour.');
        } else {
          const errData = await res.json();
          Alert.alert('Erreur', errData.error || 'Erreur lors de la mise à jour');
        }
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    }
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <Text style={styles.userEmail}>{item.email}</Text>
      <Text style={styles.userDetail}>Rôle: {item.role}</Text>
      <Text style={styles.userDetail}>Statut: {item.isVerified ? 'Validé' : 'En attente'}</Text>

      <View style={styles.actionsContainer}>
        {!item.isVerified && (
          <TouchableOpacity
            style={[styles.actionButton, styles.validateButton]}
            onPress={() => validateUser(item._id)}
          >
            <Text style={[styles.actionButtonText, styles.validateButtonText]}>Valider l'inscription</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            const newRole = item.role === 'admin' ? 'lecteur' : 'admin';
            setEditEmail(item.email);
            setEditRole(newRole);
            setSelectedUserId(item._id);
            setModalMode('edit');
            // sauvegarde directe du nouveau rôle
            saveRoleQuick(item._id, item.email, newRole);
          }}
        >
          <Text style={styles.actionButtonText}>Basculer en {item.role === 'admin' ? 'lecteur' : 'admin'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteUser(item._id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const saveRoleQuick = async (id: string, email: string, newRole: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
        Alert.alert('Succès', 'Droits mis à jour.');
      }
    } catch (err) { }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Utilisateurs</Text>
        <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
          <Text style={styles.createButtonText}>+ Créer Tiers</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* modal pour créer/modifier un utilisateur */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalMode === 'create' ? 'Créer un tiers' : 'Modifier utilisateur'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editEmail}
              onChangeText={setEditEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {modalMode === 'create' && (
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                value={editPassword}
                onChangeText={setEditPassword}
                secureTextEntry
              />
            )}

            {modalMode === 'edit' && (
              <TextInput
                style={styles.input}
                placeholder="Rôle (admin, editeur, lecteur)"
                value={editRole}
                onChangeText={setEditRole}
                autoCapitalize="none"
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveUserModal}
              >
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
