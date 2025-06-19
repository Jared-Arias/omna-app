import CustomHeader from '@/components/customHeader';
import { getAbout, getBlog, getEscuela, getSessions } from '@/services/auth/userDataController/authService';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router, useFocusEffect } from 'expo-router';
import React from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const serviceCardWidth = width * 0.7; // 70% of screen width for service cards
const eventCardWidth = width * 0.8; // 80% of screen width for event cards

const HomeScreen = () => {
  // State for services (sessions) data
  const [servicesData, setServicesData] = React.useState([]);
  const [blogsData, setBlogsData] = React.useState([]); // Estado para blogs dinámicos
  const [escuelaData, setEscuelaData] = React.useState([]); // Estado para escuela
  const [baseUrl, setBaseUrl] = React.useState('');
  const [blogBaseUrl, setBlogBaseUrl] = React.useState(''); // URL base para las imágenes del blog
  const [heroTitle, setHeroTitle] = React.useState('');
  const [heroSlogan, setHeroSlogan] = React.useState('');
  const [heroImage, setHeroImage] = React.useState('');
  
  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month} ${year}`;
  };
  
  useFocusEffect(
    React.useCallback(() => {
      // This will be called when the screen is focused
      const fetchSessions = async () => {
        const res = await getSessions();
        const res1 = await getAbout();
        const res2 = await getBlog();
        const res3 = await getEscuela();
        // Procesar datos del blog
        if (res2.success && res2.data && Array.isArray(res2.data)) {
          
          // Transformar los datos del blog al formato que necesita la vista
          const transformedBlogs = res2.data.map(blog => ({
            id: blog.id,
            date: formatDate(blog.fecha_publicacion),
            title: blog.titulo,
            image: blog.imagen_url, // La URL completa se construirá con baseUrl
            categoria: blog.categoria,
            slug: blog.slug,
            vistas: blog.numero_vistas,
            comentarios: blog.numero_comentarios
          }));
          
          setBlogsData(transformedBlogs);
          
          // Si necesitas una URL base específica para las imágenes del blog,
          // puedes extraerla de la respuesta o usar la misma que para las sesiones
          setBlogBaseUrl(res1.data?.url || ''); // Ajusta según tu API
        }
        
        if (res1.data && Array.isArray(res1.data["0"]) && res1.data["0"][0]) {
            setHeroTitle(res1.data["0"][0].contenido);
            setHeroSlogan(res1.data["0"][0].text_eslogan);
            setHeroImage(res1.data.url + res1.data["0"][0].imagen_igor_vera_app);
            setBlogBaseUrl(res1.data.url); // Usar la misma URL base
        }
        if (res.data) {
          // Properly extract the array of services and the URL
          if (res.data["0"] && Array.isArray(res.data["0"])) {
            setServicesData(res.data["0"]);
          }
          if (res.data.url) {
            setBaseUrl(res.data.url);
          }
        }
        if (res3.data.data && Array.isArray(res3.data.data)) {
          const transformedEscuela = res3.data.data.map(item => ({
            id: item.id,
            date: formatDate(item.fecha_publicacion),
            title: item.titulo,
            image: item.imagen_url, // La URL completa se construirá con baseUrl
            slug: item.slug,
            descripcion_corta: item.contenido,
            descripcion_larga: item.contenido_largo,
            precio: item.precio
          }));
          setEscuelaData(transformedEscuela);
          
        }
      };
      fetchSessions();
      return () => {
        setServicesData([]);
        setBlogsData([]);
        setEscuelaData([]);
        setHeroTitle('');
        setHeroSlogan('');
        setHeroImage('');
      };
    }, [])
  );

  // Render service item for FlashList - CORREGIDO
  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() =>
        router.push({
          pathname: '/details_sesiones/[id]',
          params: { sessionId: item.id?.toString?.() ?? String(item.id) }
        })
      }
    >
      <Image 
        source={{ uri: baseUrl + item.imagen }} 
        style={styles.serviceImage} 
        resizeMode="cover"
      />
      <Text style={styles.serviceTitle} numberOfLines={2} ellipsizeMode="tail">
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  // Render event item for FlashList - Ahora usando datos dinámicos
  const renderEventItem = ({ item }) => (
    <TouchableOpacity style={[styles.eventCard, { width: eventCardWidth - 140 }]}  
    onPress={() =>
        router.push({
          pathname: '/details_blog/[id]',
          params: { slug: item.slug?.toString?.() ?? String(item.slug) }
        })
      }>
      <View style={styles.eventDateContainer}>
        <Ionicons name="calendar-outline" size={16} color="#DCA54C" />
        <Text style={styles.eventDateText}>{item.date}</Text>
      </View>
      <Text style={styles.eventTitle} numberOfLines={2} ellipsizeMode='tail'>{item.title}</Text>
      <View style={{ marginHorizontal: -10 }}>
        <Image 
          source={{ uri: 'https://omna.life/admin' + item.image }} 
          style={styles.eventImage} 
        />
      </View>
      <View style={styles.readMoreContainer}>
        <Text style={styles.readMoreText}>Leer Más</Text>
        <Ionicons name="chevron-forward-outline" size={16} color="#333" style={{ marginLeft: 5 }} />
      </View>
    </TouchableOpacity>
  );

  const renderEscuelaItem = ({ item }) => (
  <TouchableOpacity 
    style={[styles.escuelaCard, { width: eventCardWidth - 140 }]}  
    onPress={() =>
      router.push({
        pathname: '/details_escuela/[id]',
        params: { slug: item.slug?.toString?.() ?? String(item.slug) }
      })
    }
    activeOpacity={0.9}
  >
    {/* Badge de "Curso" */}
    <View style={styles.courseBadge}>
      <Ionicons name="school-outline" size={12} color="white" />
      <Text style={styles.courseBadgeText}>CURSO</Text>
    </View>
    
    {/* Imagen con overlay gradient */}
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: 'https://omna.life/admin' + item.image }}
        style={styles.escuelaImage}
      />
      {/* Gradient overlay */}
      <View style={styles.imageOverlay} />
      
      {/* Precio destacado */}
      <View style={styles.priceTag}>
        <Text style={styles.priceText}>{item.precio}</Text>
      </View>
    </View>

    {/* Contenido del curso */}
    <View style={styles.courseContent}>
      <View style={styles.dateContainer}>
        <Ionicons name="time-outline" size={14} color="#DCA54C" />
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      
      <Text style={styles.courseTitle} numberOfLines={2} ellipsizeMode='tail'>
        {item.title}
      </Text>
      
      {item.descripcion_corta && (
        <Text style={styles.courseDescription} numberOfLines={2} ellipsizeMode='tail'>
          {item.descripcion_corta}
        </Text>
      )}
      
      {/* CTA Button */}
      <View style={styles.ctaContainer}>
        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>¡Inscríbete Ya!</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </View>
      </View>
    </View>
    
    {/* Shine effect */}
    <View style={styles.shineEffect} />
  </TouchableOpacity>
);


  return (
    <SafeAreaView style={styles.mainContainer}>
      <CustomHeader />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.profileContainer}>
            <Image 
              source={{ uri: heroImage }} 
              style={styles.profileImage} 
            />
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroSlogan}>{heroSlogan}</Text>
            <Image 
              source={require('@/assets/images/principal/sol.png')} 
              style={styles.sunIcon} 
            />
          </View>
        </View>
        
        {/* Banner Section */}
        <View style={styles.bannerSection}>
          <Image
            source={require('@/assets/images/principal/banner.png')}
            style={[StyleSheet.absoluteFill, { width: '100%', height: 200}]}
            resizeMode="stretch"
          />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', height: 200, paddingHorizontal: 40 }}>
            <View style={styles.bannerLeftContent}>
              <Image 
                source={require('@/assets/images/principal/manos.png')} 
                style={styles.energyHandsImage} 
              />
            </View>
            <TouchableOpacity style={styles.bookingButton}>
              <Text style={styles.bookingButtonText}>Agendar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Sessions Section */}
        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>Sesiones que pueden interesarte</Text>
          <Image
            source={require('@/assets/images/principal/linea.png')}
            style={styles.decorativeLine}
          />

          {/* Services Row - Using FlashList */}
          <View style={styles.flashListContainer}>
            {servicesData.length > 0 && (
              <FlashList
                data={servicesData}
                renderItem={renderServiceItem}
                estimatedItemSize={140} // Ajustado al nuevo ancho
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flashListContent}
                keyExtractor={(item) => item.id.toString()}
              />
            )}
          </View>
          <View style={{ marginTop: -60 }}/>
           <Text style={styles.sectionTitle}>Cursos destacados</Text>
          <Image
            source={require('@/assets/images/principal/linea.png')}
            style={styles.decorativeLine}
          />

          {/* Events - Using FlashList with Dynamic Data */}
          <View style={[styles.flashListContainer, {height: 230}]}>
            {escuelaData.length > 0 && (
              <FlashList
                data={escuelaData}
                renderItem={renderEscuelaItem}
                estimatedItemSize={eventCardWidth}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flashListContent}
                keyExtractor={(item) => item.id.toString()}
              />
            )}
          </View>
            <View style={{ marginTop: 40 }}/>
             <Text style={styles.sectionTitle}>Blogs mas visitados</Text>
          <Image
            source={require('@/assets/images/principal/linea.png')}
            style={styles.decorativeLine}
          />
          {/* Events - Using FlashList with Dynamic Data */}
          <View style={[styles.flashListContainer, {height: 230}]}>
            {blogsData.length > 0 && (
              <FlashList
                data={blogsData}
                renderItem={renderEventItem}
                estimatedItemSize={eventCardWidth}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flashListContent}
                keyExtractor={(item) => item.id.toString()}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAF6ED',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 200,
  },
  heroSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profileContainer: {
    width: '30%',
    marginRight: 10,
    marginTop: -50,

  },
  profileImage: {
    width: 120,
    height: 130,
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  heroTextContainer: {
    width: '70%',
    paddingLeft: 10,
  },
  heroTitle: {
    fontSize: 14,
    color: '#DCA54C',
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular'
  },
  heroSlogan: {
    fontSize: 28,
    fontFamily: 'BrushScript',
    color: '#DCA54C',
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  sunIcon: {
    width: 50,
    height: 50,
    alignSelf: 'center',
  },
  bannerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -25,
  },
  bannerLeftContent: {
    flex: 1,
    alignItems: 'center',
  },
  energyHandsImage: {
    width: 144,
    height: 145,
    marginLeft: -48,
    marginTop: -25,
    resizeMode: 'contain',
  },
  bookingButton: {
    backgroundColor: '#DCA54C',
    padding: 12,
    borderRadius: 25,
    paddingHorizontal: 22,
    marginBottom: 40,
    marginRight: 10
  },
  bookingButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sessionsSection: {
    marginTop: -15,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#DCA54C',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  decorativeLine: {
    alignSelf: 'center',
    marginBottom: 20,
    width: 180,
    resizeMode: 'contain',
    marginTop: -6,
  },
  flashListContainer: {
    height: 250
  },
  flashListContent: {
    paddingHorizontal: 2,
  },
  // ESTILOS CORREGIDOS PARA SERVICE CARDS
  serviceCard: {
    marginHorizontal: 8,
    alignItems: 'center',
    width: 170, // Ancho fijo para la tarjeta
  },
  serviceImage: {
    width: 170, // Ancho fijo para la imagen
    height: 110, // Alto fijo para la imagen
    borderRadius: 10,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#DCA54C',
    fontWeight: '500',
    width: 150, // Ancho fijo para el texto
  },
  // ESTILOS PARA EVENT CARDS
  eventCard: {
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 230,
    marginTop: -1
  },
  eventDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  eventTitle: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  eventImage: {
    width: '100%',
    height: 100,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  readMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  readMoreText: {
    fontSize: 10,
    color: '#333',
    marginRight: 5,
  },
  readMoreArrow: {
    width: 18,
    height: 18,
    tintColor: '#333',
  },
   escuelaCard: {
    marginHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#DCA54C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    height: 230,
    overflow: 'hidden',
    position: 'relative',
    transform: [{ scale: 1 }],
  },
  
  courseBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#DCA54C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 3,
  },
  
  courseBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  
  imageContainer: {
    position: 'relative',
    height: 80,
  },
  
  escuelaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    background: 'rgba(0,0,0,0.3)',
  },
  
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  priceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  courseContent: {
    padding: 16,
    flex: 1,
  },
  
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  dateText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2C3E50',
    lineHeight: 20,
  },
  
  courseDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
    marginBottom: 92,
  },
  
  ctaContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  
  ctaButton: {
    backgroundColor: '#DCA54C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: '#DCA54C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  
  ctaText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
    letterSpacing: 0.5,
  },
  
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 50,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ skewX: '-20deg' }],
}
});