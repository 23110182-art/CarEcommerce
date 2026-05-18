export interface CarImage {
  _id?: string;
  url: string;
  sort_order?: number;
}

export interface CarFeature {
  _id?: string;
  name: string;
  value: string;
}

export interface Car {
  _id: string;
  name: string;
  slug: string;
  brand_id: {
    _id: string;
    name: string;
    logo?: string;
  };
  category_id?: {
    _id: string;
    name: string;
  };
  price: number;
  sale_price?: number;
  applied_promotion?: {
    _id: string;
    name: string;
    description: string;
    discount_type: 'percentage' | 'amount';
    discount_value: number;
    end_date: string;
  };
  year: number;
  condition: 'new' | 'used';
  mileage: number;
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  seats: number;
  color: string;
  engine?: string;
  horsepower?: number;
  stock: number;
  sold_count?: number;
  description?: string;
  thumbnail: string;
  is_featured: boolean;
  images: CarImage[];
  features: CarFeature[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CarListResponse {
  cars: Car[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}
