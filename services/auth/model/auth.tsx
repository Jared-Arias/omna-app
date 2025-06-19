export interface Role {
  id: number;
  slug: string;
  name: string;
}

export interface UserRegister {
  email: string;
  state_id: number;
  role_id: number;
  updated_at: string;
  created_at: string;
  id: number;
}

export interface State {
  id: number;
  model: string;
  slug: string;
  name: string;
}




export interface ApiResponse {
    success: boolean;
    data?: any;
    message?: string;
}
export interface ValidarEmailData {
  email: string;
}

  export interface SignUpData {
    email: string;
    password: string;
    password_confirmation: string;
  }
  
  export interface SignUpResponse {
    status: boolean;
    message: string;
    data: {
      access_token: string;
      user: UserRegister;
    };
  }

    
  export interface Field {
    [field: string]: string[]; // Por ejemplo: { email: ["Email inválido"], password: ["Contraseña requerida"] }
  }
  export interface AuthResponse {
    status: 'success' | 'error';
    message: Field | string;
    access_token?: string;
    data?: UserRegister;
    validationErrors?: ValidationError;
  }
  
  export interface ValidationError {
    email?: string;
    password?: string;
    full_name?: string;
    terms?: string;
  }

  
  
  export interface CountryResponse {
    success: boolean;
    data?: Country[];
    message?: string;
  }
  
 export interface PickerItem {
    label: string;
    value: string;
  }

 

 // Define interfaces for our data models

 export interface ImagePickerAsset {
   uri: string;
   type: string;
   name: string;
 }



 export interface Transaction {
   id: string;
   icon: any; // ImageSourcePropType;
   title: string;
   date: string;
   amount: number;
   currency: string;
   status: 'Procesado' | 'Cancelado' | 'Procesando';
   bank?: string;
   reference?: string;
 } 
  
// Component props interface
export interface MovementCardProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
} 




interface CountryStaes{
  name: string;
  cities: string[];
}

export interface Country {
  id: number;
  name: string;
  abb: string;
  phonecode: string;
  flag_url: string;
  states: CountryStaes[];
}


// Interfaces auxiliares
export interface State {
  id: number;
  name: string;
  slug: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
}

export interface conversation{
    fullname: string;
    avatar_url: string; // You can replace 'any' with the specific type if known
    last_message: string;
    date: string;
    unread: boolean;
    user_id: string;
    hasButton?: boolean;
}

export interface User {
  id: number;
  email: string;
  avatar_url: null | string;
  role_id: number;
  state_id: number;
  remember_token: null | string;
  created_at: string;
  email_verified_at: null | string;
  updated_at: null | string;
  role: Role;
  state: State;
  conversation: conversation[];
}

export interface favorites{
  id: string;
  description: string;
  fullname: string;
  avatar_url?: string;
}

export interface UserData {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  fullname?: string ;
  phone: string;
  city: string;
  state: string;
  country: null | string;
  created_at: string;
  updated_at: string;
  birthdate: null | string;
  favorites: favorites[];
  work_images: [];
  membresia_id: number;
}

// Interfaz principal para la respuesta del cliente
export interface ClientResponse {
  user: User;
  userData: UserData;
}