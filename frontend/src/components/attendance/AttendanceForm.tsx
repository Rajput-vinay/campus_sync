import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";

import Modal from "@/components/global/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  totalWorkingDays: z.string().min(1, "Required"),
  daysPresent: z.string().min(1, "Required"),
  monthNumber: z.string().min(1, "Required"),
  year: z.string().min(1, "Required"),
}).refine((data) => Number(data.daysPresent) <= Number(data.totalWorkingDays), {
  message: "Days present cannot exceed total working days",
  path: ["daysPresent"],
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AttendanceForm = ({ open, onOpenChange, onSuccess }: Props) => {
  const { year } = useAuth();
  const currentMonth = months[new Date().getMonth()];
  const currentYearStr = new Date().getFullYear().toString();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalWorkingDays: "25",
      daysPresent: "",
      monthNumber: (new Date().getMonth() + 1).toString(),
      year: new Date().getFullYear().toString(),
    },
  });

  const onSubmit = async (values: any) => {
    try {
      await api.post("/attendance/submit", {
        totalWorkingDays: Number(values.totalWorkingDays),
        daysPresent: Number(values.daysPresent),
        monthNumber: Number(values.monthNumber),
        year: Number(values.year),
        academicYear: year?._id,
      });
      toast.success("Attendance submitted successfully");
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to submit attendance");
    }
  };

  return (
    <Modal
      open={open}
      setOpen={onOpenChange}
      title="Submit Attendance"
      description="Enter your working days and presence for the month."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="monthNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {months.map((m, index) => (
                        <SelectItem key={m} value={(index + 1).toString()}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="totalWorkingDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working Days</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="daysPresent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days Present</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting..." : "Submit Attendance"}
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default AttendanceForm;
