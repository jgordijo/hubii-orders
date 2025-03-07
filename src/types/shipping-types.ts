export interface ShippingCompany {
  id: number;
  name: string;
}

export interface ShippingService {
  id: number;
  name: string;
  price?: string;
  delivery_time?: number;
  error?: string;
  company: ShippingCompany;
}

export interface ShippingRateResponse {
  shippingServices: ShippingService[];
}

export interface ShippingRateParams {
  customerZipCode: string;
}

export interface ShippingInfo {
  customerId: string;
  zipCode: string;
  pac: string | number;
  sedex: string | number;
  dotPackage: string | number;
  dotCom: string | number;
  expresso: string | number;
}
