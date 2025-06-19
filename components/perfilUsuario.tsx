import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateUserData } from '@/redux/slices/clientSlice';
import { Country, ImagePickerAsset } from '@/services/auth/model/auth';
import { formatDate, getCoutries, updateProfile } from '@/services/auth/userDataController/authService';
import { Feather, FontAwesome, SimpleLineIcons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PerfilUsuario = () => {
  const dispatch = useAppDispatch();
  const [newPrincipalImage, setNewPrincipalImage] = useState<ImagePickerAsset | undefined>(undefined);
  const { userData } = useAppSelector(state => state.client);
  
  // Initialize date with user's birthdate if available
  const [date, setDate] = useState(userData.birthdate ? new Date(userData.birthdate) : new Date());
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [phoneCode, setPhoneCode] = useState('+34');
  const [errors, setErrors] = useState({
    password: '',
    password_confirmation: '',
    birthdate: '',
    city: '',
    country: '',
    phone: '',
    general: ''
  });
  
  const scrollViewRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState([]);
  const [currentFocusedInput, setCurrentFocusedInput] = useState(null);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    email: userData.email,
    name: userData.first_name || '',
    last_name: userData.last_name || '',
    password: null,
    password_confirmation: null,
    phone: userData.phone || '',
    birthdate: userData.birthdate || '2003/03/25',
    city: userData.city || '',
    avatar: userData.profile_image || null,
    country: userData.country || '',
  });
  
  // Add a formatted display date for the UI
  const [displayDate, setDisplayDate] = useState(
    userData.birthdate ? formatDate(userData.birthdate) : ''
  );

  // Function to scroll to focused input
  const handleFocus = (inputName, yOffset) => {
    setCurrentFocusedInput(inputName);
    if (scrollViewRef.current && Platform.OS === 'android') {
      setTimeout(() => {
        scrollViewRef.current.scrollTo({
          y: yOffset,
          animated: true
        });
      }, 100);
    }
  };

  const handleBlur = () => {
    setCurrentFocusedInput(null);
  };

  const getProfileImageUri = () => {
    if (newPrincipalImage?.uri) return newPrincipalImage.uri;
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], 
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });

      if (!result.canceled) {
        const image = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile_image.jpg',
        };
        setNewPrincipalImage(image);
        if (image?.uri) {
          const fileExt = image.uri.split('.').pop() || 'jpg';
          const profileImageFile = {
            uri: image.uri,
            type: 'image/jpeg',
            name: `profile_image_${Date.now()}.${fileExt}`,
          };
          setFormData({...formData, avatar: profileImageFile as any});
        }
      }
    } catch (error) {
      console.error('Image selection error:', error);
      setErrors({...errors, general: 'Error al seleccionar la imagen'});
    }
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesData = await getCoutries();
        if (countriesData && countriesData.data && Array.isArray(countriesData.data)) {
          console.log("Countries data fetched:", countriesData.data);
          
          // Store all countries data
          setCountries(countriesData.data);
          
          // Pre-select country if userData has it
          if (userData.country) {
            const userCountry = countriesData.data.find(country => country.name === userData.country);
            if (userCountry) {
              setSelectedCountry(userCountry);
              
              // Set phone code from selected country
              if (userCountry.phonecode) {
                setPhoneCode(userCountry.phonecode);
              }
              
              // Extract cities from the selected country
              if (userCountry.cities && Array.isArray(userCountry.cities)) {
                setCities(userCountry.cities);
                
                // Pre-select city if userData has it
                if (userData.city) {
                  const userCity = userCountry.cities.find(city => 
                    typeof city === 'string' ? city === userData.city : city.name === userData.city
                  );
                  if (userCity) {
                    setSelectedCity(typeof userCity === 'string' ? userCity : userCity.name);
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        setErrors({...errors, general: 'Error al cargar datos de ubicación'});
      }
    };
    
    fetchCountries();
  }, []);

  // Updated onChange handler for date picker
  const onChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      return;
    }
    
    const currentDate = selectedDate || date;
    setDate(currentDate);
    
    // Format the date for display
    const formattedDisplayDate = formatDate(currentDate);
    setDisplayDate(formattedDisplayDate);
    
    // Format date as YYYY/MM/DD for storing in formData
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedStoreDate = `${year}/${month}/${day}`;
    
    // Update formData with the new date
    setFormData({
      ...formData,
      birthdate: formattedStoreDate
    });
  };

  const showMode = (currentMode) => {
    if (!isEditing) return;
    
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const showDatepicker = () => {
    if (isEditing) {
      showMode('date');
    }
  };

  const handleSelectCountry = (country: any) => {
    setSelectedCountry(country);
    setFormData({...formData, country: country.name, city: ''});
    setSelectedCity(null);
    setShowCountryModal(false);
    setErrors({...errors, country: '', city: ''});
    
    // Set phone code from selected country
    if (country.phonecode) {
      setPhoneCode(country.phonecode);
    }
    
    // Set cities based on selected country
    if (country.cities && Array.isArray(country.cities)) {
      setCities(country.cities);
    } else {
      setCities([]);
    }
  };

  const handleSelectCity = (city: any) => {
    // Handle both string cities and object cities
    const cityName = typeof city === 'string' ? city : city.name;
    setSelectedCity(cityName);
    setFormData({...formData, city: cityName});
    setShowCityModal(false);
    setErrors({...errors, city: ''});
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      email: userData.email || '',
      name: userData.first_name || '',
      last_name: userData.last_name || '',
      password: null,
      password_confirmation: null,
      phone: userData.phone || '',
      birthdate: userData.birthdate || '2003/03/25',
      city: userData.city || '',
      avatar: userData.profile_image || null,
      country: userData.country || '',
    });
    
    // Reset errors
    setErrors({
      password: '',
      password_confirmation: '',
      birthdate: '',
      city: '',
      country: '',
      phone: '',
      general: ''
    });
    
    // Reset the date display
    if (userData.birthdate) {
      setDate(new Date(userData.birthdate));
      setDisplayDate(formatDate(userData.birthdate));
    }
    
    // Reset selected country and city
    if (userData.country) {
      const userCountry = countries.find(country => country.name === userData.country);
      if (userCountry) {
        setSelectedCountry(userCountry);
        setPhoneCode(userCountry.phonecode || '+34');
        setCities(userCountry.cities || []);
        
        if (userData.city) {
          setSelectedCity(userData.city);
        }
      }
    }
    
    // Reset profile image
    setNewPrincipalImage(undefined);
    
    // Exit edit mode
    setIsEditing(false);
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = {
      password: '',
      password_confirmation: '',
      birthdate: '',
      city: '',
      country: '',
      phone: '',
      general: ''
    };
    
    // Validate birthdate
    if (date && formData.birthdate) {
      const age = new Date().getFullYear() - date.getFullYear();
      if (age < 18) {
        newErrors.birthdate = 'Debe ser mayor a 18 años';
        isValid = false;
      }
    }
    
    // Validate country and city
    if (!formData.country) {
      newErrors.country = 'Por favor seleccione un país';
      isValid = false;
    }
    
    if (!formData.city) {
      newErrors.city = 'Por favor seleccione una ciudad';
      isValid = false;
    }
    
    // Validate passwords if provided
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        isValid = false;
      }
      
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Las contraseñas no coinciden';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    
    // Reset all errors first
    setErrors({
      password: '',
      password_confirmation: '',
      birthdate: '',
      city: '',
      country: '',
      phone: '',
      general: ''
    });
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Crear un objeto con solo los campos que se van a actualizar
    const updatedData = {
      email: formData.email,
      name: formData.name,
      last_name: formData.last_name,
      phone: formData.phone,
      birthdate: formData.birthdate,
      city: formData.city,
      country: formData.country,
      profile_image: formData.avatar ? formData.avatar : userData.profile_image,
    };
    
    // Solo agregar la contraseña si se ha especificado una nueva
    if (formData.password) {
      updatedData.password = formData.password;
      updatedData.password_confirmation = formData.password_confirmation;
    }
    
    // Solo agregar la imagen si se ha seleccionado una nueva
    if (newPrincipalImage) {
      updatedData.profile_image = formData.avatar;
    }
    
    try {
      const res = await updateProfile(updatedData);
      if (res.success) {
        console.log("Profile update response:", res);
        
        // 2. Update user data in Redux
        dispatch(updateUserData({
          first_name: formData.name,
          last_name: formData.last_name,
          fullname: `${formData.name} ${formData.last_name}`,
          phone: formData.phone,
          birthdate: formData.birthdate,
          city: formData.city,
          country: formData.country,
          profile_image: res.data.profile_image || userData.profile_image,
        }));
        
        console.log("Data saved:", updatedData);
        setIsEditing(false);
      } else {
        setErrors({...errors, general: 'No se pudo guardar los cambios. Inténtalo de nuevo.'});
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      // Handle API validation errors
      if (error.message && typeof error.message === 'object') {
        const newErrors = {...errors};
        
        // Map API error messages to our error state
        Object.keys(error.message).forEach(key => {
          if (Array.isArray(error.message[key]) && error.message[key].length > 0) {
            newErrors[key] = error.message[key][0];
          }
        });
        
        setErrors(newErrors);
      } else {
        setErrors({...errors, general: 'No se pudo guardar los cambios. Inténtalo de nuevo.'});
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView ref={scrollViewRef}>
        <View style={styles.container}>
          
          {/* Country selection modal */}
          <Modal
            visible={showCountryModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCountryModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Seleccione País</Text>
                  <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                    <Feather name="x" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={countries}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.countryItem}
                      onPress={() => handleSelectCountry(item)}
                    >
                      <View style={styles.countryItemContent}>
                        <Text style={styles.countryName}>{item.name}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
          
          {/* City selection modal */}
          <Modal
            visible={showCityModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCityModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Seleccione Ciudad</Text>
                  <TouchableOpacity onPress={() => setShowCityModal(false)}>
                    <Feather name="x" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                {selectedCountry && cities.length > 0 ? (
                  <FlatList
                    data={cities}
                    keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.countryItem}
                        onPress={() => handleSelectCity(item)}
                      >
                        <Text style={styles.countryName}>
                          {typeof item === 'string' ? item : item.name || item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text style={styles.noCountryText}>
                    {!selectedCountry ? "Seleccione un país primero" : "No hay ciudades disponibles"}
                  </Text>
                )}
              </View>
            </View>
          </Modal>

          {/* Phone Code Modal */}
          <Modal
            visible={showPhoneModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPhoneModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Seleccione Código de País</Text>
                  <TouchableOpacity onPress={() => setShowPhoneModal(false)}>
                    <Feather name="x" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={countries}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.countryItem}
                      onPress={() => {
                        setPhoneCode(item.phonecode);
                        setShowPhoneModal(false);
                      }}
                    >
                      <View style={styles.countryItemContent}>
                        <Text style={styles.countryName}>{item.name}</Text>
                        <Text style={styles.countryCode}>{item.phonecode}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
          
          {/* Profile Header with Avatar */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {newPrincipalImage ? (
                <Image source={{ uri: getProfileImageUri() }} style={styles.avatar} />
              ) : (
                <Image 
                  source={
                    userData.profile_image ? { uri: 'https://omna.life/storage/' + userData.profile_image } : 
                    require('@/assets/profile.jpg') 
                  } 
                  style={styles.avatar} 
                />
              )}
              {isEditing &&
                <TouchableOpacity onPress={handleImagePicker} style={styles.editAvatarButton}>
                  <SimpleLineIcons name="pencil" size={16} color="grey" />
                </TouchableOpacity>
              }
            </View>
            <Text style={styles.userName}>{userData.full_name || userData.fullname}</Text>
          </View>

          {/* Display general errors at the top if any */}
          {errors.general && (
            <Text style={styles.errorText}>{errors.general}</Text>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Birthday Field */}
            <Text style={styles.inputLabel}>Fecha de Nacimiento</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={[
                  styles.dateInput, 
                  !isEditing && styles.disabledInput,
                  isEditing && styles.activeInput, 
                  errors.birthdate ? styles.inputError : null
                ]}
                value={displayDate}
                editable={false}
                placeholder="DD/MM/YYYY"
              />
              <TouchableOpacity
                onPress={showDatepicker}
                style={[
                  styles.calendarButton,
                  !isEditing && styles.disabledButton
                ]}
                disabled={!isEditing}
              >
                <Feather name="calendar" size={24} color="white" />
              </TouchableOpacity>
            </View>
            {errors.birthdate && <Text style={[styles.errorText,{marginTop: -15}]}>{errors.birthdate}</Text>}

            {/* Country Selection */}
            <Text style={styles.inputLabel}>País</Text>
            <TouchableOpacity 
              style={[
                styles.selectInput, 
                !isEditing && styles.disabledInput,
                isEditing && styles.activeInput,
                errors.country ? styles.inputError : null
              ]}
              onPress={() => isEditing && setShowCountryModal(true)}
              disabled={!isEditing}
            >
              {formData.country ? (
                <Text style={[styles.selectText, isEditing && {color: 'black'}]}>
                  {formData.country}
                </Text>
              ) : (
                <Text style={styles.selectText}>Seleccione País</Text>
              )}
              <Feather 
                name="chevron-down" 
                size={24} 
                color={isEditing ? "#DCA54C" : "#ccc"} 
                style={isEditing ? styles.selectIcon : styles.selectIconDesabled} 
              />
            </TouchableOpacity>
            {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}

            {/* City Selection */}
            <Text style={styles.inputLabel}>Ciudad</Text>
            <TouchableOpacity 
              style={[
                styles.selectInput, 
                !isEditing && styles.disabledInput,
                isEditing && styles.activeInput,
                !selectedCountry && isEditing && styles.disabledInput,
                errors.city ? styles.inputError : null
              ]}
              onPress={() => isEditing && selectedCountry && setShowCityModal(true)}
              disabled={!isEditing || !selectedCountry}
            >
              {formData.city ? (
                <Text style={[styles.selectText, isEditing && {color: 'black'}]}>
                  {formData.city}
                </Text>
              ) : (
                <Text style={styles.selectText}>
                  {!selectedCountry && isEditing ? "Seleccione País primero" : "Seleccione Ciudad"}
                </Text>
              )}
              <Feather 
                name="chevron-down" 
                size={24} 
                color={isEditing && selectedCountry ? "#DCA54C" : "#ccc"} 
                style={isEditing && selectedCountry ? styles.selectIcon : styles.selectIconDesabled} 
              />
            </TouchableOpacity>
            {errors.city && <Text style={[styles.errorText,{marginTop: -15}]}>{errors.city}</Text>}

            {/* Phone Field */}
            <Text style={styles.inputLabel}>Su Móvil</Text>
            <View style={styles.phoneContainer}>
              <TouchableOpacity 
                style={[
                  styles.countryCodeButton, 
                  styles.disabledInput,
                  isEditing && styles.activeInput,
                  errors.phone ? styles.inputError : null
                ]}
                
                disabled={!isEditing}
              >
                <View style={styles.flagContainer}>
                  <Text style={[styles.countryCode, !isEditing && { color: '#999' }]}>{phoneCode}</Text>
                </View>
                <Feather name="chevron-down" size={24} color={isEditing ? "#DCA54C" : "#ccc"} />
              </TouchableOpacity>
              
              <TextInput
                style={[
                  styles.phoneInput, 
                  !isEditing && styles.disabledInput,
                  isEditing && styles.activeInput,
                  errors.phone ? styles.inputError : null
                ]}
                value={formData.phone}
                onChangeText={(text) => {
                  setFormData({...formData, phone: text});
                  if (errors.phone) setErrors({...errors, phone: ''});
                }}
                placeholder="Teléfono"
                keyboardType="phone-pad"
                editable={isEditing}
                onFocus={() => handleFocus('phone', 450)}
                onBlur={handleBlur}
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            
            {/* Email Field */}
            <Text style={styles.inputLabel}>Su E-Mail</Text>
            <View style={styles.emailContainer}>
              <TextInput
                style={[styles.emailInput, isEditing && styles.activeInput]}
                value={formData.email || ''}
                editable={false}
                placeholder="Email"
                keyboardType="email-address"
              />
              <View style={[styles.emailButton, !isEditing && styles.disabledButton]}>
                <Feather name="mail" size={24} color="white" />
              </View>
            </View>

            {/* Password Field */}
            <Text style={styles.inputLabel}>Cambie su Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput, 
                  !isEditing && styles.disabledInput,
                  isEditing && styles.activeInput,
                  errors.password ? styles.inputError : null
                ]}
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({...formData, password: text});
                  if (errors.password) setErrors({...errors, password: ''});
                }}
                placeholder={isEditing ? "Nueva Contraseña" : "***********"}
                secureTextEntry
                editable={isEditing}
                onFocus={() => handleFocus('password', 600)}
                onBlur={handleBlur}
              />

              <TouchableOpacity 
                style={[
                  styles.passwordButton,
                  !isEditing && styles.disabledButton
                ]}
                disabled={!isEditing}
              >
                <FontAwesome name="pencil-square-o" size={24} color="white" />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={[styles.errorText,{marginTop:-15}]}>{errors.password}</Text>}

            {/* Confirm Password Field */}
            {isEditing && formData.password && (
              <View>
                <Text style={styles.inputLabel}>Confirme su Contraseña</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.confirmpasswordInput, 
                      isEditing && styles.activeInput,
                      errors.password_confirmation ? styles.inputError : null
                    ]}
                    value={formData.password_confirmation}
                    onChangeText={(text) => {
                      setFormData({...formData, password_confirmation: text});
                      if (errors.password_confirmation) setErrors({...errors, password_confirmation: ''});
                    }}
                    placeholder="Confirme su Contraseña"
                    secureTextEntry
                    editable={isEditing}
                    onFocus={() => handleFocus('password_confirmation', 650)}
                    onBlur={handleBlur}
                  />
                </View>
                {errors.password_confirmation && (
                  <Text style={[styles.errorText, {marginTop: -15}]}>{errors.password_confirmation}</Text>
                )}
              </View>
            )}

            {/* Submit Buttons */}
            {isEditing ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>CANCELAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleEdit}>
                  <Text style={styles.saveButtonText}>GUARDAR</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>EDITAR DATOS</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6ED',
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    right: -3,
    top: 5,
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#555',
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  dateInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 12,
    backgroundColor: 'white',
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  countryName: {
    fontSize: 16,
  },
  noCountryText: {
    padding: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  calendarButton: {
    backgroundColor: '#DCA54C',
    width: 50,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  selectText: {
    color: '#999',
  },
  selectIcon: {
    borderLeftWidth: 1,
    borderLeftColor: '#DCA54C',
    paddingLeft: 8,
  },
  selectIconDesabled: {
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
    paddingLeft: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 10,
    backgroundColor: 'white',
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  flagIcon: {
    width: 24,
    height: 16,
    marginRight: 5,
  },
  countryCode: {
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  emailContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  emailInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    color: '#999',
  },
  emailButton: {
    backgroundColor: '#DCA54C',
    width: 50,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  confirmpasswordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  passwordButton: {
    backgroundColor: '#DCA54C',
    width: 50,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#DCA54C',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 140,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos actualizados
  disabledInput: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    color: '#999',
    borderColor: '#ccc',
  },
  activeInput: {
    borderColor: '#DCA54C',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  // New button styles
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 140,
  },
  cancelButton: {
    backgroundColor: '#FAF6ED',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#DCA54C',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
  }
});

export default PerfilUsuario;