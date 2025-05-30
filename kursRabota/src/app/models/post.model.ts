import { Author } from './user.model';
import { Category } from './category.model';

export interface IngredientItem {
  name: string;
  amount: number;
  unit: string;
}

export interface Post {
  idPost?: number;
  title: string;
  anons: string;
  description: string;
  ingredients?: string;
  photo?: string;
  dateCreate: string;
  dateUpdate?: string;
  author: Author;
  category: Category;
  ingredientItems: IngredientItem[];
  ingredientAmounts: { [key: string]: number };
  preparationTime?: number;
  cookingTime?: number;
  temperature?: number;
}