import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const EditFieldModal = ({ 
  isVisible, 
  onClose, 
  fieldName, 
  fieldValue, 
  fieldLabel, 
  isMultiline, 
  onSave 
}) => {
  const [value, setValue] = useState('');
  const [first_Name, setFirst_Name] = useState('');
  const [last_Name, setLast_Name] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState(false);
  
  // Actualiza el valor del campo cuando cambia la prop fieldValue
  useEffect(() => {
    if (fieldName === 'fullname' && fieldValue) {
      // Si es el campo de nombre completo, dividir en nombre y apellido
      const nameParts = fieldValue.split(' ');
      if (nameParts.length > 1) {
        const last_Name = nameParts.pop();
        const first_Name = nameParts.join(' ');
        setFirst_Name(first_Name);
        setLast_Name(last_Name);
      } else {
        setFirst_Name(fieldValue);
        setLast_Name('');
      }
    } else {
      setValue(fieldValue);
    }
  }, [fieldValue, fieldName]);
  
  const handleSave = () => {
    if (fieldName === 'fullname') {
      // Para el nombre completo, guardamos tanto el nombre como el apellido
      onSave(fieldName, { first_Name, last_Name });
    } else {
      onSave(fieldName, value);
    }
    onClose();
  };
  
  const isPriceField = fieldName === 'hourly_rate';
  const isNameField = fieldName === 'fullname';
  
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar {fieldLabel}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {isNameField ? (
            // Vista especial para el campo de nombre completo
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre</Text>
              <View style={[
                styles.inputContainer,
                isFirstNameFocused && styles.inputContainerFocused
              ]}>
                <TextInput
                  style={styles.input}
                  value={first_Name}
                  onChangeText={setFirst_Name}
                  onFocus={() => setIsFirstNameFocused(true)}
                  onBlur={() => setIsFirstNameFocused(false)}
                  autoCapitalize="words"
                  placeholder="Ingrese su nombre..."
                  placeholderTextColor="#999"
                />
              </View>
              
              <Text style={[styles.label, {marginTop: 15}]}>Apellido</Text>
              <View style={[
                styles.inputContainer,
                isLastNameFocused && styles.inputContainerFocused
              ]}>
                <TextInput
                  style={styles.input}
                  value={last_Name}
                  onChangeText={setLast_Name}
                  onFocus={() => setIsLastNameFocused(true)}
                  onBlur={() => setIsLastNameFocused(false)}
                  autoCapitalize="words"
                  placeholder="Ingrese su apellido..."
                  placeholderTextColor="#999"
                />
              </View>
              
              <Text style={styles.helperText}>
                Ingrese su nombre y apellido como aparecerán en su perfil
              </Text>
            </View>
          ) : (
            // Vista estándar para el resto de campos
            <View style={styles.formGroup}>
              <Text style={styles.label}>{fieldLabel}</Text>
              <View style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused
              ]}>
                {isPriceField && (
                  <Text style={styles.currencySymbol}>€</Text>
                )}
                <TextInput
                  style={[
                    styles.input,
                    isMultiline && styles.multilineInput,
                    isPriceField && styles.priceInput
                  ]}
                  value={value}
                  onChangeText={setValue}
                  multiline={isMultiline}
                  numberOfLines={isMultiline ? 4 : 1}
                  keyboardType={isPriceField ? 'numeric' : 'default'}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoCapitalize="none"
                  placeholder={`Ingrese ${fieldLabel.toLowerCase()}...`}
                  placeholderTextColor="#999"
                />
              </View>
              
              {fieldName === 'description' && (
                <Text style={styles.helperText}>
                  Describe tu experiencia, servicios y especialidades
                </Text>
              )}
              
              {fieldName === 'hourly_rate' && (
                <Text style={styles.helperText}>
                  Ingrese su tarifa por hora sin el símbolo de euro
                </Text>
              )}
              
              {fieldName === 'profession' && (
                <Text style={styles.helperText}>
                  Especifique su profesión o especialidad principal
                </Text>
              )}
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9'
  },
  inputContainerFocused: {
    borderColor: '#24a5f7',
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333'
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  priceInput: {
    fontWeight: 'bold'
  },
  currencySymbol: {
    paddingLeft: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 10,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#f2f2f2'
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500'
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#24a5f7'
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600'
  }
});

export default EditFieldModal;