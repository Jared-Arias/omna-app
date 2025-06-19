import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const LocationModal = ({
  isVisible,
  onClose,
  states,
  cities,
  onSelectState,
  onSelectCity,
  selectedState,
  selectedCity
}) => {
  const [activeTab, setActiveTab] = useState('state'); // 'state' o 'city'

  const handleStateSelect = (state) => {
    onSelectState(state);
    // Cambia automáticamente a la pestaña de ciudades después de seleccionar un estado
    setActiveTab('city');
  };

  const handleCitySelect = (city) => {
    onSelectCity(city);
    // Opcionalmente cerrar el modal después de seleccionar la ciudad
    onClose();
    setActiveTab('state'); // Regresar a la pestaña de estados
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar ubicación</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'state' ? styles.activeTab : null]}
              onPress={() => setActiveTab('state')}
            >
              <Text style={[styles.tabText, activeTab === 'state' ? styles.activeTabText : null]}>
                Comuna
                {selectedState ? `: ${selectedState.name}` : ''}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'city' ? styles.activeTab : null]}
              onPress={() => setActiveTab('city')}
              disabled={!selectedState}
            >
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === 'city' ? styles.activeTabText : null,
                  !selectedState ? styles.disabledTabText : null
                ]}
              >
                Ciudad
                {selectedCity ? `: ${selectedCity}` : ''}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === 'state' ? (
            <FlatList
              data={states}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem, 
                    selectedState?.name === item.name ? styles.selectedItem : null
                  ]}
                  onPress={() => handleStateSelect(item)}
                >
                  <Text style={styles.itemName}>{item.name}</Text>
                  {selectedState?.name === item.name && (
                    <Feather name="check" size={20} color="#24a5f7" />
                  )}
                </TouchableOpacity>
              )}
            />
          ) : (
            selectedState ? (
              <FlatList
                data={cities}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.listItem,
                      selectedCity === item ? styles.selectedItem : null
                    ]}
                    onPress={() => handleCitySelect(item)}
                  >
                    <Text style={styles.itemName}>{item}</Text>
                    {selectedCity === item && (
                      <Feather name="check" size={20} color="#24a5f7" />
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Seleccione una comuna primero</Text>
              </View>
            )
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center'
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#24a5f7'
  },
  tabText: {
    fontSize: 14,
    color: '#666'
  },
  activeTabText: {
    color: '#24a5f7',
    fontWeight: '600'
  },
  disabledTabText: {
    color: '#ccc'
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  selectedItem: {
    backgroundColor: '#f9f9f9'
  },
  itemName: {
    fontSize: 16,
    color: '#333'
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    color: '#666',
    fontSize: 15,
    fontStyle: 'italic'
  }
});

export default LocationModal;