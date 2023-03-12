import { type ProductCategories } from "@prisma/client";
import { z } from "zod";

export const TIME_IN_MS = {
  FIVE_MINUTES: 1000 * 60 * 5,
} as const;

const productCategories = {
  Appliances: "Appliances",
  Software_and_Games: "Software & Games",
  Beauty: "Beauty",
  Books: "Books",
  Car_and_Motorbike: "Car & Motorbike",
  Clothing_and_Accessories: "Clothing & Accessories",
  Collectibles: "Collectibles",
  Electronics: "Electronics",
  Furniture: "Furniture",
  Grocery_and_Food: "Grocery & Food",
  Health_and_Personal_Care: "Health & Personal Care",
  Home_and_Kitchen: "Home & Kitchen",
  Jewellery: "Jewellery",
  Movies_and_TV_Shows: "Movies & TV Shows",
  Music: "Music",
  Office_Products: "Office Products",
  Pet_Supplies: "Pet Supplies",
  Shoes_and_Footwear: "Shoes & Footwear",
  Sports_and_Fitness: "Sports & Fitness",
  Watches: "Watches",
  Other: "Other",
} as const;

export const PRODUCT_CATEGORIES = productCategories satisfies {
  [k in ProductCategories]: string;
};

export const ProductCategoriesValidator = z.nativeEnum(PRODUCT_CATEGORIES);
