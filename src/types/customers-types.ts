export interface getCustomersParams {
  page?: number;
  pageSize?: number;
  name?: string;
  email?: string;
}

export interface getCustomersFilterParams {
  name?: {
    contains: string;
    mode?: 'insensitive';
  };
  email?: {
    contains: string;
    mode?: 'insensitive';
  };
}

export interface getCustomerShippingParams {
  customerId: string;
}

export interface getCustomerShippingMelhorEnvioParams {
  customerZipCode: string;
}
