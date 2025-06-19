import CustomHeader from '@/components/customHeader';
import { getHorariosDisponibleSesiones, getHorariosNoDisponibleSesiones, obtenerIPUsuario, obtenerTasasCambio, pagarConBinance, pagarConTodayPay, purchaseSession } from '@/services/auth/userDataController/authService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

// Configuración de campos por moneda
const camposPorMoneda = {
    CLP: {
        beneficiaryTypes: [
            { value: 'cc', name: 'Cédula de Ciudadanía' }
        ],
        paymentTypes: [
            { value: 'NET_BANKING', name: 'Banca en línea' }
        ],
        campos: [
            { name: 'beneficiaryId', label: 'RUT', type: 'text', required: true, placeholder: '12.345.678-9' },
            { name: 'beneficiaryType', label: 'Tipo de Beneficiario', type: 'select', required: true },
            { name: 'paymentType', label: 'Tipo de Pago', type: 'select', required: true }
        ]
    },
    
    COP: {
        beneficiaryTypes: [
            { value: 'CC', name: 'Cédula de Ciudadanía' }
        ],
        paymentTypes: [
            { value: 'CASH', name: 'Efectivo' }
        ],
        campos: [
            { name: 'beneficiaryId', label: 'Cédula de Ciudadanía', type: 'text', required: true, placeholder: 'Número de cédula' },
            { name: 'beneficiaryType', label: 'Tipo de Beneficiario', type: 'select', required: true },
            { name: 'paymentType', label: 'Tipo de Pago', type: 'select', required: true }
        ]
    },
    
    ECS: {
        beneficiaryTypes: [
            { value: 'ruc', name: 'Registro Único de Contribuyentes' },
            { value: 'ci', name: 'Cédula de identidad' },
            { value: 'cc', name: 'Cédula de Ciudadanía' },
            { value: 'pas', name: 'Pasaporte' }
        ],
        paymentTypes: [
            { value: 'NET_BANKING', name: 'Banca en línea' }
        ],
        campos: [
            { name: 'beneficiaryId', label: 'Documento de Identidad', type: 'text', required: true, placeholder: 'RUC, CI, DNI o Pasaporte' },
            { name: 'beneficiaryType', label: 'Tipo de Documento', type: 'select', required: true },
            { name: 'paymentType', label: 'Tipo de Pago', type: 'select', required: true }
        ]
    },
    
    PEN: {
        beneficiaryTypes: [
            { value: 'DNI', name: 'Documento Nacional de Identidad' }
        ],
        paymentTypes: [
            { value: 'CASH', name: 'Efectivo' }
        ],
        campos: [
            { name: 'beneficiaryId', label: 'DNI', type: 'text', required: true, placeholder: '12345678' },
            { name: 'beneficiaryType', label: 'Tipo de Beneficiario', type: 'select', required: true },
            { name: 'paymentType', label: 'Tipo de Pago', type: 'select', required: true }
        ]
    },
    
    BRL: {
        beneficiaryTypes: [],
        paymentTypes: [],
        campos: [
            { name: 'docNumber', label: 'Número de Documento', type: 'text', required: true, placeholder: 'CPF o CNPJ' }
        ]
    },
    
    MXN: {
        beneficiaryTypes: [],
        paymentTypes: [],
        campos: []
    }
};

const PurchaseSessionScreen = () => {
  const { sessionId, amountUSD } = useLocalSearchParams();
  // Estados del formulario
  const [paymentMethod, setPaymentMethod] = useState('binance');
  const [currency, setCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [observations, setObservations] = useState('');
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Estados para campos dinámicos de TodayPay
  const [todayPayFields, setTodayPayFields] = useState({});

  // Opciones de moneda
  const currencyOptions = [
    { value: 'COP', label: '🇨🇴 Peso Colombiano (COP)' },
    { value: 'BRL', label: '🇧🇷 Real Brasileño (BRL)' },
    { value: 'CLP', label: '🇨🇱 Peso Chileno (CLP)' },
    { value: 'PEN', label: '🇵🇪 Sol Peruano (PEN)' },
    { value: 'MXN', label: '🇲🇽 Peso Mexicano (MXN)' },
    { value: 'ECS', label: '🇪🇨 Dólar Ecuatoriano (ECS)' }
  ];

  // Cargar horarios disponibles cuando cambia la fecha
  useEffect(() => {
    if (sessionDate) {
      loadAvailableSchedules(sessionDate);
    }
  }, [sessionDate]);

  // Calcular monto y limpiar campos cuando cambia la moneda
  useEffect(() => {
  if (currency && paymentMethod === 'todaypay') {
    calculateAmount(currency);
    setTodayPayFields({});
  }
}, [currency]);


  // Obtener configuración de campos según la moneda
  const getCurrentCurrencyConfig = () => {
    return camposPorMoneda[currency] || { beneficiaryTypes: [], paymentTypes: [], campos: [] };
  };

  // REEMPLAZA tu función loadAvailableSchedules con esta versión mejorada:

const loadAvailableSchedules = async (date) => {
  setLoadingSchedules(true);
  setAvailableSchedules([]); // Limpiar horarios previos
  setSelectedSchedule(''); // Reset horario seleccionado
  
  try {
    // Formato de fecha para la API (YYYY-MM-DD)
    const selectedDateFormatted = date.toISOString().split('T')[0];
    
    // 1. Primero verificar si la fecha está en las fechas no disponibles
    const fechaInicio = new Date().toISOString().split('T')[0];
    const fechaFin = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    
    const blockedDatesResponse = await getHorariosNoDisponibleSesiones(
      sessionId.toString(), 
      fechaInicio, 
      fechaFin
    );
    
    console.log('📅 Fechas bloqueadas:', blockedDatesResponse.data);
    
    // Verificar si la fecha seleccionada está bloqueada
    if (blockedDatesResponse.data?.fechas_no_disponibles?.includes(selectedDateFormatted)) {
      console.log('❌ Fecha seleccionada está bloqueada:', selectedDateFormatted);
      setAvailableSchedules([]);
      return;
    }
    
    // 2. Si la fecha no está bloqueada, obtener horarios disponibles
    const availableSchedulesResponse = await getHorariosDisponibleSesiones(
      sessionId.toString(), 
      date
    );
    
    console.log('🕐 Horarios disponibles para', selectedDateFormatted, ':', availableSchedulesResponse.data);
    
    // 3. Procesar la respuesta de horarios disponibles
    if (availableSchedulesResponse.data?.success && availableSchedulesResponse.data?.horarios) {
      const formattedSchedules = availableSchedulesResponse.data.horarios.map(horario => ({
        id: horario.id.toString(),
        time: horario.display,
        available: true,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        dia_semana_id: horario.dia_semana_id
      }));
      
      console.log('✅ Horarios formateados:', formattedSchedules);
      setAvailableSchedules(formattedSchedules);
      
      // Si no hay horarios disponibles, mostrar mensaje
      if (formattedSchedules.length === 0) {
        console.log('⚠️ No hay horarios disponibles para esta fecha');
      }
    } else {
      console.log('❌ No se pudieron obtener horarios para la fecha:', selectedDateFormatted);
      setAvailableSchedules([]);
    }
    
  } catch (error) {
    console.error('❌ Error loading schedules:', error);
    Alert.alert('Error', 'No se pudieron cargar los horarios disponibles. Intenta con otra fecha.');
    setAvailableSchedules([]);
  } finally {
    setLoadingSchedules(false);
  }
};

// TAMBIÉN AGREGA esta función helper para validar fechas antes de mostrar el DatePicker:

const isDateBlocked = (dateToCheck) => {
  const dateFormatted = dateToCheck.toISOString().split('T')[0];
  // Aquí puedes usar un estado para almacenar las fechas bloqueadas
  // y verificar si la fecha está en esa lista
  return false; // Por ahora retorna false, pero puedes implementar la lógica
};

// OPCIONAL: Agregar estado para almacenar fechas bloqueadas globalmente
// Agrega esto en tus estados al inicio del componente:
const [blockedDates, setBlockedDates] = useState([]);

// Y esta función para cargar fechas bloqueadas una sola vez:
useEffect(() => {
  const loadBlockedDates = async () => {
    try {
      const fechaInicio = new Date().toISOString().split('T')[0];
      const fechaFin = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      
      const response = await getHorariosNoDisponibleSesiones(
        sessionId.toString(), 
        fechaInicio, 
        fechaFin
      );
      
      if (response.data?.fechas_no_disponibles) {
        setBlockedDates(response.data.fechas_no_disponibles);
      }
    } catch (error) {
      console.error('Error cargando fechas bloqueadas:', error);
    }
  };
  
  if (sessionId) {
    loadBlockedDates();
  }
}, [sessionId]);

  const calculateAmount = async (selectedCurrency) => {
  try {
    const tasasCambio = await obtenerTasasCambio();
    const baseAmount = parseFloat(amountUSD);
    
    let convertedAmount;
    switch (selectedCurrency) {
      case 'COP':
        convertedAmount = baseAmount * tasasCambio.USDCOP;
        break;
      case 'CLP':
        convertedAmount = baseAmount * tasasCambio.USDCLP;
        break;
      case 'PEN':
        convertedAmount = baseAmount * tasasCambio.USDPEN;
        break;
      case 'BRL':
        convertedAmount = baseAmount * tasasCambio.USDBRL;
        break;
      case 'MXN':
        convertedAmount = baseAmount * tasasCambio.USDMXN;
        break;
      case 'ECS':
        convertedAmount = baseAmount * tasasCambio.USDECS;
        break;
      default:
        convertedAmount = baseAmount;
    }
    
    setAmount(convertedAmount.toFixed(2));
  } catch (error) {
    console.error('Error calculando monto:', error);
    Alert.alert('Error', 'No se pudo calcular el monto. Intenta nuevamente.');
  }
};

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSessionDate(selectedDate);
      setSelectedSchedule(''); // Reset schedule when date changes
    }
  };

  const handleTodayPayFieldChange = (fieldName, value) => {
    setTodayPayFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateTodayPayFields = () => {
    const config = getCurrentCurrencyConfig();
    
    for (const campo of config.campos) {
      if (campo.required && !todayPayFields[campo.name]) {
        Alert.alert('Error', `El campo ${campo.label} es obligatorio`);
        return false;
      }
    }
    return true;
  };


// Función para generar orden Binance
// Función para generar orden Binance
const generarOrdenBinance = async () => {
  try {
    // Paso 1: Preparar datos para el agendamiento
    const sessionData = {
      sesion_web_id: sessionId,
      fecha_sesion: sessionDate.toISOString().split('T')[0],
      horario_id: selectedSchedule,
      observaciones: observations
    };
    console.log('📅 Iniciando agendamiento de sesión...');
   
    // Paso 2: Intentar agendar la sesión
    const agendamientoResponse = await purchaseSession(sessionData);
   
    // Paso 3: Verificar si el agendamiento fue exitoso
    if (!agendamientoResponse.success) {
      throw new Error(agendamientoResponse.message || 'Error al agendar la sesión');
    }
    console.log('✅ Sesión agendada exitosamente:', agendamientoResponse);
    
    // Paso 4: Si el agendamiento fue exitoso, proceder con la orden de pago
    console.log('💳 Generando orden de pago...');
   
    const binanceData = {
      moneda: 'USDT',
      monto: amountUSD,
      nombre_recurso: 'Sesión',
      producto_servicio_id: sessionId,
      tipo: 'Mobil',
      fecha_sesion: sessionDate.toISOString().split('T')[0],
      horario_id: selectedSchedule,
      observaciones: observations
    };
    
    // Paso 5: Generar orden de pago con Binance
    const pagoResponse = await pagarConBinance(binanceData);
   
    if (!pagoResponse.success) {
      throw new Error(pagoResponse.message || 'Error al generar orden de pago');
    }
    
    // Paso 6: Procesar respuesta exitosa del pago
    console.log('✅ Orden de pago generada exitosamente');
   
    if (pagoResponse.data?.url_pago_web) {
      await WebBrowser.openBrowserAsync(pagoResponse.data.url_pago_web);
    }
    
    return {
      success: true,
      agendamiento: agendamientoResponse.data,
      pago: pagoResponse.data,
      mensaje: 'Sesión agendada y orden de pago generada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
   
    return {
      success: false,
      mensaje: error.message,
      error: error
    };
  }
};


// Función para generar orden TodayPay
const generarOrdenTodayPay = async () => {
  try {
    const ipUsuario = await obtenerIPUsuario();
    
    // Validar campos requeridos
    const config = getCurrentCurrencyConfig();
    const camposObligatorios = config.campos.filter(c => c.required);
    
    for (const campo of camposObligatorios) {
      const valor = todayPayFields[campo.name];
      if (!valor || !valor.trim()) {
        throw new Error(`El campo "${campo.label}" es obligatorio para pagos en ${currency}`);
      }
    }
    
    // Datos base para TodayPay
    const todayPayData = {
      moneda: currency,
      monto: parseFloat(amount),
      nombre_recurso: 'Sesión',
      producto_servicio_id: sessionId,
      ip_user: ipUsuario,
      fecha_sesion: sessionDate.toISOString().split('T')[0],
      horario_id: selectedSchedule,
      observaciones: observations || ''
    };

    // Agregar campos específicos por moneda
    config.campos.forEach(campo => {
      const valor = todayPayFields[campo.name];
      if (valor && valor.trim()) {
        todayPayData[campo.name] = valor.trim();
      }
    });

    // Validación especial para campos críticos
    if (['COP', 'CLP', 'PEN', 'ECS'].includes(currency)) {
      if (!todayPayData.beneficiaryId) {
        throw new Error('El documento de identidad es obligatorio');
      }
      if (!todayPayData.beneficiaryType) {
        throw new Error('El tipo de beneficiario es obligatorio');
      }
      if (!todayPayData.paymentType) {
        todayPayData.paymentType = 'CASH';
      }
    }

    if (currency === 'BRL' && !todayPayData.docNumber) {
      throw new Error('El número de documento es obligatorio para pagos en BRL');
    }
    // Paso 1: Preparar datos para el agendamiento
    const sessionData = {
      sesion_web_id: sessionId,
      fecha_sesion: sessionDate.toISOString().split('T')[0],
      horario_id: selectedSchedule,
      observaciones: observations
    };
    console.log('📅 Iniciando agendamiento de sesión...');
   
    // Paso 2: Intentar agendar la sesión
    const agendamientoResponse = await purchaseSession(sessionData);
   
    // Paso 3: Verificar si el agendamiento fue exitoso
    if (!agendamientoResponse.success) {
      throw new Error(agendamientoResponse.message || 'Error al agendar la sesión');
    }
    console.log('✅ Sesión agendada exitosamente:', agendamientoResponse);
    
    // Paso 4: Si el agendamiento fue exitoso, proceder con la orden de pago
    console.log('💳 Generando orden de pago...');
    console.log('📤 Datos TodayPay que se enviarán:', todayPayData);
    
    // Realizar petición a TodayPay
    const response = await pagarConTodayPay(todayPayData);

    if (response.success) {
      if (response.data?.url_pago) {
         await WebBrowser.openBrowserAsync(response.data.url_pago);
        console.log('🔗 URL de pago abierta:', response.data.url_pago);
      }
      return true;
    } else {
      let errorMessage = response.message || 'Error al generar orden de pago';
      
      // Parsear errores específicos de la API
      if (response.message && response.message.includes('error_field')) {
        try {
          const errorMatch = response.message.match(/\{[^}]+\}/);
          if (errorMatch) {
            const errorObj = JSON.parse(errorMatch[0]);
            if (errorObj.error_field) {
              const fieldErrors = Object.entries(errorObj.error_field)
                .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                .join('\n');
              errorMessage = `Errores en los campos:\n${fieldErrors}`;
            }
          }
        } catch (e) {
          console.error('Error al parsear mensaje de error:', e);
        }
      }
      
      throw new Error(errorMessage);
    }
    
  } catch (error) {
    console.error('❌ Error en generarOrdenTodayPay:', error);
    throw error;
  }
};

  // 4. REEMPLAZAR COMPLETAMENTE LA FUNCIÓN handleSubmit
const handleSubmit = async () => {
  // Validaciones básicas
  if (!sessionDate) {
    Alert.alert('Error', 'Por favor selecciona una fecha para la sesión');
    return;
  }

  if (!selectedSchedule) {
    Alert.alert('Error', 'Por favor selecciona un horario disponible');
    return;
  }

  if (paymentMethod === 'todaypay') {
    if (!currency || !amount) {
      Alert.alert('Error', 'Por favor completa la información de pago');
      return;
    }
    
    if (!validateTodayPayFields()) {
      return;
    }
  }

  setLoading(true);
  
  try {
    let success = false;
    
    if (paymentMethod === 'binance') {
      success = await generarOrdenBinance();
    } else if (paymentMethod === 'todaypay') {
      success = await generarOrdenTodayPay();
    }
    
    if (success) {
      setLoading(false);
      Alert.alert(
        'Éxito',
        'Tu orden de pago ha sido generada correctamente. Se abrirá la página de pago.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }

  } catch (error) {
    setLoading(false);
    console.error('Purchase error:', error);
    Alert.alert('Error', error.message || 'No se pudo procesar tu solicitud. Intenta nuevamente.');
  }
};

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderDynamicField = (campo) => {
    const config = getCurrentCurrencyConfig();
    
    switch (campo.type) {
      case 'text':
        return (
          <View key={campo.name} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {campo.label} {campo.required && '*'}
            </Text>
            <TextInput
              style={styles.input}
              value={todayPayFields[campo.name] || ''}
              onChangeText={(value) => handleTodayPayFieldChange(campo.name, value)}
              placeholder={campo.placeholder}
            />
          </View>
        );
        
      case 'select':
        let options = [];
        if (campo.name === 'beneficiaryType') {
          options = config.beneficiaryTypes;
        } else if (campo.name === 'paymentType') {
          options = config.paymentTypes;
        }
        
        return (
          <View key={campo.name} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {campo.label} {campo.required && '*'}
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={todayPayFields[campo.name] || ''}
                onValueChange={(value) => handleTodayPayFieldChange(campo.name, value)}
                style={styles.picker}
              >
                <Picker.Item label={`Selecciona ${campo.label.toLowerCase()}`} value="" />
                {options.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.name}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader />
      
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
             {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>📅 Agendar Sesión</Text>
            </View>
            
            {/* Fecha y Horario */}
            <View style={styles.dateTimeContainer}>
              
              {/* Fecha de la sesión */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>📅 Fecha de la Sesión *</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {formatDate(sessionDate)}
                  </Text>
                  <Text style={styles.dateIcon}>📅</Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={sessionDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}

              {/* Horario */}
              <View style={styles.inputGroup}>
  <Text style={styles.inputLabel}>🕐 Horario Disponible *</Text>
  {loadingSchedules ? (
    <View style={styles.loadingSchedules}>
      <ActivityIndicator size="small" color="#e6a902" />
      <Text style={styles.loadingText}>Cargando horarios...</Text>
    </View>
  ) : (
    <>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedSchedule}
          onValueChange={(value) => setSelectedSchedule(value)}
          style={styles.picker}
          enabled={availableSchedules.length > 0}
        >
          <Picker.Item
            label={
              availableSchedules.length > 0 
                ? "Selecciona un horario" 
                : blockedDates.includes(sessionDate.toISOString().split('T')[0])
                  ? "Esta fecha no está disponible"
                  : "No hay horarios disponibles para esta fecha"
            }
            value=""
          />
          {availableSchedules.map((schedule) => (
            <Picker.Item
              key={schedule.id}
              label={`${schedule.time}`}
              value={schedule.id}
            />
          ))}
        </Picker>
      </View>
      
      {/* Mostrar información adicional */}
      {availableSchedules.length > 0 && (
        <Text style={styles.scheduleInfo}>
          📊 {availableSchedules.length} horario{availableSchedules.length !== 1 ? 's' : ''} disponible{availableSchedules.length !== 1 ? 's' : ''}
        </Text>
      )}
      
      {blockedDates.includes(sessionDate.toISOString().split('T')[0]) && (
        <View style={styles.warningAlert}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>Esta fecha no está disponible. Por favor selecciona otra fecha.</Text>
        </View>
      )}
    </>
  )}
</View>
            </View>

            {/* Observaciones */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>💬 Observaciones (Opcional)</Text>
              <TextInput
                style={styles.textArea}
                value={observations}
                onChangeText={setObservations}
                placeholder="Comparte cualquier detalle importante para tu sesión..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            
            {/* Métodos de Pago */}
            <View style={[styles.card, styles.paymentCard]}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentTitle}>💳 Selecciona tu Método de Pago</Text>
              </View>
              <View style={styles.cardBody}>
                
                {/* Opción Binance */}
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === 'binance' && styles.paymentOptionSelected
                  ]}
                  onPress={() => setPaymentMethod('binance')}
                >
                  <View style={styles.paymentOptionContent}>
                    <Text style={styles.paymentIcon}>₿</Text>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentMethodTitle}>Criptomonedas</Text>
                      <Text style={styles.paymentMethodSubtitle}>Binance</Text>
                    </View>
                    <View style={styles.radioButton}>
                      {paymentMethod === 'binance' && <View style={styles.radioButtonInner} />}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Opción TodayPay */}
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === 'todaypay' && styles.paymentOptionSelected
                  ]}
                  onPress={() => setPaymentMethod('todaypay')}
                >
                  <View style={styles.paymentOptionContent}>
                    <Text style={styles.paymentIcon}>🏦</Text>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentMethodTitle}>Pago Local</Text>
                      <Text style={styles.paymentMethodSubtitle}>Escoge tu método preferido</Text>
                    </View>
                    <View style={styles.radioButton}>
                      {paymentMethod === 'todaypay' && <View style={styles.radioButtonInner} />}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sección TodayPay */}
            {paymentMethod === 'todaypay' && (
              <View style={[styles.card, styles.todayPayCard]}>
                <View style={styles.todayPayHeader}>
                  <Text style={styles.todayPayTitle}>🏦 Configuración de Pago Local</Text>
                </View>
                <View style={styles.cardBody}>
                  
                  {/* Selector de Moneda */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>💱 Moneda *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={currency}
                        onValueChange={(value) => setCurrency(value)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Selecciona tu moneda" value="" />
                        {currencyOptions.map((option) => (
                          <Picker.Item
                            key={option.value}
                            label={option.label}
                            value={option.value}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  {/* Monto */}
                  {currency && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>💰 Monto a Pagar *</Text>
                      <View style={styles.amountContainer}>
                        <TextInput
                          style={styles.amountInput}
                          value={amount}
                          placeholder="Calculando..."
                          editable={false}
                        />
                        <Text style={styles.currencySymbol}>{currency}</Text>
                      </View>
                    </View>
                  )}

                  {/* Campos dinámicos según la moneda */}
                  {currency && getCurrentCurrencyConfig().campos.length > 0 && (
                    <View style={styles.dynamicFieldsContainer}>
                      {getCurrentCurrencyConfig().campos.map(campo => renderDynamicField(campo))}
                    </View>
                  )}

                  {/* Mensaje para monedas sin campos adicionales */}
                  {currency === 'MXN' && (
                    <View style={styles.infoAlert}>
                      <Text style={styles.infoIcon}>ℹ️</Text>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoText}>Para pagos en pesos mexicanos, recibirás las instrucciones de pago por email después de confirmar.</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}


            {/* Información adicional */}
            <View style={styles.infoAlert}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Información importante:</Text>
                <Text style={styles.infoText}>• Después de realizar el pago recibirás un email con los detalles</Text>
                <Text style={styles.infoText}>• Puedes reprogramar con 24 horas de anticipación</Text>
              </View>
            </View>

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingButton}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.confirmButtonText}>Procesando...</Text>
                  </View>
                ) : (
                  <Text style={styles.confirmButtonText}>✅ Comprar</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6ED',
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#e6a902',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardBody: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: '#666',
  },
  paymentCard: {
    borderWidth: 2,
    borderColor: '#e6a902',
  },
  paymentHeader: {
    backgroundColor: '#e6a902',
    padding: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  paymentOptionSelected: {
    borderColor: '#e6a902',
    backgroundColor: '#fff8e1',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  paymentIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e6a902',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e6a902',
  },
  todayPayCard: {
    borderWidth: 1,
    borderColor: '#28a745',
  },
  todayPayHeader: {
    backgroundColor: '#28a745',
    padding: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  todayPayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  amountInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  currencySymbol: {
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e6a902',
  },
  dateTimeContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: 'white',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dateIcon: {
    fontSize: 20,
  },
  loadingSchedules: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 100,
  },
  infoAlert: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 120
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#e6a902',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dynamicFieldsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  scheduleInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  
  // Alerta de advertencia para fechas bloqueadas
  warningAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8
  },
  
  warningIcon: {
    fontSize: 16,
    marginRight: 8
  },
  
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    lineHeight: 18
  },
});

export default PurchaseSessionScreen;