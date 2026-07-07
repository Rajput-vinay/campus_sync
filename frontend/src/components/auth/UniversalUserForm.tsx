import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import {
  type Trade,
  type UserRole,
  type pagination,
  type subject,
  type user,
  type Institute,
} from "@/types";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/global/CustomInput";
import { api } from "@/lib/api";
import { CustomSelect } from "@/components/global/CustomSelect";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/AuthProvider";
import { CustomMultiSelect } from "@/components/global/CustomMultiSelect";

export type FormType = "login" | "create" | "update";
interface Props {
  type: FormType;
  initialData?: user | null;
  onSuccess?: () => void;
  role?: UserRole;
}

const createSchema = (type: FormType) => {
  return z
    .object({
      name:
        type === "login"
          ? z.string().optional()
          : z.string().min(2, "Name is required"),
      tradeId: z.string().optional(),
      subjectIds: z.array(z.string()).optional(),
      email: z.string().email("Invalid email address"),
      role: z.string().optional(),
      instituteId: z.string().optional(),
      password: z
        .string()
        .optional()
        .refine((val) => !val || val.length >= 6, {
          message: "Password must be at least 6 characters",
        }),
      confirmPassword: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (type === "create" && data.password && data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords don't match",
          path: ["confirmPassword"],
        });
      }
    });
};

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const UniversalUserForm = ({ type, initialData, onSuccess, role }: Props) => {
  const isUpdate = type === "update";
  const isLogin = type === "login";
  const { user } = useAuth();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [subjects, setSubjects] = useState<subject[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema(type)),
    defaultValues: {
      name: "",
      email: "",
      role: role,
      instituteId: undefined,
      password: "",
      tradeId: undefined,
      subjectIds: [],
    },
  });

  // fetch trades
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const { data } = (await api.get("/trades")) as {
          data: { trades: Trade[]; pagination: pagination };
        };
        setTrades(data.trades);
      } catch (error) {
        if (type !== "login") {
          toast.error("Failed to load Trades");
          console.log(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, []);

  // Fetch institutes for super_admin
  useEffect(() => {
    if (user?.role === "super_admin" && !isLogin) {
      const fetchInstitutes = async () => {
        try {
          setLoadingInstitutes(true);
          const { data } = await api.get("/institutes");
          setInstitutes(data.institutes || []);
        } catch (error) {
          toast.error("Failed to load institutes");
        } finally {
          setLoadingInstitutes(false);
        }
      };
      fetchInstitutes();
    }
  }, [user, isLogin]);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingOptions(true);
        const { data } = (await api.get("/subjects")) as {
          data: { subjects: subject[]; pagination: pagination };
        };
        setSubjects(data.subjects);
        setLoadingOptions(false);
      } catch (error) {
        if (type !== "login") {
          toast.error("Failed to load subjects");
          console.log(error);
        }
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchSubjects();
  }, []);

  // Populate form for Update mode
  useEffect(() => {
    if (initialData && isUpdate) {
      const existingTradeId =
        typeof initialData.studentTrade === "object"
          ? initialData.studentTrade?._id
          : initialData.studentTrade;

      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        role: initialData.role || "student",
        instituteId: typeof initialData.institute === "object" ? (initialData.institute as any)?._id : initialData.institute || "",
        password: "",
        tradeId: existingTradeId || "",
        subjectIds: initialData.teacherSubject?.map((s) => s._id) || [],
      });
    }
  }, [isUpdate, initialData, form, trades]);

  async function onSubmit(data: FormValues) {
    try {
      // console.log(data);
      const payload = {
        studentTrade: data.tradeId ? data.tradeId : undefined,
        teacherSubject: data.subjectIds ? data.subjectIds : [],
        institute: data.instituteId ? data.instituteId : undefined,
        // role: role,
        ...data,
      };
      if (isLogin) {
        const { data: user } = await api.post("/users/login", {
          email: data.email,
          password: data.password,
        });
        //   todo: set user context
        console.log(user);
        toast.success("Logged in successfully");
        window.location.href = "/dashboard";
      } else if (type === "create") {
        await api.post("/users/register", payload);
        toast.success("Account created successfully!");
        if (onSuccess) onSuccess();
      } else if (type === "update" && initialData?._id) {
        await api.put(`/users/update/${initialData._id}`, payload);
        toast.success("User updated successfully");
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.log(error);
      const msg = error?.response?.data?.message || "An error occurred. Please try again.";
      toast.error(msg);
    }
  }

  const tradeOptions = Array.isArray(trades)
    ? trades.map((t) => ({
        label: t.name,
        value: t._id,
      }))
    : [];
  const subjectOptions = Array.isArray(subjects)
    ? subjects.map((s) => ({ label: s.name, value: s._id }))
    : [];
  const roleOptions = role ? [{ label: role, value: role }] : [];

  const pending = form.formState.isSubmitting;
  const showRoleSelector = !isLogin;
  // you can also include teacher is needed
  const showTradeSelector = !isLogin && role === "student";
  const showSubjectSelector = !isLogin && role === "teacher";
  const showInstituteSelector = !isLogin && user?.role === "super_admin";

  const instituteOptions = Array.isArray(institutes)
    ? institutes.map((i) => ({ label: i.name, value: i._id }))
    : [];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4 w-full">
          {!isLogin && (
            <CustomInput
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="Jane Doe"
              disabled={pending}
            />
          )}
          {/* role selector */}
          {showRoleSelector && (
            <CustomSelect
              control={form.control}
              name="role"
              label="Role"
              placeholder="Select role"
              options={roleOptions}
              disabled={pending}
            />
          )}
          <div className="col-span-2 space-y-2">
            {/* institute */}
            {showInstituteSelector && (
              <CustomSelect
                control={form.control}
                name="instituteId"
                label="Institute"
                placeholder="Select Institute"
                options={instituteOptions}
                disabled={pending}
                loading={loadingInstitutes}
              />
            )}
            {/* trade */}
            {showTradeSelector && (
              <CustomSelect
                control={form.control}
                name="tradeId"
                label="Trade"
                placeholder="Select Trade"
                options={tradeOptions}
                disabled={pending}
                loading={loading}
              />
            )}
            {/* subjects(multiple select is need here) */}
            {showSubjectSelector && (
              <CustomMultiSelect
                control={form.control}
                name="subjectIds"
                label="Subjects"
                placeholder="Select subjects..."
                options={subjectOptions}
                loading={loadingOptions}
                disabled={pending}
              />
            )}
            <CustomInput
              control={form.control}
              name="email"
              label="Email Address"
              type="email"
              placeholder="m@example.com"
              disabled={pending}
            />
          </div>
          <div className="col-span-2">
            <CustomInput
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder={isUpdate ? "New Password (Optional)" : "Password (Default: 123456789)"}
              disabled={pending}
            />
          </div>
          {type === "create" && (
            <div className="col-span-2">
              <CustomInput
                control={form.control}
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder={"Confirm Password"}
                disabled={pending}
              />
            </div>
          )}
          <div className="col-span-2 mt-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? "Processing..."
                : type === "login"
                ? "Sign In"
                : type === "create"
                ? "Create Account"
                : "Save Changes"}
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
};

export default UniversalUserForm;
