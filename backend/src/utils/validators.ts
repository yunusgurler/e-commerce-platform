import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  category: z.string().min(1), // category ID
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  specifications: z.record(z.any()).optional(),
  variants: z
    .array(
      z.object({
        size: z.string().optional(),
        color: z.string().optional(),
        additionalPrice: z.number().nonnegative().optional(),
        inventoryCount: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
  inventoryCount: z.number().int().nonnegative().optional(),
});

export const updateProductSchema = createProductSchema.partial();
