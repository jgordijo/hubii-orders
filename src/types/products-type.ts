export interface getProductsParams {
  productsIds: string[];
}

export interface product {
  id: string;
  name: string;
  price: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface getProductsResponse {
  list: product[];
  meta: {
    currentPage: number;
    lastPage: number;
    total: number;
  };
}

export interface updateProductStockBody {
  products: {
    productId: string;
    quantity: number;
    action: stockActionEnum;
    description: string;
  }[];
}

export enum stockActionEnum {
  SELL = 'SELL',
  PURCHASE = 'PURCHASE',
}
