import { ClientResponse } from '@/services/auth/model/auth';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Estado inicial según la nueva estructura
const initialState: ClientResponse = {
  user: {
    id: 0,
    email: '',
    avatar_url: null,
    role_id: 0,
    state_id: 0,
    remember_token: null,
    created_at: '',
    email_verified_at: null,
    updated_at: null,
    role: {
      id: 0,
      name: '',
      slug: ''
    },
    state: {
      id: 0,
      name: '',
      slug: ''
    },
    conversation: []
  },
  userData: {
    id: 0,
    user_id: 0,
    first_name: '',
    last_name: '',
    fullname: '',
    phone: '',
    city: '',
    state: '',
    membresia_id: 0,
    country: null,
    created_at: '',
    updated_at: '',
    birthdate: null,
    favorites: [],
    work_images: []
  }
};

const clientSlice = createSlice({
  name: 'clientData',
  initialState,
  reducers: {
    setClient(state, action: PayloadAction<ClientResponse>) {
      // Actualiza todo el estado con la respuesta del cliente
      return action.payload;
    },
    updateImage(state, action: PayloadAction<string>) {
      // Actualiza solo la URL del avatar
      state.user.avatar_url = action.payload;
    },
    // Puedes agregar más reducers según necesites
    updateUserData(state, action: PayloadAction<Partial<ClientResponse['userData']>>) {
      // Para actualizar campos específicos de userData
      state.userData = {
        ...state.userData,
        ...action.payload
      };
    },
    updateUserInfo(state, action: PayloadAction<Partial<ClientResponse['user']>>) {
      // Para actualizar campos específicos del usuario
      state.user = {
        ...state.user,
        ...action.payload
      };
    }
  },
})

export const { setClient, updateImage, updateUserData, updateUserInfo } = clientSlice.actions;
export default clientSlice.reducer;