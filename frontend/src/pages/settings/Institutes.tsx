import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Plus, Building2, MapPin, Mail, Phone, Edit, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Institute } from "@/types";

interface InstituteForm {
  name: string;
  code: string;
  location: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
}

const emptyForm: InstituteForm = {
  name: "",
  code: "",
  location: "",
  address: "",
  contactEmail: "",
  contactPhone: "",
};

export default function InstitutesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState<Institute | null>(null);
  const [form, setForm] = useState<InstituteForm>(emptyForm);

  useEffect(() => {
    if (user?.role !== "super_admin") {
      navigate("/dashboard");
      return;
    }
    fetchInstitutes();
  }, [user]);

  const fetchInstitutes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/institutes");
      setInstitutes(data.institutes || []);
    } catch {
      toast.error("Failed to load institutes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (inst?: Institute) => {
    if (inst) {
      setEditingInstitute(inst);
      setForm({
        name: inst.name,
        code: inst.code,
        location: inst.location,
        address: inst.address || "",
        contactEmail: inst.contactEmail || "",
        contactPhone: inst.contactPhone || "",
      });
    } else {
      setEditingInstitute(null);
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code || !form.location) {
      toast.error("Name, Code and Location are required.");
      return;
    }
    try {
      setSaving(true);
      if (editingInstitute) {
        await api.put(`/institutes/${editingInstitute._id}`, form);
        toast.success("Institute updated successfully");
      } else {
        await api.post("/institutes", form);
        toast.success("Institute created successfully");
      }
      setOpen(false);
      fetchInstitutes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save institute");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (inst: Institute) => {
    try {
      await api.put(`/institutes/${inst._id}`, { isActive: !inst.isActive });
      toast.success(`Institute ${inst.isActive ? "deactivated" : "activated"}`);
      fetchInstitutes();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institutes</h1>
          <p className="text-muted-foreground">
            Manage all NSTI campuses nationwide. Create, edit and monitor each institute.
          </p>
        </div>
        <Button onClick={() => handleOpen()} className="gap-2 w-fit">
          <Plus className="h-4 w-4" /> Add Institute
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Institutes</CardDescription>
            <CardTitle className="text-4xl">{institutes.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All registered NSTI campuses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-4xl text-green-500">
              {institutes.filter((i) => i.isActive).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Campuses currently operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Inactive</CardDescription>
            <CardTitle className="text-4xl text-red-500">
              {institutes.filter((i) => !i.isActive).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Temporarily disabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Institute Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/3 mt-2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : institutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Building2 className="h-12 w-12 opacity-30" />
          <p className="text-lg">No institutes found. Add the first NSTI campus.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {institutes.map((inst) => (
            <Card
              key={inst._id}
              className={`relative transition-all hover:shadow-md ${
                !inst.isActive ? "opacity-60 border-dashed" : ""
              }`}
            >
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <Badge variant={inst.isActive ? "default" : "secondary"}>
                  {inst.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <CardHeader className="pr-20">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{inst.name}</CardTitle>
                    <CardDescription className="text-xs font-mono">{inst.code}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{inst.location}{inst.address ? ` — ${inst.address}` : ""}</span>
                </div>
                {inst.contactEmail && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{inst.contactEmail}</span>
                  </div>
                )}
                {inst.contactPhone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{inst.contactPhone}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleOpen(inst)}
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant={inst.isActive ? "destructive" : "default"}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleToggleActive(inst)}
                  >
                    {inst.isActive ? (
                      <><ToggleLeft className="h-3.5 w-3.5" /> Disable</>
                    ) : (
                      <><ToggleRight className="h-3.5 w-3.5" /> Enable</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingInstitute ? "Edit Institute" : "Add New Institute"}</DialogTitle>
            <DialogDescription>
              {editingInstitute
                ? "Update the details for this NSTI campus."
                : "Register a new NSTI campus on the nationwide platform."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label>Institute Name *</Label>
                <Input
                  placeholder="e.g. National Skill Training Institute, Noida"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Code *</Label>
                <Input
                  placeholder="e.g. NSTI-NOIDA"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  disabled={!!editingInstitute}
                />
              </div>
              <div className="space-y-1">
                <Label>City / State *</Label>
                <Input
                  placeholder="e.g. Noida, UP"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Full Address</Label>
                <Input
                  placeholder="Campus address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  placeholder="nsti@example.gov.in"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Contact Phone</Label>
                <Input
                  placeholder="0512-XXXXXXX"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingInstitute ? "Update Institute" : "Create Institute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
