import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomCheckBox = ({ initialValue, onSelectionChange }) => {
  const [selectedOption, setSelectedOption] = useState(initialValue || 'professional');

  const handleSelect = (option) => {
    setSelectedOption(option);
    if (onSelectionChange) {
      onSelectionChange(option);
    }
  };

  useEffect(() => {
    if (initialValue) {
      setSelectedOption(initialValue);
    }
  }, [initialValue]);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.checkboxContainer, 
          selectedOption === 'professional' && styles.selectedContainer
        ]}
        onPress={() => handleSelect('professional')}
        activeOpacity={0.8}
      >
        <View style={[
          styles.checkbox,
          selectedOption === 'professional' && styles.selectedCheckbox
        ]}>
          {selectedOption === 'professional' && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </View>
        <Text style={styles.label}>Soy Profesional Independiente</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.checkboxContainer,
          selectedOption === 'company' && styles.selectedContainer
        ]}
        onPress={() => handleSelect('company')}
        activeOpacity={0.8}
      >
        <View style={[
          styles.checkbox,
          selectedOption === 'company' && styles.selectedCheckbox
        ]}>
          {selectedOption === 'company' && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </View>
        <Text style={styles.label}>Soy Empresa</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  selectedContainer: {
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9e9e9e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'white'
  },
  selectedCheckbox: {
    backgroundColor: '#43A047',
    borderColor: '#43A047',
  },
  label: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
});

export default CustomCheckBox;