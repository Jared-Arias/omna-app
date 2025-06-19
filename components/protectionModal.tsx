import { getProtectedData } from '@/services/auth/userDataController/authService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface ProtectionModalProps {
  isVisible: boolean;
  onAccept: () => void;
  onClose: () => void;
}

const ProtectionModal: React.FC<ProtectionModalProps> = ({ 
    isVisible, 
    onAccept, 
    onClose 
  }) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const webViewRef = useRef(null);

  const [terms, setTerms] = useState<string>('');
    useEffect(() => {
      const fetchTerms = async () => {
        const res = await getProtectedData();
        setTerms(res.data);
      };
      fetchTerms();
    }, []);
    // HTML content para mostrar en el WebView
    const htmlContent = `
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 10px;
        line-height: 1.5;
        padding: 5px;
        margin: 0;
      }
      p {
        margin-bottom: 16px;
      }
      h1 {
        font-size: 22px;
      }
      h2 {
        font-size: 20px;
      }
    </style>
  </head>
  <body>
    ${terms}
  </body>
  </html>`;

  // Función para verificar si el usuario ha llegado al final del scroll
  const onScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20; // Ajuste para considerar que está cerca del final
    
    if (layoutMeasurement.height + contentOffset.y >= 
        contentSize.height - paddingToBottom) {
      setIsScrolledToBottom(true);
    }
  };

  // Script para inyectar en WebView y detectar scroll
  const INJECTED_JAVASCRIPT = `
    window.addEventListener('scroll', function() {
      if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 20) {
        window.ReactNativeWebView.postMessage("REACHED_BOTTOM");
      }
    });
    true;
  `;

  // Manejador de mensajes desde WebView
  const onMessage = (event) => {
    const message = event.nativeEvent.data;
    if (message === "REACHED_BOTTOM") {
      setIsScrolledToBottom(true);
    }
  };

  // Reiniciar el estado de scroll cuando se cierra el modal
  const handleClose = () => {
    setIsScrolledToBottom(false);
    onClose();
  };

  // Manejar aceptación de términos
  const handleAccept = () => {
    setIsScrolledToBottom(false);
    onAccept();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          
          <View style={styles.webViewContainer}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: htmlContent }}
              style={styles.webView}
              injectedJavaScript={INJECTED_JAVASCRIPT}
              onMessage={onMessage}
              onScroll={onScroll}
              scrollEventThrottle={400}
              showsVerticalScrollIndicator={true}
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.acceptButton,
              {backgroundColor: isScrolledToBottom ? '#2196F3' : '#cccccc'}
            ]}
            disabled={!isScrolledToBottom}
            onPress={handleAccept}
          >
            <Text style={styles.acceptButtonText}>
              Acepto Protección de Datos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Ionicons name="close" size={30} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.8,
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
    marginBottom: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  webViewContainer: {
    width: '100%',
    height: '85%',
    marginBottom: 25,
    marginTop: 15,
  },
  webView: {
    flex: 1,
  },
  acceptButton: {
    width: '100%',
    borderRadius: 10,
    padding: 12,
    elevation: 2,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'red',
  },
  closeButtonText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default ProtectionModal;