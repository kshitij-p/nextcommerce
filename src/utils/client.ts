import { type ProductCategories } from "@prisma/client";
import { z } from "zod";

export const TIME_IN_MS = {
  FIVE_MINUTES: 1000 * 60 * 5,
} as const;

const productCategories = {
  Appliances: "Appliances",
  Electronics: "Electronics",
  Software_and_Games: "Software & Games",
  Other: "Other",
} as const;

export const PRODUCT_CATEGORIES = productCategories satisfies {
  [k in ProductCategories]: string;
};

export const ProductCategoriesValidator = z.nativeEnum(PRODUCT_CATEGORIES);
