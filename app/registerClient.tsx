import { Feather } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import CustomToast from '@/components/customToast';
import LegalModal from '@/components/legalModal';
import ProtectionModal from '@/components/protectionModal';
import TermsModal from '@/components/termsModal';

// Hooks & Services
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/services/auth/ctx';
import {
  extractFirstErrorMessage,
  formatDate,
  getCoutries,
  parseServerErrors
} from '@/services/auth/userDataController/authService';

// Constants
const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 60;
const TITLE_HEIGHT = 46;

const INITIAL_FORM_DATA = {
  first_name: '',
  last_name: '',
  birthdate: '',
  country: '',
  city: '',
  phone: '',
  email: '',
  password: '',
  password_confirmation: ''
};

const INITIAL_ERRORS = {
  first_name: '',
  last_name: '',
  birthdate: '',
  country: '',
  city: '',
  phone: '',
  email: '',
  password: '',
  password_confirmation: ''
};

// Field positions for auto-scroll
const FIELD_POSITIONS = {
  first_name: 200,
  last_name: 280,
  birthdate: 360,
  country: 460,
  state: 540,
  city: 620,
  phone: 700,
  email: 780,
  password: 860,
  password_confirmation: 940,
  terms: 1060,
  protection: 1120,
  legal: 1180
};

const RegisterClient = () => {
  // Hooks
  const { register } = useAuth();
  const navigation = useNavigation();
  const { toast, showToast, hideToast } = useToast();

  // Refs
  const scrollViewRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const inputRefs = {
    name: useRef(null),
    lastName: useRef(null),
    birthdate: useRef(null),
    country: useRef(null),
    city: useRef(null),
    phone: useRef(null),
    email: useRef(null),
    password: useRef(null),
    passwordConfirmation: useRef(null)
  };

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [date, setDate] = useState(new Date());

  // Modal states
  const [modals, setModals] = useState({
    terms: false,
    protection: false,
    legal: false,
    country: false,
    city: false,
    phone: false
  });

  // Selection states
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [phoneCode, setPhoneCode] = useState(null);
  const [profileImage, setProfileImage] = useState<{ uri: string; type: string; name: string } | null>(null);

  // Terms acceptance states
  const [termsAccepted, setTermsAccepted] = useState({
    terms: false,
    protection: false,
    legal: false
  });

  // Animated values
  const headerOpacity = useMemo(() =>
    scrollY.interpolate({
      inputRange: [170 - TITLE_HEIGHT, 170],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    }), [scrollY]
  );

  const backButtonOpacity = useMemo(() =>
    scrollY.interpolate({
      inputRange: [0, 50],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    }), [scrollY]
  );

  // Utility functions
  const formatDateWithoutTimezone = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const toggleModal = useCallback((modalName, isOpen = null) => {
    setModals(prev => ({
      ...prev,
      [modalName]: isOpen !== null ? isOpen : !prev[modalName]
    }));
  }, []);

  const acceptTerms = useCallback((type) => {
    setTermsAccepted(prev => ({ ...prev, [type]: true }));
    if (errors[type]) {
      setErrors(prev => ({ ...prev, [type]: '' }));
    }
    toggleModal(type, false);
  }, [errors, toggleModal]);

  // Date handling
  const onDateChange = useCallback((event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    const formattedDate = formatDateWithoutTimezone(currentDate);
    updateFormData('birthdate', formattedDate);
  }, [date, formatDateWithoutTimezone, updateFormData]);

  const showDatePicker = useCallback(() => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: onDateChange,
      mode: 'date',
      is24Hour: true,
    });
  }, [date, onDateChange]);

  // Country/City selection
  const handleSelectCountry = useCallback((country) => {
    setSelectedCountry(country);
    setPhoneCode(country.phonecode);
    updateFormData('country', country.name);
    setCities(country.cities || []);
    setSelectedCity(null); // Reset city when country changes
    updateFormData('city', '');
    toggleModal('country', false);
  }, [updateFormData, toggleModal]);

  const handleSelectCity = useCallback((city) => {
    setSelectedCity(city);
    updateFormData('city', city.name);
    toggleModal('city', false);
  }, [updateFormData, toggleModal]);

  
   interface ImagePickerAsset {
        uri: string;
        type: string;
        name: string;
      }

      const handleImagePicker = async () => {
          try {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'], 
              allowsEditing: true,
              quality: 1,
              aspect:  [1, 1] ,
            });
      
            if (!result.canceled) {
              const image = {
                uri: result.assets[0].uri,
                type: 'image/jpeg',
                name:  'profile_image.jpg',
              };
              setProfileImage(image);
              if (image?.uri) {
                const fileExt = image.uri.split('.').pop() || 'jpg';
                const profileImageFile = {
                    uri: image.uri,
                    type: 'image/jpeg',
                    name: `profile_image_${Date.now()}.${fileExt}`,
                };
                setFormData({...formData, profile_image: profileImageFile as any});
            }
            }
          } catch (error) {
            console.error('Image selection error:', error);
            showToast('No ha seleccionado la imagen de perfil', 'error');
          }
      };

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = { ...INITIAL_ERRORS };
    const errorMessages = [];
    let firstErrorField = null;

    const validations = [
      {
        field: 'first_name',
        condition: !formData.first_name.trim(),
        message: 'Nombre es requerido'
      },
      {
        field: 'last_name',
        condition: !formData.last_name.trim(),
        message: 'Apellido es requerido'
      },
      {
        field: 'birthdate',
        condition: !formData.birthdate.trim(),
        message: 'Fecha de nacimiento es requerida'
      },
      {
        field: 'country',
        condition: !formData.country.trim(),
        message: 'País es requerido'
      },
      {
        field: 'city',
        condition: !formData.city.trim(),
        message: 'Ciudad es requerida'
      },
      {
        field: 'phone',
        condition: !formData.phone.trim(),
        message: 'Teléfono es requerido'
      },
      {
        field: 'email',
        condition: !formData.email.trim(),
        message: 'Email es requerido'
      },
      {
        field: 'password',
        condition: !formData.password,
        message: 'Contraseña es requerida'
      },
      {
        field: 'password_confirmation',
        condition: !formData.password_confirmation,
        message: 'Confirmación de contraseña es requerida'
      }
    ];

    // Special validations
    if (formData.birthdate.trim()) {
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0) || 
          (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        validations.push({
          field: 'birthdate',
          condition: true,
          message: 'Debe ser mayor de 18 años'
        });
      }
    }

    if (formData.phone.trim() && !/^\d{6,12}$/.test(formData.phone.trim())) {
      validations.push({
        field: 'phone',
        condition: true,
        message: 'Ingrese un número de teléfono válido'
      });
    }

    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      validations.push({
        field: 'email',
        condition: true,
        message: 'Ingrese un email válido'
      });
    }

    if (formData.password && formData.password.length < 6) {
      validations.push({
        field: 'password',
        condition: true,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    if (formData.password !== formData.password_confirmation) {
      validations.push({
        field: 'password_confirmation',
        condition: true,
        message: 'Las contraseñas no coinciden'
      });
    }

    // Process validations
    validations.forEach(({ field, condition, message }) => {
      if (condition) {
        newErrors[field] = message;
        errorMessages.push(message);
        if (!firstErrorField) firstErrorField = field;
      }
    });

    setErrors(newErrors);

    // Scroll to first error
    if (firstErrorField && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: FIELD_POSITIONS[firstErrorField] - 100,
          animated: true
        });
      }, 100);
    }

    return { isValid: errorMessages.length === 0, errorMessages };
  }, [formData]);

  // Form submission
  const handleSignUp = useCallback(async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      showToast(`Errores en el formulario: ${validation.errorMessages.join(', ')}`, 'error');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Datos a enviar en register función en registerClient.tsx: ', formData);
      const response = await register(formData);
      
      if (response.status === 'success') {
        setTimeout(() => {
          showToast('Registro exitoso', 'success');
          setIsLoading(false);
        }, 2000);
      } else {
        const serverErrorsObj = parseServerErrors(response.message);
        if (serverErrorsObj) {
          const serverErrors = { ...errors };
          Object.keys(serverErrorsObj).forEach(key => {
            if (serverErrors.hasOwnProperty(key)) {
              const errorMessage = Array.isArray(serverErrorsObj[key])
                ? serverErrorsObj[key][0]
                : serverErrorsObj[key];
              serverErrors[key] = errorMessage;
            }
          });
          setErrors(serverErrors);
        } else {
          showToast(extractFirstErrorMessage(response.message), 'error');
        }
      }
    } catch (error) {
      showToast('Error en el registro', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, showToast, register, formData, errors]);

  // Effects
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesData = await getCoutries();
        if (countriesData?.data) {
          setCountries(countriesData.data);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        showToast('Error al cargar países', 'error');
      }
    };
    fetchCountries();
  }, [showToast]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Render helpers
  const renderCountrySelector = () => (
    <TouchableOpacity
      ref={inputRefs.country}
      style={styles.selectInput}
      onPress={() => toggleModal('country', true)}
    >
      {selectedCountry ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: selectedCountry.flag_url }}
            style={{ width: 24, height: 16, marginRight: 8 }}
          />
          <Text>{selectedCountry.name}</Text>
        </View>
      ) : (
        <Text style={styles.selectText}>Seleccione País</Text>
      )}
      <Feather name="chevron-down" size={24} color="#DCA54C" />
    </TouchableOpacity>
  );

  const renderCitySelector = () => (
    <TouchableOpacity
      ref={inputRefs.city}
      style={styles.selectInput}
      onPress={() => toggleModal('city', true)}
      disabled={!selectedCountry}
    >
      {selectedCity ? (
        <Text>{selectedCity.name}</Text>
      ) : (
        <Text style={styles.selectText}>Seleccione Ciudad</Text>
      )}
      <Feather name="chevron-down" size={24} color="#DCA54C" />
    </TouchableOpacity>
  );

  const renderPhoneInput = () => (
    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
      <TouchableOpacity
        style={styles.selectInput1}
        onPress={() => toggleModal('phone', true)}
      >
        {selectedCountry ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: selectedCountry.flag_url }}
              style={{ width: 24, height: 16, marginRight: 5 }}
            />
            <Text>{phoneCode}</Text>
          </View>
        ) : (
          <Text style={styles.selectText}>Código</Text>
        )}
        <Feather name="chevron-down" size={24} color="#DCA54C" />
      </TouchableOpacity>
      <TextInput
        style={styles.input1}
        value={formData.phone}
        onChangeText={(text) => updateFormData('phone', text)}
        placeholder="Teléfono"
        keyboardType="phone-pad"
      />
    </View>
  );

  const renderProfileImagePicker = () => (
    <View style={{ marginBottom: 20, marginHorizontal: 20 }}>
      <View style={{ marginHorizontal: 20, alignItems: 'center' }}>
        <Text style={{ marginTop: 5, textAlign: 'center', fontSize: 16, color: '#666' }}>
          Introduzca una foto de perfil de cuenta
        </Text>
      </View>
      <TouchableOpacity onPress={handleImagePicker} style={{ alignItems: 'center', marginTop: 10 }}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage.uri }}
            style={{ width: 100, height: 100, borderRadius: 20 }}
          />
        ) : (
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 20,
            backgroundColor: '#ccc',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Image
              source={require('@/assets/images/principal/load-img-icon.png')}
              style={{ width: 100, height: 100, resizeMode: 'cover', borderRadius: 20 }}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <Animated.View style={[styles.headerFixed, { opacity: backButtonOpacity }]}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#222c39" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Sticky Header */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', left: 16 }}>
          <Feather name="arrow-left" size={24} color="#DCA54C" />
        </TouchableOpacity>
        <Text style={styles.stickyTitle}>Registrate en OmNa</Text>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Modals */}
        <Modal
          visible={modals.country}
          transparent={true}
          animationType="slide"
          onRequestClose={() => toggleModal('country', false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccione País</Text>
                <TouchableOpacity onPress={() => toggleModal('country', false)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={countries}
                keyExtractor={(item) => item.id?.toString() || ''}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.countryItem}
                    onPress={() => handleSelectCountry(item)}
                  >
                    <Image source={{ uri: item.flag_url }} style={styles.countryFlag} />
                    <Text style={styles.countryName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={modals.city}
          transparent={true}
          animationType="slide"
          onRequestClose={() => toggleModal('city', false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccione Ciudad</Text>
                <TouchableOpacity onPress={() => toggleModal('city', false)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              {selectedCountry ? (
                <FlatList
                  data={cities}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.countryItem}
                      onPress={() => handleSelectCity(item)}
                    >
                      <Text style={styles.countryName}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <Text style={styles.noCountryText}>Seleccione un país primero</Text>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={modals.phone}
          transparent={true}
          animationType="slide"
          onRequestClose={() => toggleModal('phone', false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccione Código</Text>
                <TouchableOpacity onPress={() => toggleModal('phone', false)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              {selectedCountry ? (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setPhoneCode(selectedCountry.phonecode);
                    toggleModal('phone', false);
                  }}
                >
                  <Image source={{ uri: selectedCountry.flag_url }} style={styles.countryFlag} />
                  <Text style={styles.countryName}>{selectedCountry.phonecode}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.noCountryText}>Seleccione un país primero</Text>
              )}
            </View>
          </View>
        </Modal>

        {/* Main Content */}
        <Animated.ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          {/* Header Image */}
          <View style={{ marginHorizontal: -20 }}>
            <Image
              source={require('@/assets/images/principal/img1.webp')}
              style={styles.headerImage}
            />
          </View>

          <Text style={styles.title}>Registrate en OmNa</Text>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Name Input */}
            <Text style={styles.inputLabel}>*Ingrese su Nombre</Text>
            <TextInput
              ref={inputRefs.name}
              style={styles.input}
              value={formData.first_name}
              onChangeText={(text) => updateFormData('first_name', text)}
              placeholder=""
            />
            {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}

            {/* Last Name Input */}
            <Text style={styles.inputLabel}>*Ingrese su Apellido</Text>
            <TextInput
              ref={inputRefs.lastName}
              style={styles.input}
              value={formData.last_name}
              onChangeText={(text) => updateFormData('last_name', text)}
              placeholder=""
            />
            {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}

            {/* Birthdate Input */}
            <Text style={styles.inputLabel}>*Fecha de Nacimiento</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                ref={inputRefs.birthdate}
                style={styles.dateInput}
                value={formData.birthdate ? formatDate(formData.birthdate) : ''}
                editable={false}
                placeholder="DD/MM/YYYY"
              />
              <TouchableOpacity onPress={showDatePicker} style={styles.calendarButton}>
                <Feather name="calendar" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.ageText}>*Solo es posible su registro si eres mayor de 18 años</Text>
            {errors.birthdate && <Text style={styles.errorText}>{errors.birthdate}</Text>}

            {/* Country and City Selectors */}
            <View style={{ flexDirection: 'column', marginBottom: 10 }}>
              {renderCountrySelector()}
              {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
              {renderCitySelector()}
            </View>
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

            {/* Phone Input */}
            <Text style={styles.inputLabel}>*Su Móvil</Text>
            {renderPhoneInput()}
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            {/* Email Input */}
            <Text style={styles.inputLabel}>*Ingrese su E-Mail</Text>
            <TextInput
              ref={inputRefs.email}
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              placeholder=""
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Password Inputs */}
            <Text style={styles.inputLabel}>*Ingrese su Contraseña</Text>
            <TextInput
              ref={inputRefs.password}
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              placeholder=""
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <Text style={styles.inputLabel}>*Repita su contraseña</Text>
            <TextInput
              ref={inputRefs.passwordConfirmation}
              style={styles.input}
              value={formData.password_confirmation}
              onChangeText={(text) => updateFormData('password_confirmation', text)}
              placeholder=""
              secureTextEntry
            />
            {errors.password_confirmation && <Text style={styles.errorText}>{errors.password_confirmation}</Text>}
          </View>

          {/* Profile Image Picker */}
          {renderProfileImagePicker()}

          {/* Submit Button */}
          <View style={{ marginBottom: 150, marginHorizontal: 20 }}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>REGISTRARME</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Terms Modals */}
          <TermsModal
            isVisible={modals.terms}
            onAccept={() => acceptTerms('terms')}
            onClose={() => toggleModal('terms', false)}
          />
          <ProtectionModal
            isVisible={modals.protection}
            onAccept={() => acceptTerms('protection')}
            onClose={() => toggleModal('protection', false)}
          />
          <LegalModal
            isVisible={modals.legal}
            onAccept={() => acceptTerms('legal')}
            onClose={() => toggleModal('legal', false)}
          />
        </Animated.ScrollView>

        {/* Toast */}
        <CustomToast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF6ED',
    },
    headerImage: {
        resizeMode: "stretch",
        width: '100%',
        height: 170,
    },
    headerFixed: {
        position: 'absolute',
        top: 46,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        backgroundColor: 'transparent',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    backButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(185, 185, 189, 0.71)',
        padding: 8,
        borderRadius: 100,
    },
    stickyHeader: {
        position: 'absolute',
        top: HEADER_HEIGHT - 30,
        left: 0,
        right: 0,
        height: TITLE_HEIGHT,
        backgroundColor: '#FFECD5',
        justifyContent: 'center',
        zIndex: 9,
    },
    stickyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#DCA54C',
        textAlign: 'center',
    },
    logoContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#DCA54C',
        backgroundColor: '#FFECD5',
        padding: 15,
        textAlign: 'center',
    },
    formContainer: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    inputLabel1: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
        marginHorizontal: 5
    },
    input: {
        borderWidth: 1,
        borderColor: '#DCA54C',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    input2: {
        borderWidth: 1,
        borderColor: '#DCA54C',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        width: '80%'
    },
    input1: {
        borderWidth: 1,
        borderColor: '#DCA54C',
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        padding: 12,
        marginBottom: 20,
        width: '66%'
    },
    dateInputContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    dateInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#DCA54C',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        padding: 12,
    },
    calendarButton: {
        backgroundColor: '#DCA54C',
        width: 50,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ageText: {
        color: '#666',
        fontSize: 13.5,
        marginBottom: 20,
    },
    selectInput: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DCA54C',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        marginHorizontal: 3
    },
    selectInput1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DCA54C',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        padding: 8,
        marginBottom: 20,
        width: 120
    },
    selectText: {
        color: '#999',
        paddingRight: 5
    },
    submitButton: {
        backgroundColor: '#DCA54C',
        padding: 15,
        borderRadius: 8,
        marginTop: -11,
    },
    buttonContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    textForTerms: {
        fontSize: 16,
        color: '#666',
        paddingLeft: 5,
    },
    endAlign: {
        alignSelf: 'center',
        alignItems: 'center',
    },
    forgotPassword: {
        fontSize: 16,
        color: '#666'
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        maxHeight: '70%',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    countryFlag: {
        width: 30,
        height: 20,
        marginRight: 10,
    },
    countryName: {
        fontSize: 16,
    },
    noCountryText: {
        padding: 20,
        textAlign: 'center',
        color: '#666',
    }
});

export default RegisterClient;