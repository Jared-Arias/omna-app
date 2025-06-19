import { getMembresias, pagarConBizum, pagarConGooglePay, pagarConRedireccion } from '@/services/auth/userDataController/authService';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Portal } from 'react-native-paper';
const { width } = Dimensions.get('window');

const MembershipBottomSheet = React.forwardRef(({ close, membershipType, ...props }: { close: () => void, membershipType?: string }, ref) => {
  // Estado para el plan seleccionado
  const [selectedPlan, setSelectedPlan] = useState<number | null>(0);
  // Estado para almacenar las membresías obtenidas de la API
  const [memberships, setMemberships] = useState([]);
  // Estado para almacenar la membresía filtrada según el tipo recibido
  const [filteredMembership, setFilteredMembership] = useState(null);
  // Estado para la duración seleccionada de cada membresía
  const [selectedDurations, setSelectedDurations] = useState({});
  const [loading, setLoading] = useState(true);
  // Estado para mostrar las opciones de pago
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  // Estado para almacenar el plan y precio seleccionado para pago
  const [selectedPaymentInfo, setSelectedPaymentInfo] = useState(null);
  
  const handleClose = () => {
    setSelectedPlan(null);
    setShowPaymentOptions(false);
    close();
  }
  
  // Estado para el slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView | null>(null);

  // ref
  const bottomSheetRef = useRef<BottomSheetModal | null>(null);
  const expand = () => { bottomSheetRef.current?.present(); };
  const collapse = (): void => { bottomSheetRef.current?.close(); setSelectedPlan(null); };

  useImperativeHandle(ref, () => ({
    present: expand,
    close: collapse
  }));

  const logFullObject = (label, obj) => {
    console.log(`${label}:`, JSON.stringify(obj, null, 2));
  };

  useFocusEffect(
    useCallback(() => {
      const getMembresiasProfesionales = async () => {
        try {
          setLoading(true);
          const response = await getMembresias();
          //logFullObject('Membresías completas', response.data);
    
          if (response.success && response.data) {
            // Guardamos todas las membresías
            setMemberships(response.data);
            
            // Si se especificó un tipo de membresía, filtramos solo ese tipo
            if (membershipType) {
              // Convertimos a minúsculas para evitar problemas con mayúsculas/minúsculas
              const membershipTypeLower = membershipType.toLowerCase();
              
              // Imprimimos cada membresía para debug
              response.data.forEach(membership => {
                console.log(`Comparando: ${membership.name.toLowerCase()} con ${membershipTypeLower}`);
              });
              
              const matchedMembership = response.data.find(
                membership => membership.name.toLowerCase() === membershipTypeLower
              );
              
              console.log('Membresía encontrada:', matchedMembership);
              
              if (matchedMembership) {
                // Almacenamos la membresía filtrada
                setFilteredMembership(matchedMembership);
                
                // Inicializamos la duración seleccionada para esta membresía
                if (matchedMembership.prices && matchedMembership.prices.length > 0) {
                  setSelectedDurations({
                    [matchedMembership.id]: 0 // Seleccionamos el primer precio por defecto
                  });
                }
                
                setSelectedPlan(0); // Seleccionamos el único plan disponible
              } else {
                console.log('No se encontró ninguna membresía para el tipo:', membershipType);
              }
            } else {
              // Si no se especificó un tipo, inicializamos duraciones para todas las membresías
              const initialDurations = {};
              response.data.forEach(membership => {
                if (membership.prices && membership.prices.length > 0) {
                  initialDurations[membership.id] = 0;
                }
              });
              
              setSelectedDurations(initialDurations);
              // Seleccionamos por defecto la segunda membresía (índice 1) si existe
              setSelectedPlan(response.data.length > 1 ? 1 : 0);
            }
          }
        } catch (error) {
          console.error('Error al obtener las membresías:', error);
        } finally {
          setLoading(false);
        }
      };
      getMembresiasProfesionales();
    }, [membershipType])
  );

  // Auto-avance del slider
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollViewRef.current) {
        const nextSlide = (currentSlide + 1) % sliderImages.length;
        setCurrentSlide(nextSlide);
        scrollViewRef.current.scrollTo({ x: nextSlide * width, animated: true });
      }
    }, 3000); // Cambiar cada 3 segundos
    
    return () => clearInterval(interval);
  }, [currentSlide]);

  // Manejar el desplazamiento manual
  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== currentSlide) {
      setCurrentSlide(newIndex);
    }
  };

  // Manejar selección de duración para un plan específico
  const handleDurationSelect = (membershipId, durationIndex) => {
    setSelectedDurations(prev => ({
      ...prev,
      [membershipId]: durationIndex
    }));
  };

  const handlePayByBizum = async (membresia_id, price, duration) => {
    try {
      const res = await pagarConBizum(membresia_id, price, duration);
      if (res.data) {
        try {
          handleClose();
          await WebBrowser.openBrowserAsync(res.data)
        } catch {
          Alert.alert('Lo sentimos', 'No se pudo abrir el enlace de recarga. Por favor, intenta de nuevo.')
        }
      } else {
        Alert.alert('Lo sentimos', 'pasó algo inesperado por favor intentalo más tarde.')
      }
    }
    catch (error) {
      console.error('Error al procesar el pago con Bizum:', error);
      Alert.alert('Error', 'No se pudo procesar el pago. Por favor, intenta de nuevo más tarde.');
    }
  }

  const handlePayByGooglePay = async (membresia_id, price, duration) => {
    try {
      const res = await pagarConGooglePay(membresia_id, price, duration);
      if (res.data) {
        handleClose();
        await WebBrowser.openBrowserAsync(res.data);
      } else {
        Alert.alert('Error', 'No se pudo procesar el pago. Por favor, intenta de nuevo más tarde.');
      }
    } catch (error) {
      console.error('Error al procesar el pago con Google Pay:', error);
      Alert.alert('Error', 'No se pudo procesar el pago. Por favor, intenta de nuevo más tarde.');
    }
  }

  const handlePayByRedireccion = async (membresia_id, price, duration) => {
    try {
      const res = await pagarConRedireccion(membresia_id, price, duration);
      if (res.data) {
        handleClose();
        await WebBrowser.openBrowserAsync(res.data);
      } else {
        Alert.alert('Error', 'No se pudo procesar el pago. Por favor, intenta de nuevo más tarde.');
      }
    } catch (error) {
      console.error('Error al procesar el pago con redirección:', error);
      Alert.alert('Error', 'No se pudo procesar el pago. Por favor, intenta de nuevo más tarde.');
    }
  }

  // Manejar continuación con el plan seleccionado
  const handleContinue = () => {
    let selectedMembership;
    let selectedDurationIndex;
    let selectedPriceObj;

    // Si tenemos una membresía filtrada, usamos esa
    if (filteredMembership) {
      selectedMembership = filteredMembership;
      selectedDurationIndex = selectedDurations[filteredMembership.id] || 0;
      selectedPriceObj = filteredMembership.prices[selectedDurationIndex];
    } 
    // Si no, usamos la selección normal
    else if (selectedPlan !== null && memberships.length > 0) {
      selectedMembership = memberships[selectedPlan];
      selectedDurationIndex = selectedDurations[selectedMembership.id] || 0;
      selectedPriceObj = selectedMembership.prices && selectedMembership.prices[selectedDurationIndex];
    } else {
      // Opcional: mostrar un mensaje de que debe seleccionar un plan
      alert('Por favor, selecciona un plan de membresía');
      return;
    }
    
    // Guardar la información del plan seleccionado para usar en los métodos de pago
    setSelectedPaymentInfo({
      membershipId: selectedMembership.id,
      price: selectedPriceObj.value,
      duration: selectedPriceObj.duration
    });
    
    // Mostrar las opciones de pago
    setShowPaymentOptions(true);
  };

  // Formato para mostrar precios
  const formatPrice = (value) => {
    if (value === undefined || value === null) return '0,00 €';
    return value.toFixed(2).replace('.', ',') + ' €';
  };

  // Calcular precio mensual
  const calculateMonthly = (price, duration) => {
    if (!price || !duration || duration <= 0) return 0;
    return price / duration;
  };

  // Calcular descuento comparado con el precio mensual
  const calculateDiscount = (prices, selectedIndex) => {
    if (!prices || prices.length <= 1) return 0;
    
    const selectedPrice = prices[selectedIndex];
    if (!selectedPrice || selectedPrice.discount) {
      return selectedPrice?.discount || 0;
    }
    
    // Buscar el precio mensual (duración = 1)
    const monthlyPrice = prices.find(p => p.duration === 1);
    
    if (!monthlyPrice || !selectedPrice) return 0;
    
    // Calcular el descuento
    const effectiveMonthlyPrice = selectedPrice.value / selectedPrice.duration;
    const discount = ((monthlyPrice.value - effectiveMonthlyPrice) / monthlyPrice.value) * 100;
    
    return Math.round(discount);
  };

  // Imágenes para el slider - suponemos que tienes 3 imágenes diferentes
  const sliderImages = filteredMembership?.images?.length > 0 
    ? filteredMembership.images.map((image) => ({ uri: image }))
    : [
      require('@/assets/membership.png'),
      require('@/assets/membership.png'),
      require('@/assets/membership.png'),
    ];

  // Renderizar componente de métodos de pago
  const renderPaymentOptions = () => (
    <View style={styles.paymentOptionsContainer}>
      <Text style={styles.paymentTitle}>Selecciona un método de pago</Text>
      
      {/* Google Pay */}
      <TouchableOpacity 
        style={styles.paymentOption}
        onPress={() => handlePayByGooglePay(
          selectedPaymentInfo.membershipId,
          selectedPaymentInfo.price,
          selectedPaymentInfo.duration
        )}
      >
        <Image 
          source={require('@/assets/Google_Pay.png')} 
          style={styles.paymentIcon} 
          resizeMode="contain"
        />
      </TouchableOpacity>
      
      {/* Bizum */}
      <TouchableOpacity 
        style={styles.paymentOption}
        onPress={() => handlePayByBizum(
          selectedPaymentInfo.membershipId,
          selectedPaymentInfo.price,
          selectedPaymentInfo.duration
        )}
      >
        <Image 
          source={require('@/assets/Bizum.png')} 
          style={styles.paymentIcon} 
          resizeMode="contain"
        />
      </TouchableOpacity>
      
      {/* Redirección (Tarjeta) */}
      <TouchableOpacity 
        style={styles.paymentOption}
        onPress={() => handlePayByRedireccion(
          selectedPaymentInfo.membershipId,
          selectedPaymentInfo.price,
          selectedPaymentInfo.duration
        )}
      >
        <Image 
          source={require('@/assets/logovisa.png')} 
          style={{width: 50, height: 50, marginRight: 15, marginVertical: 5}} 
          resizeMode="contain"
        />
      </TouchableOpacity>
      
      {/* Botón para volver */}
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => setShowPaymentOptions(false)}
      >
        <Text style={styles.continueButtonText}>Seleccionar otro plan</Text>
      </TouchableOpacity>
      
            <TouchableOpacity 
              style={{ marginBottom: 40, marginTop: 10 }}
              onPress={() => {
                handleClose();
              }}
            >
              <Text style={styles.noThanksText}>NO, GRACIAS</Text>
            </TouchableOpacity>
    </View>
  );

  // renders
  const renderContent = (type: string) => (
    <BottomSheetView style={styles.contentContainer}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>MEMBRESIA</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image source={require('@/assets/logoservirealblanco.png')} style={{ width: 60, height: 60, resizeMode: 'contain', tintColor: 'white', marginTop: -30 }} />
            <Image source={require('@/assets/servi-real-text.png')} style={{ width: 130, height: 100, resizeMode: 'contain', tintColor: 'white' }} />
            <View style={[styles.container]}>
              <Text style={styles.text}>{type}</Text>
            </View>
        </View>
      </View>
      
      {showPaymentOptions ? (
        // Mostrar opciones de pago si showPaymentOptions es true
        renderPaymentOptions()
      ) : (
        // Mostrar contenido normal si showPaymentOptions es false
        <>
          {/* Slider de imágenes */}
          <View style={styles.sliderContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
            >
              {sliderImages.map((image, index) => (
                <View key={index} style={styles.slide}>
                  <Image source={image} style={styles.membershipImage} />
                </View>
              ))}
            </ScrollView>
            
            {/* Indicadores de posición del slider */}
            <View style={styles.paginationContainer}>
              {sliderImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentSlide === index && styles.activeDot
                  ]}
                />
              ))}
            </View>
          </View>
          
          <View style={{flex: 1, backgroundColor: '#f5f5f5f5', width: width, alignItems: 'center'}}>
            <View style={styles.plansContainer}>
              {!loading && (filteredMembership ? 
                // Si hay una membresía filtrada, mostrar solo sus duraciones como "planes"
                filteredMembership.prices && filteredMembership.prices.map((priceObj, index) => {
                  const membershipId = filteredMembership.id;
                  const price = priceObj.value || 0;
                  const duration = priceObj.duration || 1;
                  const monthly = calculateMonthly(price, duration);
                  const discount = priceObj.discount || 0;
                  
                  // No mostrar planes con duración negativa o indefinida
                  if (duration <= 0) return null;
                  
                  return (
                    <TouchableOpacity 
                      key={index} 
                      onPress={() => handleDurationSelect(membershipId, index)}
                      style={[
                        styles.planCard, 
                        selectedDurations[membershipId] === index && styles.highlightedPlan
                      ]}
                    >
                      {discount > 0 && selectedDurations[membershipId] === index && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>AHORRA UN {discount}%</Text>
                        </View>
                      )}
                      <Text style={styles.planDuration}>{duration}</Text>
                      <Text style={styles.planMounth}>{duration === 1 ? 'mes' : 'meses'}</Text>
                      <Text style={styles.planPrice}>{formatPrice(price)}</Text>
                      <Text style={styles.planMonthly}>({formatPrice(monthly)}/mes)</Text>
                    </TouchableOpacity>
                  );
                })
                : 
                // Si no hay filtro, mostrar todas las membresías como antes
                memberships.map((plan, index) => {
                  // Obtener la duración seleccionada para este plan
                  const selectedDurationIndex = selectedDurations[plan.id] || 0;
                  const selectedPriceObj = plan.prices && plan.prices[selectedDurationIndex];
                  
                  // Si no hay precios disponibles, no mostrar el plan
                  if (!plan.prices || plan.prices.length === 0) return null;
                  
                  const price = selectedPriceObj?.value || 0;
                  const duration = selectedPriceObj?.duration || 1;
                  const monthly = calculateMonthly(price, duration);
                  const discount = calculateDiscount(plan.prices, selectedDurationIndex);
                  
                  return (
                    <TouchableOpacity 
                      key={index} 
                      onPress={() => setSelectedPlan(index)}
                      style={[
                        styles.planCard, 
                        selectedPlan === index && styles.highlightedPlan
                      ]}
                    >
                      {discount > 0 && selectedPlan === index && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>AHORRA UN {discount}%</Text>
                        </View>
                      )}
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planPrice}>{formatPrice(price)}</Text>
                      <Text style={styles.planDuration}>{duration === -1 ? 'Ilimitado' : `${duration} ${duration === 1 ? 'mes' : 'meses'}`}</Text>
                      {duration > 0 && <Text style={styles.planMonthly}>({formatPrice(monthly)}/mes)</Text>}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
          
          <View style={{flex: 1, backgroundColor: 'white', width: width, alignItems: 'center',}}>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleContinue}
              disabled={loading}
            >
              <Text style={styles.continueButtonText}>CONTINUAR</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ marginBottom: 40, marginTop: 10 }}
              onPress={() => {
                handleClose();
              }}
            >
              <Text style={styles.noThanksText}>NO, GRACIAS</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </BottomSheetView>
  );

  return (
    <Portal>
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        enableDynamicSizing={true}
        enablePanDownToClose={true}
        
        handleIndicatorStyle={{ backgroundColor: 'white', width: 60, height: 4 }}
        handleStyle={{
          position: 'absolute', 
          top: 1, 
          left: 0, 
          right: 0, 
          zIndex: 1, 
          backgroundColor: 'transparent',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20, 
        }}
      >
        {renderContent(filteredMembership ? filteredMembership.name : (membershipType || 'Membresía'))}
      </BottomSheetModal>
      </BottomSheetModalProvider>
    </Portal>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5B041',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginLeft: 10,
    transform: [{ skewX: '0.20deg' }], 
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#77d2ff',
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: -25,
    marginTop: 10,
  },
  logoSubtext: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 150,
  },
  planCard: {
    width: '32%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#f0f0f0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  highlightedPlan: {
    borderColor: '#007bff',
    backgroundColor: 'white',
    borderWidth: 2,
    height: 150,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: -15,
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 15,
    width: 100
  },
  discountText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planDuration: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  planMounth: {
    fontSize: 18,
    color: '#666',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  planMonthly: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#007bff',
    width: '70%',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noThanksText: {
    color: 'grey',
    fontSize: 14,
  },
  sliderContainer: {
    width: width,
    height: 260,
    alignItems: 'center',
  },
  slide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membershipImage: {
    width: 200,
    height: 200,
    resizeMode: 'stretch'
  },
  paginationContainer: {
    flexDirection: 'row',
    marginBottom: 20
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cccccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#007bff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  actionsContainer: {
    width: width, 
    backgroundColor: 'white', 
    alignItems: 'center',
    paddingBottom: 40,
  },
  noThanksButton: {
    marginTop: 10,
  },
  // Estilos para opciones de pago
  paymentOptionsContainer: {
    width: width,
    backgroundColor: 'white',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    flex: 1,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
    color: '#333',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '90%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  paymentIcon: {
    width: 80,
    height: 80,
    marginVertical: -10,
    marginRight: 15,
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  backButton: {
    marginTop: 30,
    padding: 10,
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
  }
});

export default MembershipBottomSheet;