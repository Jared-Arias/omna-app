import { api } from '@/services/auth/ctx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '../model/auth';

export const formatDate = (dateString: string) => {
        console.log('dateString:', dateString);
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${(date.getDate()+1).toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    export const getMembresias = async (): Promise<ApiResponse> => {
        try {
            const response = await api.get('/membresias');
            
            if (response.data) {
                return {
                    success: true,
                    data: response.data,
                    message: response.data.message || 'Membresías obtenidas exitosamente'
                };
            }
    
            return {
                success: false,
                message: 'Error al obtener las membresías'
            };
        } catch (error) {
            throw error;
        }
    }    


    export const getMembresiasById = async (id: number): Promise<ApiResponse> => {
        try {
            console.log('datos a enviar:', id);
            const response = await api.get(`/membresia/${id}`);
            console.log('response membresia:', response.data);
            if (response.data) {
                return {
                    success: true,
                    data: response.data,
                    message: response.data.message || 'Membresías obtenidas exitosamente'
                };
            }
    
            return {
                success: false,
                message: 'Error al obtener las membresías'
            };
        } catch (error) {
            throw error;
        }
    }    

export const parseServerErrors = (errorResponse: any) => {
    try {
        if (typeof errorResponse === 'string') {
            // Intenta convertir una cadena JSON a objeto
            try {
                errorResponse = JSON.parse(errorResponse);
            } catch (e) {
                return null; // No es un JSON válido
            }
        }
        
        // Si es un objeto con campos de errores
        if (errorResponse && typeof errorResponse === 'object') {
            return errorResponse;
        }
        
        return null;
    } catch (error) {
        console.error("Error parsing server errors:", error);
        return null;
    }
};

export const forgotPassword = async (email: string): Promise<ApiResponse> => {
    try {
        const response = await api.post('/user/forgot-password', {
            email: email
        });
        
        if (response.data) {
            await AsyncStorage.setItem('temp_email', email);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Código OTP enviado exitosamente'
            };
        }

        return {
            success: false,
            message: 'Ocurrió un error al procesar la solicitud'
        };
    } catch (error) {
        throw error;
    }
};

export const getTerms = async (): Promise<ApiResponse> => {
    try {
        const response = await api.get('/getTermsAndConditions');
        
        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Términos y condiciones obtenidos exitosamente'
            };
        }

        return {
            success: false,
            message: 'Error al obtener los términos y condiciones'
        };
    } catch (error) {
        throw error;
    }
}


export const getProtectedData = async (): Promise<ApiResponse> => {
    try {
        const response = await api.get('/getDataProtectionPolicy');
        
        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Datos protegidos obtenidos exitosamente'
            };
        }

        return {
            success: false,
            message: 'Error al obtener los datos protegidos'
        };
    } catch (error) {
        throw error;
    }
}


// Función para obtener IP del usuario
export const obtenerIPUsuario = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('No se pudo obtener IP:', error);
    return '127.0.0.1'; // IP por defecto
  }
};

// Función para obtener tasas de cambio
export const obtenerTasasCambio = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error(`Error en API: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.rates) {
      throw new Error('Respuesta de API inválida - sin rates');
    }
    
    return {
      USDCOP: data.rates.COP || 4100,
      USDCLP: data.rates.CLP || 950,
      USDPEN: data.rates.PEN || 3.8,
      USDBRL: data.rates.BRL || 5.2,
      USDMXN: data.rates.MXN || 17.5,
      USDECS: 1 // Ecuador usa USD
    };
  } catch (error) {
    console.error('Error obteniendo tasas:', error);
    // Retornar tasas por defecto
    return {
      USDCOP: 4100,
      USDCLP: 950,
      USDPEN: 3.8,
      USDBRL: 5.2,
      USDMXN: 17.5,
      USDECS: 1
    };
  }
};

export const getSesiones = async (id: string): Promise<ApiResponse> => {
    try {
        const response = await api.get(`/sessions/${id}`);
        
        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Datos de sesiones obtenidos exitosamente'
            };
        }

        return {
            success: false,
            message: 'Error al obtener los datos de sesiones'
        };
    } catch (error) {
        throw error;
    }
}

export const getBlogBySlug = async (slug: string): Promise<ApiResponse> => {
    try {
        const response = await api.get(`/blog/${slug}`);

        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Datos del blog obtenidos exitosamente'
            };
        }

        return {
            success: false,
            message: 'Error al obtener los datos del blog'
        };
    } catch (error) {
        throw error;
    }
}

export const getEscuelaBySlug = async (slug: string): Promise<ApiResponse> => {
    try {
        const response = await api.get(`/escuela/${slug}`);

        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Datos de la escuela obtenidos exitosamente'
            };
        }

        return {
            success: false,
            message: 'Error al obtener los datos del blog'
        };
    } catch (error) {
        throw error;
    }
}

export const verifyOTP = async (confirmation_code: string, email: string): Promise<ApiResponse> => {
    try {

        const response = await api.post('/validateEmailCode', {
            email,
            confirmation_code
        });

        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'OTP verificado exitosamente'
            };
        }

        return {
            success: false,
            message: 'Error al verificar el código OTP'
        };
    } catch (error) {
        throw error;
    }
};

export const enviarOTP = async (email: string): Promise<ApiResponse> => {
  try {
      
      const response = await api.post('/newProfesional', {
          email: email
      });

      console.log('response enviar OTP 1111:', response.data);
      if (response.data) {
          return {
              success: true,
              data: response.data.data,
              message: response.data.message || 'OTP enviado exitosamente'
          };
      }

      return {
          success: false,
          message: 'Error al enviar el OTP'
      };
  } catch (error) {
      throw error;
  }
};


export const enviarProfesionalPassAndPhone = async (user_id: string, phone: string, email: string,  password: string, password_confirmation:string): Promise<ApiResponse> => {
    try {
        
        const response = await api.post('/setProfesionalPassAndPhone', {
            user_id: user_id,
            phone: phone,
            email: email,
            password: password,
            password_confirmation: password_confirmation
        });
  
        
        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Contraseña y teléfono del profesional establecidos exitosamente'
            };
        }
  
        return {
            success: false,
            message: 'Error al establecer la contraseña y teléfono del profesional'
        };
    } catch (error) {
        throw error;
    }
  };


export const addToFavorite = async (id: string): Promise<ApiResponse> => {
    try {
  
        const response = await api.post('/addFavorite', {
            profesional_id: id
        });
  
        if (response.data) {
            console.log('response addFavorite:', response.data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Favorito agregado exitosamente'
            };
        }
  
        return {
            success: false,
            message: 'Error al agregar el favorito'
        };
    } catch (error) {
        throw error;
    }
  };

  export const deleteFavorite = async (id: string): Promise<ApiResponse> => {
    try {
  
        const response = await api.post('/removeFavorite', {
            profesional_id: id
        });
  
        if (response.data) {
            console.log('response addFavorite:', response.data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Favorito eliminado exitosamente'
            };
        }
  
        return {
            success: false,
            message: 'Error al eliminar el favorito'
        };
    } catch (error) {
        throw error;
    }
  };


  export const addRecommendetProfesional = async (id: number, valoration: string, comment: string): Promise<ApiResponse> => {
    try {
  
        const response = await api.post('/add-comment', {
            profesional_id: id,
            valoration: valoration,
            comment: comment
        });
  
        if (response.data) {
            console.log('response recomender insert:', response.data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Recomendación agregada exitosamente'
            };
        }
  
        return {
            success: false,
            message: 'Error al agregar la recomendación'
        };
    } catch (error) {
        throw error;
    }
  };

  export const sendMessageChat = async (id: string, message: string): Promise<ApiResponse> => {
    try {
  
        const response = await api.post('/send-message', {
            receiver_id: id,
            message: message
        });
  
        if (response.data) {
            console.log('response mensaje enviado:', response.data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Mensaje enviado exitosamente'
            };
        }
  
        return {
            success: false,
            message: 'Error al enviar el mensaje'
        };
    } catch (error) {
        throw error;
    }
  };

export const enviarPasswordNew = async (email: string): Promise<ApiResponse> => {
    try {
        if (!email) {
            throw new Error('Por favor ingrese su email');
        }
  
        const response = await api.post('/restorePassword', {
            email
        });
  
        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'OTP enviado exitosamente'
            };
        }
  
        return {
            success: false,
            message: 'Error al verificar el código OTP'
        };
    } catch (error) {
        throw error;
    }
  };


  export const updateProfesionalData = async (data: any): Promise<ApiResponse> => {
    const formData = new FormData();
    
    // Agregar todos los campos de datos del usuario al FormData
    Object.entries(data).forEach(([key, value]) => {
        if (key === 'images' && Array.isArray(value)) {
            value.forEach((image, index) => {
              formData.append(`images[${index}]`, image);
            })
        }else{
        formData.append(key, value as string);
        }
    });
    console.log('formData:', formData);
    try {
        
        const response = await api.post('/updateProfesionalData', formData);
  
        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Perfil actualizado correctamente'
            };
        }
  
        return {
            success: false,
            message: 'Error al actualizar el perfil'
        };
    } catch (error) {
        throw error;
    }
  };


export const reset_password = async (oldPassword: string, password: string,  password_confirmation: string): Promise<ApiResponse> => {
    try {
        

        const response = await api.post('/changePassword', {
            oldPassword,
            password,
            password_confirmation
        });

        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Cambio de contraseña exitoso'
            };
        }

        return {
            success: false,
            message: 'Error al reseterar la contraseña'
        };
    } catch (error) {
        throw error;
    }
};

export const getClient = async (): Promise<ApiResponse> => {
  try {
    // Realizar la solicitud al backend
    const response = await api.get(`/me`);
    console.log('respuesta cliente: ', response.data);
    if (response.data) {
      const { data } = response.data;
      console.log('data client:', data);
      return {
        success: true,
        data,
        message: response.data.message || 'Cliente obtenido exitosamente',
      };
    }
    
    return {
      success: false,
      message: 'Error al obtener la información del cliente',
    };
  } catch (error: any) {
    console.error('Error en getClient:', error);

    // Manejar error 404 específicamente
    if (error.response && error.response.status === 404) {
      return {
        success: false,
        message: 'Cliente no encontrado',
      };
    }
    
    return {
      success: false,
      message: error.message || 'Ocurrió un error al obtener el cliente',
    };
  }
};

export const getProfile = async (): Promise<ApiResponse> => {
    try {

        // Realizar la solicitud al backend
        const response = await api.get('/user/profile', {
        });
        console.log('response getProfile:', response.data);
        if (response.data) {

            const { data } = response.data;

            await AsyncStorage.setItem('profile_image', data.profile_image || '');

            return {
                success: true,
                data,
                message: 'Perfil obtenido exitosamente',
            };
        }

        return {
            success: false,
            message: 'Error al obtener el perfil del usuario',
        };
    } catch (error: any) {
        console.error('Error en getProfile:', error);
        return {
            success: false,
            message: error.message || 'Ocurrió un error al obtener el perfil',
        };
    }
};


export const getCoutries = async (): Promise<ApiResponse> => {
    try {

        // Realizar la solicitud al backend
        const response = await api.get('/countries-all', {
        });

        if (response.data) {
            
            const { data } = response.data;
            return {
                success: true,
                data,
                message: 'Paises obtenidos exitosamente',
            };
        }

        return {
            success: false,
            message: 'Error al obtener países',
        };
    } catch (error: any) {
        console.error('Error en getCountries:', error);
        return {
            success: false,
            message: error.message || 'Ocurrió un error al obtener países',
        };
    }
};

export const getEspana = async (): Promise<ApiResponse> => {
    try {

        // Realizar la solicitud al backend
        const response = await fetch('https://servireal.com/api/regions', {
            method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }, 
        });
        const data = await response.json();
        if (data.data) {
            return {
                success: true,
                data: data.data,
                message: 'Paises obtenidos exitosamente',
            };
        }

        return {
            success: false,
            message: 'Error al obtener países',
        };
    } catch (error: any) {
        console.error('Error en getCountries:', error);
        return {
            success: false,
            message: error.message || 'Ocurrió un error al obtener países',
        };
    }
};

export const updateProfile = async (data: any): Promise<ApiResponse> => {
    try {
        const formData = new FormData();
        console.log('data updateProfile:', data.profile_image);
    // Agregar todos los campos de datos del usuario al FormData
    Object.entries(data).forEach(([key, value]) => {
    if (key === 'profile_image' && value) {
      // Manejar la imagen de perfil de manera especial para React Native
      if (typeof value === 'string') {
        formData.append(key, value);
      }
      if (typeof value === 'object' && value !== null) {
        // Verificar que tenga la estructura correcta para React Nativ
        const imageObj = value as any;
        if (imageObj.uri) {
          // Crear el objeto correcto para React Native FormData
          formData.append(key, {
            uri: imageObj.uri,
            type: imageObj.type || 'image/jpeg', // Tipo por defecto
            name: imageObj.name || 'profile_image.jpg', // Nombre por defecto
          } as any);
        } else {
          console.warn('Imagen no tiene URI válido:', imageObj);
        }
      }
    } else if (value !== null && value !== undefined) {
      // Para todos los demás campos, convertir a string solo si no son null/undefined
      formData.append(key, String(value));
    }
  });
    


    console.log('formData updateProfile:', formData);
       
        const response = await api.post('/updateClientData', formData);
        
        if (response.data) {
            const { data, message } = response.data;
           

            return {
                success: true,
                data,
                message: message || 'Profile updated successfully',
            };
        }
        return {
            success: false,
            message: 'Error updating profile',
        };
    } catch (error: any) {
        console.error('Detailed error in updateProfile:', error.response || error);
        throw error;
    }
};


export const deleteAccount = async (): Promise<ApiResponse> => {
    try {
        const response = await api.get('/user/delete-account');

        if (response.data) {
            // Limpiar todos los datos almacenados localmente
            await AsyncStorage.multiRemove([
                'auth_token',
                'user_id',
                'user_email',
                'user_full_name',
                'profile_image',
                'banner_image',
                'temp_email'
            ]);

            return {
                success: true,
                message: response.data.message || 'Cuenta eliminada exitosamente'
            };
        }

        return {
            success: false,
            message: 'Error al eliminar la cuenta'
        };
    } catch (error: any) {
        console.error('Error en deleteAccount:', error);
        throw error;
    }
};

export function extractFirstErrorMessage(errorObject:any) {
    // Si es string, intentar parsearlo como JSON
    let errors;
    try {
      errors = typeof errorObject === 'string' ? JSON.parse(errorObject) : errorObject;
    } catch (e) {
      return errorObject; // Si no se puede parsear, devolver el original
    }
    
    // Buscar el primer campo con errores y tomar su primer mensaje
    for (const field in errors) {
      if (Array.isArray(errors[field]) && errors[field].length > 0) {
        return errors[field][0];
      }
    }
}


  export const getTransactions = async (): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.post(`/transactions`);
    console.info('respuesta de trasaciones: ', response.data);
    if (response.data && response.data.status === 'success') {
        const { data } = response.data;
        
        return {
          success: true,
          data,
          message: response.data.message || 'Transtactions obtenido exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información de las transactions',
      };
    } catch (error: any) {
        console.error('Error en trastactions:', error);
        throw error;
    }
  };

  export const getSessions = async (): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`sessions`);
    if (response.data) {
        const { data } = response.data;
        
        return {
          success: true,
          data,
          message: response.data.message || 'Sesiones obtenidas exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información de las sesiones',
      };
    } catch (error: any) {
        console.error('Error en currencies:', error);
        throw error;
    }
  };

  export const getBlog = async (): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`blog/populares/9`);
    if (response.data) {
        const { data } = response.data;
        
        return {
          success: true,
          data,
          message: response.data.message || 'Blog obtenido exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información del blog',
      };
    } catch (error: any) {
        console.error('Error en currencies:', error);
        throw error;
    }
  };


  export const getAgenda = async (): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`/agenda_user_app`);
    if (response.data) {
        
        const { data } = response.data;
        return {
          success: true,
          data,
          message: response.data.message || 'Blog obtenido exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información del blog',
      };
    } catch (error: any) {
        console.error('Error en currencies:', error);
        throw error;
    }
  };


  export const getEscuela = async (): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`/escuela?page=1`);
    if (response.data) {
        const { data } = response.data;
        
        return {
          success: true,
          data,
          message: response.data.message || 'Escuela obtenida exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información de la escuela',
      };
    } catch (error: any) {
        console.error('Error en getEscuela:', error);
        throw error;
    }
  };

  export const getAbout = async (): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`app-about`);
    if (response.data) {
        const { data } = response.data;
        
        return {
            success: true,
            data,
            message: response.data.message || 'Información sobre la app obtenida exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información del about',
      };
    } catch (error: any) {
        console.error('Error en currencies:', error);
        throw error;
    }
  };


  export const getHorariosNoDisponibleSesiones = async (sesionId: string, fechaInicio: any, fechaFin: any): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`/sesiones/${sesionId}/fechas-no-disponibles?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
    if (response.data) {
        const { data } = response;
        
        return {
            success: true,
            data,
            message: response.data.message || 'Información sobre la app obtenida exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información del about',
      };
    } catch (error: any) {
        console.error('Error en currencies:', error);
        throw error;
    }
  };

  export const getHorariosEscuela = async (escuelaId: string): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`/horario-escuela/${escuelaId}`);
    if (response.data) {
        const { data } = response;
        
        return {
            success: true,
            data,
            message: response.data.message || 'Información sobre la app obtenida exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información del about',
      };
    } catch (error: any) {
        console.error('Error en currencies:', error);
        throw error;
    }
  };


  export const getHorariosDisponibleSesiones = async (sesionId: string, fecha: any): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`/horarios-disponibles?fecha=${fecha}&sesion_id=${sesionId}`);
    if (response.data) {
        const { data } = response;
        
        return {
            success: true,
            data,
            message: response.data.message || 'Información sobre la app obtenida exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información del about',
      };
    } catch (error: any) {
        console.error('Error en currencies:', error);
        throw error;
    }
  };


  export const getProfesionalRated = async (): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`/profesionals/most_rated`);
    if (response.data && response.data.status === 'success') {
        const { data } = response.data;
        console.log('profesionales mas buscados:', data);   
        return {
          success: true,
          data,
          message: response.data.message || 'Profesionales obtenidos exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información de los profesionales',
      };
    } catch (error: any) {
        console.error('Error en getProfesionalRated:', error);
        throw error;
    }
  };

  export const getSearchProfesionals = async (paramsSearch: string): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`/profesionals/${paramsSearch}`);	
    if (response.data && response.data.status === 'success') {
        const { data } = response.data;
        console.log('profesionales mas buscados:', data);   
        return {
          success: true,
          data,
          message: response.data.message || 'Profesionales obtenidos exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información de los profesionales',
      };
    } catch (error: any) {
        console.error('Error en getProfesionalRated:', error);
        throw error;
    }
  };
  
  
  export const getProfesionalesById = async (id: any): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`/category/${id}`);
    if (response.data && response.data.status === 'success') {
        
        const { data } = response.data;
        return {
          success: true,
          data,
          message: response.data.message || 'Profesionales obtenidos exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información de las categorías',
      };
    } catch (error: any) {
        console.error('Error en currencies:', error);
        throw error;
    }
  };

  export const getProfesionalDetailsById = async (id: any): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`/profesional/${id}`);
    if (response.data && response.data.status === 'success') {
        const { data } = response.data;
        
        return {
          success: true,
          data,
          message: response.data.message || 'Profesionales obtenidos exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información de las categorías',
      };
    } catch (error: any) {
        console.error('Error en currencies:', error);
        throw error;
    }
  };

  export const searchIncremetById = async (id: any): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`/category/${id}?from_search`);
    if (response.data && response.data.status === 'success') {
        const { data } = response.data;
        
        return {
          success: true,
          data,
          message: response.data.message || 'Profesionales obtenidos exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información de las categorías',
      };
    } catch (error: any) {
        console.error('Error en currencies:', error);
        throw error;
    }
  };

  export const getMessageById = async (id: any): Promise<ApiResponse> =>{
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`/get-messages/${id}`);
    if (response.data && response.data.status === 'success') {
        const { data } = response.data;
        
        return {
          success: true,
          data,
          message: response.data.message || 'Mensajes obtenidos exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información de los mensajes',
      };
    } catch (error: any) {
        console.error('Error en getMessageById:', error);
        throw error;
    }
  };

  export const add_Limit_Whatsapp = async (id: any): Promise<ApiResponse> => {
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`profesional/${id}/whatsapp`);
    if (response.data && response.data.status === 'success') {
        const { data } = response.data;
        
        return {
          success: true,
          data,
          message: response.data.message || 'Mensajes obtenidos exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información de los mensajes',
      };
    } catch (error: any) {
        console.error('Error en getMessageById:', error);
        throw error;
    }
  };


  export const add_Limit_Instagram = async (id: any): Promise<ApiResponse> => {
    try {
        // Realizar la solicitud al backend
    const response = await api.get(`profesional/${id}/instagram`);
    if (response.data && response.data.status === 'success') {
        const { data } = response.data;
        
        return {
          success: true,
          data,
          message: response.data.message || 'Mensajes obtenidos exitosamente',
        };
      }
      
      return {
        success: false,
        message: 'Error al obtener la información de los mensajes',
      };
    } catch (error: any) {
        console.error('Error en getMessageById:', error);
        throw error;
    }
  };

  export const pagarConBizum = async (membresia_id: string, price: string, duration: string): Promise<ApiResponse> => {
    try {

        console.log('Pagando con Bizum:', { membresia_id, price, duration });

        const response = await api.post('/payments/paymentGetnetBizum', {
            membresia_id,
            price,
            duration
        });
  
        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Pago con Bizum exitoso'
            };
        }
  
        return {
            success: false,
            message: 'Error al pagar con Bizum'
        };
    } catch (error) {
        throw error;
    }
  };

  export const pagarConBinance = async (binanceData: {}): Promise<ApiResponse> => {
    try {

        console.log('Pagando con Binance:', binanceData);

        const response = await api.post('/compra/binance', binanceData);

        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Pago con Binance exitoso'
            };
        }
  
        return {
            success: false,
            message: 'Error al pagar con Binance'
        };
    } catch (error) {
        throw error;
    }
  };

  export const pagarConTodayPay = async (todayPayData: {}): Promise<ApiResponse> => {
    try {

        console.log('Pagando con TodayPay:', todayPayData);

        const response = await api.post('/compra/todaypay', todayPayData);

        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Pago con Binance exitoso'
            };
        }
  
        return {
            success: false,
            message: 'Error al pagar con Binance'
        };
    } catch (error) {
        throw error;
    }
  };

  export const purchaseSession = async (sesionData: {}): Promise<ApiResponse> => {
    try {

        console.log('datos enviados para crear sesión:', sesionData);

        const response = await api.post('/sesiones_agendar', sesionData);

        if (response.status === 200 && response.data) {
            console.log('response purchaseSession:', response.data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'agenda creada exitosamente'
            };
        }
  
        return {
            success: false,
            message: 'Error al crear la agenda purchaseSession'
        };
    } catch (error) {
        throw error;
    }
  };

  export const purchaseEscuela = async (escuelaData: {}): Promise<ApiResponse> => {
    try {

        console.log('datos enviados para crear sesión:', escuelaData);

        const response = await api.post('/escuela_agendar', escuelaData);

        if (response.status === 200 && response.data) {
            console.log('response purchaseEscuela  :', response.data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'agenda creada exitosamente'
            };
        }
  
        return {
            success: false,
            message: 'Error al crear la agenda purchaseEscuela'
        };
    } catch (error) {
        throw error;
    }
  };

  export const pagarConRedireccion = async (membresia_id: string, price: string, duration: string): Promise<ApiResponse> => {
    try {

        console.log('Pagando con redirección:', { membresia_id, price, duration });

        const response = await api.post('/payments/paymentGetnetRedireccion', {
            membresia_id,
            price,
            duration
        });
  
        if (response.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Pago con redirección exitoso'
            };
        }
  
        return {
            success: false,
            message: 'Error al pagar con redirección'
        };
    } catch (error) {
        throw error;
    }
  };


  export const sendMessageSupport = async (title: string, content: string): Promise<ApiResponse> => {
    try {
  
        const response = await api.post('/send-message-to-support', {
            title: title,
            content: content
        });
  
        if (response.data) {
            console.log('response mensaje enviado:', response.data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Mensaje enviado exitosamente'
            };
        }
  
        return {
            success: false,
            message: 'Error al enviar el mensaje'
        };
    } catch (error) {
        throw error;
    }
  };
