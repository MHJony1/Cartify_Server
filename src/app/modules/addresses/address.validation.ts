import { z } from "zod";

const createAddressSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    division: z.string().min(1, "Division is required"),
    district: z.string().min(1, "District is required"),
    area: z.string().min(1, "Area is required"),
    addressLine: z.string().min(1, "Address line is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    isDefault: z.boolean().optional(),
  }),
});

const updateAddressSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    division: z.string().optional(),
    district: z.string().optional(),
    area: z.string().optional(),
    addressLine: z.string().optional(),
    postalCode: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const AddressValidation = {
  createAddressSchema,
  updateAddressSchema,
};
