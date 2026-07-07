import { useEffect, useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { subjectFormSchema, type SubjectFormValues } from "./schema";

// UI Imports
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomInput } from "@/components/global/CustomInput";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { subject, Trade, academicYear } from "@/types";
import Modal from "@/components/global/Modal";

interface Option {
  _id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: subject | null;
  onSuccess: () => void;
}

export function SubjectForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: Props) {
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [years, setYears] = useState<academicYear[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // 1. Fetch Teachers, Trades, Years
  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        setLoadingOptions(true);
        try {
          const [teacherRes, tradeRes, yearRes] = await Promise.all([
            api.get("/users?role=teacher&limit=1000"),
            api.get("/trades"),
            api.get("/academic-years"),
          ]);
          setTeachers(teacherRes.data.users);
          setTrades(tradeRes.data.trades);
          setYears(yearRes.data.years);
        } catch (error) {
          toast.error("Failed to load form options");
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [open]);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema) as Resolver<SubjectFormValues>,
    defaultValues: {
      name: "",
      code: "",
      type: "theory",
      trade: "",
      academicYear: "",
      teacher: null,
      isActive: true,
    },
  });

  // 2. Populate or Reset Form
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        code: initialData.code || "",
        type: initialData.type || "theory",
        trade: typeof initialData.trade === "object" ? initialData.trade?._id : initialData.trade || "",
        academicYear: typeof initialData.academicYear === "object" ? initialData.academicYear?._id : initialData.academicYear || "",
        teacher: typeof initialData.teacher === "object" ? initialData.teacher?._id : initialData.teacher || null,
        isActive: initialData.isActive ?? true,
      });
    } else {
      form.reset({
        name: "",
        code: "",
        type: "theory",
        trade: "",
        academicYear: "",
        teacher: null,
        isActive: true,
      });
    }
  }, [initialData, form, open]);

  const onSubmit = async (values: SubjectFormValues) => {
    // console.log("Submitting:", values);
    try {
      // Logic: Convert empty array -> null for the backend
      const payload = {
        ...values,
        teacher: values.teacher || null,
      };

      if (initialData) {
        await api.patch(`/subjects/update/${initialData._id}`, payload);
        toast.success("Subject updated successfully");
      } else {
        await api.post("/subjects/create", payload);
        toast.success("Subject created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || "Operation failed";
      toast.error(typeof msg === "string" ? msg : "Error occurred");
    }
  };

  const pending = form.formState.isSubmitting;
  const teachersOptions = teachers.map((teacher) => ({
    label: teacher.name,
    value: teacher._id,
  }));

  return (
    <Modal
      title={initialData ? "Edit Subject" : "Create Subject"}
      description={
        initialData
          ? "Edit the subject details."
          : "Fill in the details to create a new subject."
      }
      open={open}
      setOpen={onOpenChange}
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CustomInput
              control={form.control}
              name="name"
              label="Name"
              placeholder="Mathematics"
              disabled={pending}
            />
            <CustomInput
              control={form.control}
              name="code"
              label="Code"
              placeholder="MATH-101"
              disabled={pending}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Subject Type</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={pending}>
                    <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theory">Theory</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="methodology">Methodology</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name="trade"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Trade</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={pending || loadingOptions}>
                    <SelectTrigger><SelectValue placeholder="Select Trade" /></SelectTrigger>
                    <SelectContent>
                      {trades.map((t) => (
                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="academicYear"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Academic Year</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={pending || loadingOptions}>
                    <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y._id} value={y._id}>{y.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name="teacher"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Assigned Teacher</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={pending || loadingOptions}>
                    <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>
          <Controller
            name="isActive"
            control={form.control}
            render={({ field: { value, onChange, ...field }, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex flex-row space-x-3 rounded-md border p-3">
                  <Checkbox
                    id="isActive"
                    checked={value}
                    onCheckedChange={onChange}
                    {...field}
                  />
                  <div className="space-y-1">
                    <FieldLabel
                      htmlFor="isActive"
                      className="cursor-pointer mb-0"
                    >
                      Active Subject
                    </FieldLabel>
                    <p className="text-xs text-muted-foreground">
                      Inactive subjects won't appear in schedules.
                    </p>
                  </div>
                </div>
              </Field>
            )}
          />
        </FieldGroup>
        <Button
          type="submit"
          className="w-full mt-4"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Saving..." : "Save Subject"}
        </Button>
      </form>
    </Modal>
  );
}
