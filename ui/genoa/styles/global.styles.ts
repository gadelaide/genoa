import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },

  centeredContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: 'center',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
  },

  bigTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 40,
  },

  smallSubtitle: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 50,
  },

  buttonContainer: {
    width: '100%',
    gap: 15,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  form: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  userCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,

    borderWidth: 1,
    borderColor: '#e5e5e5',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: Colors.inputBackground || '#fff',
  },

  inputFixedHeight: {
    height: 50,
    paddingHorizontal: 15,
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },

  tallButton: {
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  createButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },

  editButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  deleteButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
},

  deleteButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  largeButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },

  secondaryButtonText: {
    color: Colors.primary,
  },

  addButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },

  linkText: {
    color: Colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },

  info: {
    fontSize: 15,
    color: Colors.secondary,
    marginBottom: 8,
    lineHeight: 22,
  },

  infoSmall: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 3,
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 6,
  },

  userEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 6,
  },

  userDetail: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 2,
  },

  emptyText: {
    fontSize: 16,
    color: Colors.secondary,
  },

  errorText: {
    color: Colors.error || '#d9534f',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },

  successText: {
    color: '#2e7d32',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },

  actionsContainer: {
    marginTop: 10,
    gap: 12,
    width: '100%',
  },

  actionsWrapContainer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  validateButton: {
    backgroundColor: '#e8f5e9',
  },

  validateButtonText: {
    color: '#2e7d32',
  },

  softDeleteButton: {
    backgroundColor: '#ffebee',
  },

  softDeleteButtonText: {
    color: Colors.error,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },

  modalButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#f0f0f0',
  },

  cancelButtonText: {
    color: '#333',
  },

  saveButton: {
    backgroundColor: Colors.primary,
  },

  saveButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },

  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 8,
  },

  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },

  roleButtonActive: {
    backgroundColor: Colors.primary,
  },

  roleButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },

  roleButtonTextActive: {
    color: Colors.white,
  },

});