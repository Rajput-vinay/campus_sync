import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Hostel {
  _id: string;
  name: string;
  category: "Boys Hostel" | "Girls Hostel";
}

interface Props {
  onRefresh?: () => void;
}

export default function HostelsTab({ onRefresh }: Props) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Boys Hostel" as "Boys Hostel" | "Girls Hostel",
  });

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/hostel/hostels");
      setHostels(data);
    } catch (error) {
      toast.error("Failed to load hostels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleOpenCreate = () => {
    setEditingHostel(null);
    setFormData({ name: "", category: "Boys Hostel" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (hostel: Hostel) => {
    setEditingHostel(hostel);
    setFormData({ name: hostel.name, category: hostel.category });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Hostel name is required");
      return;
    }

    try {
      if (editingHostel) {
        await api.put(`/hostel/hostels/${editingHostel._id}`, formData);
        toast.success("Hostel updated successfully");
      } else {
        await api.post("/hostel/hostels", formData);
        toast.success("Hostel created successfully");
      }
      setIsDialogOpen(false);
      fetchHostels();
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save hostel");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hostel building?")) return;

    try {
      await api.delete(`/hostel/hostels/${id}`);
      toast.success("Hostel deleted successfully");
      fetchHostels();
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete hostel");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" /> Hostels Infrastructure
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add New Hostel
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingHostel ? "Edit Hostel Details" : "Create New Hostel"}
              </DialogTitle>
              <DialogDescription>
                Define a hostel building and its target category.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Hostel Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Boys Hostel A, Block B"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.category}
                    onValueChange={(val: any) =>
                      setFormData({ ...formData, category: val })
                    }
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Boys Hostel">Boys Hostel</SelectItem>
                      <SelectItem value="Girls Hostel">Girls Hostel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>
                {editingHostel ? "Save Changes" : "Create Hostel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Hostel Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : hostels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  No hostels registered. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              hostels.map((hostel) => (
                <TableRow key={hostel._id}>
                  <TableCell className="font-semibold">{hostel.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        hostel.category === "Boys Hostel"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-pink-100 text-pink-700 border-pink-200"
                      }
                    >
                      {hostel.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEdit(hostel)}
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(hostel._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
