import CustomHeader from '@/components/customHeader';
import { getAgenda } from '@/services/auth/userDataController/authService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const AgendaScreen = () => {
  const [agendaData, setAgendaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Función para generar fechas de eventos recurrentes
  const generateRecurringDates = (event) => {
    const events = [];
    const startDate = new Date(event.startRecur);
    const endDate = new Date(event.endRecur);
    
    // Obtener el día de la semana del evento (asumiendo que viene en daysOfWeek[0])
    const dayOfWeek = event.daysOfWeek && event.daysOfWeek.length > 0 ? event.daysOfWeek[0] : 1;
    
    // Generar todas las fechas que coincidan con el día de la semana
    const currentDate = new Date(startDate);
    
    // Ajustar al primer día de la semana correspondiente
    while (currentDate.getDay() !== dayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    while (currentDate <= endDate) {
      events.push({
        id: `${event.id}_${currentDate.toISOString().split('T')[0]}`,
        title: event.title,
        date: new Date(currentDate),
        startTime: event.startTime,
        endTime: event.endTime,
        backgroundColor: event.backgroundColor,
        textColor: event.textColor,
        type: 'recurring'
      });
      
      // Avanzar a la siguiente semana
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return events;
  };

  // Función para procesar los datos de la agenda
  const processAgendaData = (data) => {
    const processedEvents = [];
    
    data.forEach(event => {
      if (event.start && event.end) {
        // Evento individual
        processedEvents.push({
          id: event.id,
          title: event.title,
          date: new Date(event.start),
          startTime: event.start.split(' ')[1].substring(0, 5),
          endTime: event.end.split(' ')[1].substring(0, 5),
          backgroundColor: event.backgroundColor,
          textColor: event.textColor,
          type: 'individual'
        });
      } else if (event.startRecur && event.endRecur) {
        // Evento recurrente
        const recurringEvents = generateRecurringDates(event);
        processedEvents.push(...recurringEvents);
      }
    });
    
    // Ordenar por fecha
    return processedEvents.sort((a, b) => a.date - b.date);
  };

  // Obtener eventos del día seleccionado
  const getEventsForDate = (date) => {
    const dateStr = date.toDateString();
    return agendaData.filter(event => event.date.toDateString() === dateStr);
  };

  // Obtener fechas únicas con eventos
  const getDatesWithEvents = () => {
    const uniqueDates = [];
    const dateStrings = new Set();
    
    agendaData.forEach(event => {
      const dateStr = event.date.toDateString();
      if (!dateStrings.has(dateStr)) {
        dateStrings.add(dateStr);
        uniqueDates.push(event.date);
      }
    });
    
    return uniqueDates.sort((a, b) => a - b);
  };

  // Formatear fecha para mostrar
  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  };

  // Formatear fecha corta
  const formatShortDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('useFocusEffect ejecutado');
      
      const fetchAgenda = async () => {
        try {
          setLoading(true);
          console.log('Iniciando petición getAgenda...');
          const res = await getAgenda();
          console.log('agenda', res);
          
          if (res.success && res.data) {
            const processedData = processAgendaData(res.data);
            setAgendaData(processedData);
            
            // Seleccionar la primera fecha con eventos o la fecha actual
            const datesWithEvents = processedData.map(event => event.date);
            if (datesWithEvents.length > 0) {
              const today = new Date();
              const todayHasEvents = datesWithEvents.some(date => 
                date.toDateString() === today.toDateString()
              );
              
              if (todayHasEvents) {
                setSelectedDate(today);
              } else {
                setSelectedDate(datesWithEvents[0]);
              }
            }
          }
        } catch (error) {
          console.error('Error al obtener agenda:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAgenda();
    }, [])
  );

  // Renderizar item de fecha en la lista horizontal
  const renderDateItem = ({ item: date }) => {
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const eventsCount = getEventsForDate(date).length;
    
    return (
      <TouchableOpacity
        style={[styles.dateItem, isSelected && styles.selectedDateItem]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[styles.dateItemDay, isSelected && styles.selectedDateText]}>
          {date.getDate()}
        </Text>
        <Text style={[styles.dateItemMonth, isSelected && styles.selectedDateText]}>
          {date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
        </Text>
        {eventsCount > 0 && (
          <View style={[styles.eventDot, isSelected && styles.selectedEventDot]}>
            <Text style={styles.eventCount}>{eventsCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Renderizar evento
  const renderEvent = ({ item: event }) => {
    return (
      <View style={[styles.eventItem, { backgroundColor: event.backgroundColor }]}>
        <View style={styles.eventContent}>
          <Text style={[styles.eventTitle, { color: event.textColor }]}>
            {event.title}
          </Text>
          <View style={styles.eventTimeContainer}>
            <Ionicons name="time-outline" size={16} color={event.textColor} />
            <Text style={[styles.eventTime, { color: event.textColor }]}>
              {event.startTime} - {event.endTime}
            </Text>
          </View>
          <Text style={[styles.eventType, { color: event.textColor }]}>
            {event.type === 'recurring' ? 'Evento recurrente' : 'Evento individual'}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.maincontainer}>
        <CustomHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Cargando agenda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const datesWithEvents = getDatesWithEvents();
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <SafeAreaView style={styles.maincontainer}>
      <CustomHeader />
      <View style={styles.container}>
        <Text style={styles.title}>Mi Agenda</Text>
        
        {datesWithEvents.length > 0 ? (
          <>
            {/* Lista horizontal de fechas */}
            <View style={styles.datesContainer}>
              <FlatList
                data={datesWithEvents}
                renderItem={renderDateItem}
                keyExtractor={(item) => item.toISOString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.datesList}
              />
            </View>

            {/* Fecha seleccionada */}
            <View style={styles.selectedDateContainer}>
              <Text style={styles.selectedDateTitle}>
                {formatDate(selectedDate)}
              </Text>
            </View>

            {/* Lista de eventos del día seleccionado */}
            <View style={styles.eventsContainer}>
              {selectedDateEvents.length > 0 ? (
                <FlatList
                  data={selectedDateEvents}
                  renderItem={renderEvent}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.eventsList}
                />
              ) : (
                <View style={styles.noEventsContainer}>
                  <Ionicons name="calendar-outline" size={48} color="#ccc" />
                  <Text style={styles.noEventsText}>
                    No hay eventos para esta fecha
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No hay eventos programados</Text>
            <Text style={styles.emptySubtitle}>
              Tus próximos eventos aparecerán aquí
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AgendaScreen;

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: '#FAF6ED',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF6ED',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  datesContainer: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  datesList: {
    paddingHorizontal: 5,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 80,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedDateItem: {
    backgroundColor: '#007bff',
  },
  dateItemDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dateItemMonth: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectedDateText: {
    color: '#fff',
  },
  eventDot: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedEventDot: {
    backgroundColor: '#fff',
  },
  eventCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedDateContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  eventsList: {
    paddingBottom: 20,
  },
  eventItem: {
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTime: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  eventType: {
    fontSize: 12,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});