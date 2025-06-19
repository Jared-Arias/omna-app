import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import {
    BackHandler,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const MembershipSelectionModal = ({ 
  visible, 
  onClose, 
  memberships = [], 
  onSelectMembership,
  currentMembership = 'Free'
}) => {
  // Efecto para manejar el botón de retroceso en Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  // Función para formatear precios
  const formatPrice = (value) => {
    return `$${value.toFixed(2)}`;
  };

  // Función para obtener el precio más bajo por membresía
  const getLowestPrice = (prices) => {
    if (!prices || prices.length === 0) return 0;
    if (prices[0].value === 0) return 'Gratis';
    
    // Encuentra el precio más bajo para duración mensual (duración: 1)
    const monthlyPrice = prices.find(p => p.duration === 1);
    if (monthlyPrice) {
      return `${formatPrice(monthlyPrice.value)}/mes`;
    }
    
    // Si no hay mensual, usa el precio más bajo
    const lowestPrice = prices.reduce((min, p) => 
      p.value < min.value ? p : min, prices[0]);
    
    return `${formatPrice(lowestPrice.value)}/${lowestPrice.duration} meses`;
  };

  // Función para determinar si la membresía es la actualmente seleccionada
  const isCurrentMembership = (name) => {
    return currentMembership && currentMembership.toLowerCase() === name.toLowerCase();
  };

  const handleMembershipSelection = (membershipName) => {
    // Verificamos que no sea la membresía actual
    if (!isCurrentMembership(membershipName)) {
      onSelectMembership(membershipName);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={90} style={styles.blur}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Selecciona tu Membresía</Text>
            <Text style={styles.modalSubtitle}>Elige el plan que mejor se adapte a tus necesidades</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <ScrollView style={styles.membershipList}>
              {memberships.map((membership) => (
                <TouchableOpacity
                  key={membership.id}
                  style={[
                    styles.membershipCard,
                    isCurrentMembership(membership.name) && styles.currentMembershipCard,
                    membership.vip && styles.vipMembershipCard
                  ]}
                  onPress={() => handleMembershipSelection(membership.name)}
                  disabled={isCurrentMembership(membership.name)}
                >
                  {membership.vip && (
                    <View style={styles.vipBadge}>
                      <Text style={styles.vipText}>VIP</Text>
                    </View>
                  )}
                  
                  <View style={styles.membershipHeader}>
                    <Text style={[
                      styles.membershipName,
                      membership.vip && styles.vipMembershipName
                    ]}>
                      {membership.name}
                    </Text>
                    {/* <Text style={styles.membershipPrice}>
                      {getLowestPrice(membership.prices)}
                    </Text> */}
                  </View>
                  
                  <View style={styles.membershipDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Límite de contactos:</Text>
                      <Text style={styles.detailValue}>{membership.contact_limit}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>WhatsApp:</Text>
                      <Text style={styles.detailValue}>{membership.whatsapp_limit}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Instagram:</Text>
                      <Text style={styles.detailValue}>{membership.instagram_limit}</Text>
                    </View>
                  </View>
                  
                  {isCurrentMembership(membership.name) ? (
                    <View style={styles.currentPlanBadge}>
                      <Text style={styles.currentPlanText}>Plan Actual</Text>
                    </View>
                  ) : (
                    <View style={styles.selectButton}>
                      <Text style={styles.selectButtonText}>Seleccionar</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
  },
  modalView: {
    width: width * 0.9,
    maxHeight: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#222',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  membershipList: {
    width: '100%',
    maxHeight: '90%',
  },
  membershipCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    position: 'relative',
  },
  currentMembershipCard: {
    borderColor: '#188cfd',
    borderWidth: 2,
    backgroundColor: '#f0f7ff',
  },
  vipMembershipCard: {
    backgroundColor: '#fff8e6',
    borderColor: '#e6d664',
    borderWidth: 1,
  },
  vipBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e6d664',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  vipText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  membershipName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#188cfd',
  },
  vipMembershipName: {
    color: '#e6b800',
  },
  membershipPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  membershipDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    fontWeight: '500',
  },
  currentPlanBadge: {
    backgroundColor: '#188cfd',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  currentPlanText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectButton: {
    backgroundColor: '#e6d664',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  selectButtonText: {
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f1f1f1f1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'red',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'red',
  },
});

export default MembershipSelectionModal;