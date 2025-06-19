import CustomHeader from '@/components/customHeader';
import { getEscuelaBySlug } from '@/services/auth/userDataController/authService';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

// Función para extraer el ID del video de YouTube
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

const Details_escuela= () => {
  const { slug} = useLocalSearchParams();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      if (!slug) return;

      const fetchSessions = async () => {
        try {
          setLoading(true);
          setError(null);

          const res = await getEscuelaBySlug(slug.toString());
          console.log('Session Details:', res.data);
          setSessionDetails(res.data);
        } catch (err) {
          console.error('Error fetching session details:', err);
          setError('Error al cargar los detalles de la sesión');
        } finally {
          setLoading(false);
        }
      };

      fetchSessions();
    }, [slug])
  );

  const renderYouTubeVideo = (url) => {
    if (!url || sessionDetails?.active_video !== "1") return null;

    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    console.log('YouTube Embed URL:', embedUrl);
    return (
      <View style={styles.videoContainer}>
        <WebView
          originWhitelist={['*']}
          source={{
        html: `
          <html>
            <body style="margin:0;padding:0;overflow:hidden;">
          <iframe
            width="100%"
            height="100%"
            src="${embedUrl}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            style="border-radius:12px;"
          ></iframe>
            </body>
          </html>
        `
          }}
          style={styles.video}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.maincontainer}>
      <CustomHeader />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Cargando detalles del curso...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {sessionDetails && !loading && (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.contentContainer}>

            {/* Imagen principal */}
            {sessionDetails.imagen_url_banner && (
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: `https://omna.life/admin${sessionDetails.imagen_url_banner}`
                  }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Título */}
            <Text style={styles.title}>{sessionDetails.titulo}</Text>

            {/* Descripción corta */}
            <Text style={styles.description}>{sessionDetails.contenido}</Text>

            {/* Video de YouTube */}
            {renderYouTubeVideo(sessionDetails.url_youtube)}

            {/* Descripción larga */}
            <View style={styles.longDescriptionContainer}>
              <Text style={styles.longDescription}>{sessionDetails.contenido_largo}</Text>
            </View>

            {/* Boton comprar sesion */}
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() =>
              router.push({
                pathname: '/purchase-escuela',
                params: {
                escuelaId: sessionDetails.id?.toString(),
                amountUSD: sessionDetails.precio?.toString(),
                },
              })
              }
            >
              <Text style={styles.buyButtonText}>Comprar curso</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Details_escuela;

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: '#FAF6ED'
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF6ED',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8B4513',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
    textAlign: 'center',
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mainImage: {
    width: '100%',
    height: 200,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#5D4037',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  videoContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  video: {
    width: width - 40,
    height: (width - 40) * 9 / 16,
    alignSelf: 'center',
    borderRadius: 12,
  },
  longDescriptionContainer: {
    backgroundColor: '#FFECD5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  longDescriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 10,
  },
  longDescription: {
    fontSize: 16,
    color: '#5D4037',
    lineHeight: 22,
    textAlign: 'justify',
  },
  additionalInfo: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    
  },
  infoText: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 5,
    fontWeight: '500',
  },
  buyButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 120,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
