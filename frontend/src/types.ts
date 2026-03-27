import React from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  location: LocationData | null;
  loadingLocation: boolean;
  city: string;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingLocation: React.Dispatch<React.SetStateAction<boolean>>;
  setCity: React.Dispatch<React.SetStateAction<string>>;
  setLocation: React.Dispatch<React.SetStateAction<LocationData | null>>;
  cart:ICart[] | null ;
  fetchCart:()=>Promise<void>;
  subTotal:number;
  quantity:number;
}

export interface IRestaurant {
  _id: string; //here we need a extra field (_id) for update and delete restaurant
  name: string;
  description?: string;
  image: string;
  ownerId: string;
  phone: number;
  isVerified: boolean;

  autoLocation: {
    type: "Point";
    coordinates: [number, number]; //[longitude,latitude]
    formattedAddress: string;
  };

  isOpen: boolean;
  createdAt: Date;
}
export interface IMenuItems {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface ICart {
  _id:string;
  userId: string | User;
  restaurantId: string | IRestaurant;
  itemId: string | IMenuItems;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}