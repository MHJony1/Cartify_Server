import { z } from "zod";

const analyticsQuerySchema = z.object({
  query: z
    .object({
      from: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
      to: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
      period: z.enum(["7d", "30d", "90d", "1y", "custom"]).optional(),
      limit: z
        .string()
        .optional()
        .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 50), {
          message: "Limit must be a positive number up to 50",
        }),
      page: z
        .string()
        .optional()
        .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
          message: "Page must be a positive number",
        }),
    })
    .refine(
      (data) => {
        if (data.from && data.to) {
          const fromDate = new Date(data.from);
          const toDate = new Date(data.to);
          return fromDate <= toDate;
        }
        return true;
      },
      {
        message: "The 'from' date cannot be after the 'to' date",
        path: ["from"],
      }
    ),
});

export const AdminValidation = {
  analyticsQuerySchema,
};
