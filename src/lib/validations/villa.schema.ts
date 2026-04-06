import { z } from "zod";

export const villaSchema = z.object({
  name: z.string().min(2, "Villa name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  base_price: z.number().positive("Price must be a positive number"),
  max_guests: z.number().int().min(1).max(50),
  bedrooms: z.number().int().min(1),
  bathrooms: z.number().int().min(1),
  is_featured: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
  location: z.string().min(2),
});

export type VillaFormData = z.infer<typeof villaSchema>;
