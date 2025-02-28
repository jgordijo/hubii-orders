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
