import { z } from "zod";

// Zod Schema for the Form (sending IDs to backend)
export const tradeFormSchema = z.object({
  name: z.string().min(1, "Trade name is required"),
  capacity: z.coerce.number().positive("Capacity must be greater than 0"),
  academicYear: z.string().min(1, "Academic year is required"),
  tradeTeacher: z.string().optional(),
  subjectIds: z.array(z.string()),
});

export type TradeFormValues = z.infer<typeof tradeFormSchema>;
