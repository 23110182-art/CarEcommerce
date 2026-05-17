export interface Car {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
  };
  price: number;
  year: number;
  transmission: string;
  drivetrain: string;
  images: string[];
  slug: string;
  isFeatured?: boolean;
  stock?: number;
}

export interface CarListResponse {
  data: Car[];
  message: string;
}
