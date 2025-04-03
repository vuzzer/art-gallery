export interface Product {
    _id: string;
    name: string;
    discounted_price: number;
    description: string;
    rating: number;
    reviews: number;
    trending: boolean;
    size: number;
    category_name: string;
    img: string;
    original_price: number;
    is_stock: boolean;
}