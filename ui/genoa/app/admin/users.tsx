import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { getToken } from '../../services/auth';
import { API_BASE_URL } from '../../config';
import { globalStyles as styles } from '../../styles/global.styles';

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
  const [errorMessage, setErrorMessage] = useState('');


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

  const confirmAndDeleteUser = async (userId: string) => {
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
        const data = await res.json();
        Alert.alert('Erreur', data.error || data.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    }
  };

  const deleteUser = async (userId: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Voulez-vous vraiment supprimer cet utilisateur ?'
      );

      if (confirmed) {
        await confirmAndDeleteUser(userId);
      }
      return;
    }

    Alert.alert('Confirmation', 'Voulez-vous vraiment supprimer cet utilisateur ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          confirmAndDeleteUser(userId);
        }
      }
    ]);
  };
  const openCreateModal = () => {
    setModalMode('create');
    setEditEmail('');
    setEditPassword('');
    setEditRole('lecteur'); // role par défaut lors de la création
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
    setErrorMessage('');
    if (!editEmail) {
      setErrorMessage('Email requis');
      return;
    }

    if (modalMode === 'create' && !editPassword) {
      setErrorMessage('Mot de passe requis');
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
          setErrorMessage(errData.error || errData.message || 'Erreur lors de la création');
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
          setErrorMessage(errData.error || errData.message || 'Erreur lors de la mise à jour');
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
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteUser(item._id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={styles.button.backgroundColor} />
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
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

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
              <View style={styles.roleSelector}>
                {['lecteur', 'editeur', 'admin'].map((roleOption) => (
                  <TouchableOpacity
                    key={roleOption}
                    style={[
                      styles.roleButton,
                      editRole === roleOption && styles.roleButtonActive
                    ]}
                    onPress={() => setEditRole(roleOption)}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        editRole === roleOption && styles.roleButtonTextActive
                      ]}
                    >
                      {roleOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
