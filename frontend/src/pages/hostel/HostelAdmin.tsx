import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  MoreVertical,
  ArrowUpDown,
  MapPin,
  ChevronDown,
  Loader2,
  Check,
  Plus,
  Wrench,
  DoorOpen,
  Users,
  LayoutDashboard
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HostelsTab from "@/components/hostel/HostelsTab";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

const HostelAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [roomFloorFilter, setRoomFloorFilter] = useState<string>("");
  const [roomHostelFilter, setRoomHostelFilter] = useState<string>("");
  const [hostelList, setHostelList] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: "",
    trade: "",
    isPwD: "",
    minDistance: "",
    maxDistance: "",
    search: "",
  });
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    floor: 0,
    block: "",
    capacity: 2,
    hostel: ""
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.trade) params.append("trade", filters.trade);
      if (filters.isPwD) params.append("isPwD", filters.isPwD);
      if (filters.minDistance) params.append("minDistance", filters.minDistance);
      if (filters.maxDistance) params.append("maxDistance", filters.maxDistance);

      const { data } = await api.get(`/hostel/applications?${params.toString()}`);
      setApplications(data);
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchHostelList = async () => {
    try {
      const { data } = await api.get("/hostel/hostels");
      setHostelList(data);
      if (data.length > 0 && !newRoom.hostel) {
        setNewRoom(prev => ({ ...prev, hostel: data[0]._id, block: data[0].name }));
      }
    } catch (error) {
      console.error("Failed to load hostels list", error);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roomFloorFilter !== "") params.append("floor", roomFloorFilter);
      if (roomHostelFilter !== "") params.append("hostelId", roomHostelFilter);
      
      const { data } = await api.get(`/hostel/rooms?${params.toString()}`);
      setRooms(data);
    } catch (error) {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/hostel/maintenance");
      setMaintenance(data);
    } catch (error) {
      toast.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  useEffect(() => {
    fetchRooms();
  }, [roomFloorFilter, roomHostelFilter]);

  useEffect(() => {
    fetchMaintenance();
    fetchHostelList();
  }, []);

  const handleCreateRoom = async () => {
    try {
      await api.post("/hostel/rooms", newRoom);
      toast.success("Room created successfully");
      fetchRooms();
      setNewRoom({ roomNumber: "", floor: 0, block: hostelList.find(h => h._id === newRoom.hostel)?.name || "", capacity: 2, hostel: newRoom.hostel });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create room");
    }
  };

  const [maintUpdate, setMaintUpdate] = useState({
    id: "",
    status: "",
    comments: ""
  });

  const handleMaintenanceUpdate = async () => {
    try {
      await api.put(`/hostel/maintenance/${maintUpdate.id}`, {
        status: maintUpdate.status,
        adminComments: maintUpdate.comments
      });
      toast.success(`Request marked as ${maintUpdate.status}`);
      fetchMaintenance();
      setMaintUpdate({ id: "", status: "", comments: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleStatusUpdate = async (ids: string[], status: string) => {
    try {
      setLoading(true);
      await api.put("/hostel/status", { ids, status });
      toast.success(`Successfully ${status} ${ids.length} applications`);
      setSelectedIds([]);
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 20) {
        toast.warning("Bulk selection limit is 20 students per batch");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.slice(0, 20).map((a: any) => a._id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" /> Hostel Management
          </h1>
          <p className="text-muted-foreground">Review and allot hostel rooms based on distance priority.</p>
        </div>
      </div>

      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-[500px]">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Applications
          </TabsTrigger>
          <TabsTrigger value="hostels" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Hostels
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4" /> Rooms
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" /> Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6 outline-none">
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-48 justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {filters.status || "All Status"}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem onClick={() => setFilters({ ...filters, status: "" })}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters({ ...filters, status: "pending" })}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters({ ...filters, status: "approved" })}>Approved</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters({ ...filters, status: "rejected" })}>Rejected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-48 justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {filters.isPwD === "true" ? "PwD Only" : filters.isPwD === "false" ? "General Only" : "All Categories"}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem onClick={() => setFilters({ ...filters, isPwD: "" })}>All Categories</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters({ ...filters, isPwD: "true" })}>PwD Students</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters({ ...filters, isPwD: "false" })}>General Students</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                placeholder="Trade/Class"
                value={filters.trade}
                onChange={(e) => setFilters({ ...filters, trade: e.target.value })}
                className="w-48"
              />
              <div className="flex items-center gap-2 border rounded-md px-2 bg-background">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Dist:</span>
                <Input
                  placeholder="Min"
                  value={filters.minDistance}
                  onChange={(e) => setFilters({ ...filters, minDistance: e.target.value })}
                  className="w-16 border-none p-0 h-8 text-center focus-visible:ring-0"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  placeholder="Max"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
                  className="w-16 border-none p-0 h-8 text-center focus-visible:ring-0"
                />
              </div>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleStatusUpdate(selectedIds, 'approved')}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve ({selectedIds.length})
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(selectedIds, 'rejected')}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            )}
          </div>

          <div className="border rounded-xl bg-card overflow-hidden">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === applications.length && applications.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Trade</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Distance</TableHead>
                    <TableHead className="text-center">Hostel Choice</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8} className="h-16 animate-pulse bg-muted/20" />
                      </TableRow>
                    ))
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Users className="h-12 w-12 opacity-20" />
                          <p>No applications found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.filter((app: any) =>
                      app.student?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                      app.citsNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
                      app.trade?.toLowerCase().includes(filters.search.toLowerCase())
                    ).map((app: any) => (
                      <TableRow key={app._id} className={`${selectedIds.includes(app._id) ? 'bg-primary/5' : ''} hover:bg-muted/30 transition-colors`}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(app._id)}
                            onCheckedChange={() => toggleSelect(app._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{app.student?.name}</span>
                              {app.isPwD && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] h-5">PwD</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">CITS: {app.citsNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{app.trade}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground max-w-[200px] truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {app.pincode} - {app.address}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-bold text-primary">
                            {app.distance} KM
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs font-semibold text-primary">
                            {app.hostelChoice?.name || "Any"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {app.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>}
                          {app.status === 'approved' && <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>}
                          {app.status === 'rejected' && <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusUpdate([app._id], 'approved')}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Allot Hostel
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate([app._id], 'rejected')}>
                                <XCircle className="h-4 w-4 mr-2 text-red-600" /> Reject Application
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="hostels" className="space-y-6 outline-none">
          <HostelsTab onRefresh={fetchHostelList} />
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6 outline-none">
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Room Inventory</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-48 justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {roomFloorFilter === "" ? "All Floors" : roomFloorFilter === "0" ? "Ground Floor" : "1st Floor"}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem onClick={() => setRoomFloorFilter("")}>All Floors</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoomFloorFilter("0")}>Ground Floor</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoomFloorFilter("1")}>1st Floor</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-48 justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {roomHostelFilter === "" 
                        ? "All Hostels" 
                        : hostelList.find(h => h._id === roomHostelFilter)?.name || "Selected Hostel"}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem onClick={() => setRoomHostelFilter("")}>All Hostels</DropdownMenuItem>
                  {hostelList.map((h: any) => (
                    <DropdownMenuItem key={h._id} onClick={() => setRoomHostelFilter(h._id)}>
                      {h.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={hostelList.length === 0}>
                  <Plus className="h-4 w-4 mr-2" /> Add New Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Hostel Room</DialogTitle>
                  <DialogDescription>Add a new room to the hostel inventory.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="roomNumber" className="text-right">Room No.</Label>
                    <Input id="roomNumber" className="col-span-3" value={newRoom.roomNumber} onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hostel" className="text-right">Hostel</Label>
                    <div className="col-span-3">
                      <Select
                        value={newRoom.hostel}
                        onValueChange={(val) => {
                          const selected = hostelList.find(h => h._id === val);
                          setNewRoom({ 
                            ...newRoom, 
                            hostel: val, 
                            block: selected ? selected.name : newRoom.block 
                          });
                        }}
                      >
                        <SelectTrigger id="hostel" className="w-full">
                          <SelectValue placeholder="Select Hostel" />
                        </SelectTrigger>
                        <SelectContent>
                          {hostelList.map((h: any) => (
                            <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="floor" className="text-right">Floor</Label>
                    <Input id="floor" type="number" className="col-span-3" value={newRoom.floor} onChange={(e) => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity" className="text-right">Capacity</Label>
                    <Input id="capacity" type="number" className="col-span-3" value={newRoom.capacity} onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateRoom}>Create Room</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map((room: any) => (
              <div key={room._id} className="bg-card border rounded-xl p-4 space-y-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">Room {room.roomNumber}</h3>
                    <p className="text-xs text-muted-foreground">
                      {room.hostel ? `${room.hostel.name} (${room.hostel.category})` : `Block ${room.block}`} • Floor {room.floor}
                    </p>
                  </div>
                  <Badge className={room.status === 'full' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                    {room.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Occupancy</span>
                    <span>{room.occupants?.length || 0} / {room.capacity}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                       className="bg-primary h-1.5 rounded-full transition-all"
                       style={{ width: `${((room.occupants?.length || 0) / room.capacity) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="pt-2 border-t flex items-center gap-2 overflow-hidden">
                  {room.occupants?.length > 0 ? (
                    room.occupants.map((occ: any, i: number) => (
                      <div key={i} className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold border border-primary/20 shrink-0" title={occ.name}>
                        {occ.name.charAt(0)}
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest italic">Vacant</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6 outline-none">
          <div className="border rounded-xl bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                      No maintenance requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  maintenance.map((req: any) => (
                    <TableRow key={req._id}>
                      <TableCell>
                        <div className="font-medium">{req.student?.name}</div>
                        <div className="text-xs text-muted-foreground">{req.student?.trade}</div>
                      </TableCell>
                      <TableCell>Room {req.room?.roomNumber} ({req.room?.block})</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="mb-1">{req.issueType}</Badge>
                        <div className="text-xs max-w-xs truncate">{req.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          req.priority === 'high' ? 'bg-red-100 text-red-700' :
                            req.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                        }>
                          {req.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{req.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setMaintUpdate({ ...maintUpdate, id: req._id, status: req.status, comments: req.adminComments || "" })}>
                              Update
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Maintenance Status</DialogTitle>
                              <DialogDescription>Update progress and add comments for the student.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Status</Label>
                                <select
                                  className="w-full p-2 border rounded-md bg-background"
                                  value={maintUpdate.status}
                                  onChange={(e) => setMaintUpdate({ ...maintUpdate, status: e.target.value })}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="resolved">Resolved</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>Admin Comments</Label>
                                <Input
                                  placeholder="e.g. Technician assigned..."
                                  value={maintUpdate.comments}
                                  onChange={(e) => setMaintUpdate({ ...maintUpdate, comments: e.target.value })}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleMaintenanceUpdate}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HostelAdmin;
