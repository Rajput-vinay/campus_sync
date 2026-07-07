import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { 
  Home, 
  MapPin, 
  User, 
  Briefcase, 
  Hash, 
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Wrench
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formSchema = z.object({
  fatherName: z.string().min(2, "Father's name is required"),
  address: z.string().min(10, "Full address is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode (6 digits required)"),
  trade: z.string().min(2, "Trade/Class is required"),
  citsNumber: z.string().min(5, "CITS Number is required"),
  isPwD: z.boolean(),
  hostelChoice: z.string().min(1, "Hostel Choice is required"),
});

const maintenanceSchema = z.object({
  issueType: z.enum(["plumbing", "electrical", "furniture", "cleaning", "other"]),
  description: z.string().min(10, "Please describe the issue in detail"),
  priority: z.enum(["low", "medium", "high"]),
});

const HostelApply = () => {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [hostelsList, setHostelsList] = useState<any[]>([]);

  const fetchMyApplication = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/hostel/my-application");
      setApplication(data);
      if (data?.status === 'approved') {
        fetchMyRequests();
      }
    } catch (error) {
      console.error("Failed to fetch application");
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async () => {
    try {
      const { data } = await api.get("/hostel/hostels");
      setHostelsList(data);
    } catch (error) {
      console.error("Failed to fetch hostels list", error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const { data } = await api.get("/hostel/maintenance");
      setMyRequests(data);
    } catch (error) {
      console.error("Failed to fetch maintenance requests");
    }
  };

  useEffect(() => {
    fetchMyApplication();
    fetchHostels();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fatherName: "",
      address: "",
      pincode: "",
      trade: "",
      citsNumber: "",
      isPwD: false,
      hostelChoice: "",
    },
  });

  const maintenanceForm = useForm<z.infer<typeof maintenanceSchema>>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      issueType: "plumbing",
      description: "",
      priority: "medium",
    },
  });

  const onSubmit = async (values: any) => {
    try {
      const { data } = await api.post("/hostel/apply", values);
      setApplication(data.data);
      toast.success("Application submitted successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    }
  };

  const onMaintenanceSubmit = async (values: any) => {
    try {
      await api.post("/hostel/maintenance", values);
      toast.success("Maintenance request submitted!");
      maintenanceForm.reset();
      fetchMyRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (application) {
    const statusConfig: any = {
      pending: { icon: Clock, color: "text-yellow-600 bg-yellow-100 border-yellow-200", label: "Pending Review" },
      approved: { icon: CheckCircle2, color: "text-green-600 bg-green-100 border-green-200", label: "Hostel Allotted" },
      rejected: { icon: XCircle, color: "text-red-600 bg-red-100 border-red-200", label: "Application Rejected" },
    };
    const config = statusConfig[application.status];
    const StatusIcon = config.icon;

    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 border-2 overflow-hidden shadow-lg h-fit">
            <div className={`p-8 text-center border-b ${config.color}`}>
              <StatusIcon className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-xl font-bold">{config.label}</h2>
              <p className="text-xs opacity-80 mt-1 uppercase tracking-tighter">ID: {application._id.slice(-8)}</p>
            </div>
            <CardContent className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Trade</span>
                <span className="font-semibold">{application.trade}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">CITS No.</span>
                <span className="font-semibold">{application.citsNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-bold text-primary">{application.distance} KM</span>
              </div>
              {application.hostelChoice && (
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Preferred Hostel</span>
                  <span className="font-semibold text-primary">{application.hostelChoice.name || "None"}</span>
                </div>
              )}
              {application.isPwD && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Category</span>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">PwD Student</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            {application.status === 'approved' && (
              <>
                <Card className="border-green-200 bg-green-50/30">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2 text-lg">
                      <Home className="h-5 w-5" /> Your Accommodation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-green-100 flex flex-col items-center justify-center border border-green-200 shrink-0">
                        <span className="text-[10px] text-green-600 font-bold uppercase">Room</span>
                        <span className="text-xl font-black text-green-800">{application.room?.roomNumber || "TBD"}</span>
                      </div>
                      <div className="h-16 w-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center border border-primary/20 shrink-0">
                        <span className="text-[10px] text-primary font-bold uppercase">Floor</span>
                        <span className="text-xl font-black text-primary">{application.room?.floor ?? "TBD"}</span>
                      </div>
                      <div className="h-16 w-16 rounded-xl bg-orange-100 flex flex-col items-center justify-center border border-orange-200 shrink-0">
                        <span className="text-[10px] text-orange-600 font-bold uppercase">Block</span>
                        <span className="text-xl font-black text-orange-800">{application.room?.block || "TBD"}</span>
                      </div>
                      <div className="ml-2">
                        <p className="font-medium text-green-900 line-clamp-1">Successfully Allotted</p>
                        <p className="text-xs text-green-700">Contact the hostel warden for registration.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="maintenance" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="maintenance">Report Issue</TabsTrigger>
                    <TabsTrigger value="history">Request History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="maintenance" className="pt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Maintenance Request</CardTitle>
                        <CardDescription>Report any issues with your room or facilities.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...maintenanceForm}>
                          <form onSubmit={maintenanceForm.handleSubmit(onMaintenanceSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={maintenanceForm.control}
                                name="issueType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Issue Type</FormLabel>
                                    <FormControl>
                                      <select {...field} className="w-full p-2 rounded-md border bg-background text-sm">
                                        <option value="plumbing">Plumbing</option>
                                        <option value="electrical">Electrical</option>
                                        <option value="furniture">Furniture</option>
                                        <option value="cleaning">Cleaning</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={maintenanceForm.control}
                                name="priority"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Priority</FormLabel>
                                    <FormControl>
                                      <select {...field} className="w-full p-2 rounded-md border bg-background text-sm">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                      </select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={maintenanceForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Describe the problem..." className="min-h-[80px]" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="w-full">
                              Submit Request
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="history" className="pt-4">
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {myRequests.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground italic">No requests submitted yet</TableCell>
                              </TableRow>
                            ) : (
                              myRequests.map((req: any) => (
                                <TableRow key={req._id}>
                                  <TableCell className="font-medium">
                                    <div className="capitalize">{req.issueType}</div>
                                    {req.adminComments && (
                                      <div className="text-[10px] text-primary mt-1 flex items-center gap-1 bg-primary/5 p-1 rounded">
                                        <Wrench className="h-3 w-3" /> {req.adminComments}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary" className="text-[10px]">{req.status}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right text-xs text-muted-foreground">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}

            {application.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-xl text-yellow-800 space-y-2">
                <h3 className="font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Under Review
                </h3>
                <p className="text-sm">Your application is currently being reviewed by the administration. Priority is given to students traveling from farther distances.</p>
                <p className="text-sm">Expected processing time: 3-5 working days.</p>
              </div>
            )}

            {application.status === 'rejected' && (
              <div className="bg-red-50 border border-red-100 p-6 rounded-xl text-red-800 space-y-2">
                <h3 className="font-bold flex items-center gap-2">
                  <XCircle className="h-5 w-5" /> Not Allotted
                </h3>
                <p className="text-sm">We regret to inform you that your hostel application could not be approved at this time due to limited vacancy or other criteria.</p>
                <p className="text-sm">You may contact the office for more information about the waiting list.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Hostel Accommodation</h1>
        <p className="text-muted-foreground">Apply for hostel allotment at NSTI Kanpur. Priority is given based on distance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" /> Application Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Enter father's name" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="citsNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CITS Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g. CITS2023..." className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="trade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade / Class</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Enter your trade" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hostelChoice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Hostel Choice</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select Preferred Hostel</option>
                          {hostelsList.map((hostel: any) => (
                            <option key={hostel._id} value={hostel._id}>
                              {hostel.name} ({hostel.category})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Residential Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter your permanent address" className="min-h-[100px] resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="6-digit pincode" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isPwD"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-primary/5">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-bold text-primary">
                          Physically Handicapped (PwD)
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Priority allotment on the ground floor will be provided.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Submit Application
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Allotment Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>Hostel rooms are limited and allotted based on the following criteria:</p>
              <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
                <li>Primary factor is the <strong>Distance</strong> between your home and NSTI Kanpur.</li>
                <li>Students living farther away have higher priority.</li>
                <li>Distance is calculated automatically using your pincode.</li>
                <li>Reservation policies apply as per Govt. norms.</li>
              </ul>
            </CardContent>
          </Card>

          <div className="p-4 rounded-lg bg-muted border text-xs text-muted-foreground">
            <p><strong>Note:</strong> Once submitted, you cannot edit your application. Ensure all details are correct, especially your CITS number and Pincode.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelApply;
