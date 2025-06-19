import { add_Limit_Instagram, add_Limit_Whatsapp } from '@/services/auth/userDataController/authService';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ContactModalProps {
  isVisible: boolean;
  onClose: () => void;
  nombrePersona?: string;
  id?: string;
  avatar?: string;
  phone?: string;
  whatsapp_limit_complete: boolean;
  instagram?: string;
  instagram_limit_complete: boolean;
}

const ContactModal: React.FC<ContactModalProps> = ({ isVisible, onClose, nombrePersona = "Gustavo Fernandez", id = '', avatar= '|', phone = '', instagram = '', whatsapp_limit_complete = false, instagram_limit_complete = false }) => {
  console.log('ContactModal Props:', { isVisible, onClose, nombrePersona, id, avatar, phone, instagram, whatsapp_limit_complete, instagram_limit_complete });
  const handleWhatsAppPress = async () => {
    const res =await add_Limit_Whatsapp(id);
    console.log('WhatsApp Limit Response:', res.data);

    const whatsappUrl = `whatsapp://send?phone=+34${phone}`;
    const webWhatsappUrl = `https://wa.me/${phone}`;

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          return Linking.openURL(webWhatsappUrl);
        }
      })
      .catch((err) => console.error("An error occurred", err));
    onClose();
  };

  const handleMessagePress = () => {
     router.push({
                pathname: '/chat',
                params: { 
                    id: id,
                    name: nombrePersona,
                    avatar: JSON.stringify(avatar) // Pasamos la ruta como string
                }})
                onClose();
  };

  const handleInstagramPress = async () => {
    await add_Limit_Instagram(id);

    const appInstagramUrl = `instagram://user?username=${instagram}`;
    const webInstagramUrl = `https://instagram.com/${instagram}`;

    Linking.canOpenURL(appInstagramUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(appInstagramUrl);
        } else {
          return Linking.openURL(webInstagramUrl);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="close" size={26} color="#FF0000" />
          </TouchableOpacity>
          <Image source={require('@/assets/logo2.png')} style={{ width: 30, height: 35 , resizeMode: 'contain', marginBottom: 8}} />
          <Text style={styles.title}>¿Cómo deseas Contactar a {nombrePersona}?</Text>
          
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.contactButton} onPress={handleMessagePress}>
              <FontAwesome name="comment" size={42} color="white" />
            </TouchableOpacity>
            {!whatsapp_limit_complete && (
            <TouchableOpacity style={styles.contactButton} onPress={handleWhatsAppPress}>
              <FontAwesome name="whatsapp" size={42} color="white" />
            </TouchableOpacity>
            )}
            {!instagram_limit_complete && (
            <TouchableOpacity style={styles.contactButton} onPress={handleInstagramPress}>
              <AntDesign name="instagram" size={42} color="white" />
            </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>Enviar Mensaje</Text>
            {!whatsapp_limit_complete && (
            <Text style={styles.subtitle}>Contactar WhatsApp</Text>
            )}
            {!instagram_limit_complete && (
            <Text style={styles.subtitle}>Ir a su Instagram</Text>
            )}
          </View>
          
          <View style={styles.logoContainer}>
           <Image source={require('@/assets/logoadmin.png')} style={{ width: 150, height: 150 , resizeMode: 'contain'}} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: 'white',
    position: 'absolute',
    top: -6,
    right: -6,
    borderWidth: 3,
    borderColor: '#FF0000',
    borderRadius: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  contactButton: {
    backgroundColor: '#192841',
    width: 80,
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    width: '33%',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: -60
  },
  poweredBy: {
    fontSize: 12,
    color: '#999',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#192841',
  },
});

export default ContactModal;