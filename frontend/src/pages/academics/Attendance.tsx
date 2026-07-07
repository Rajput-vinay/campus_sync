import { useState, useEffect } from "react";
import { Plus, Filter, Users, Calendar, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AttendanceForm from "@/components/attendance/AttendanceForm";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const months = [
  "All Months", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Attendance = () => {
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    monthNumber: "all",
    year: new Date().getFullYear().toString(),
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const url = isStudent ? "/attendance/me" : "/attendance";
      
      const params = new URLSearchParams();
      if (filters.monthNumber !== "all") params.append("monthNumber", filters.monthNumber);
      if (filters.year) params.append("year", filters.year);

      const { data } = await api.get(`${url}?${params.toString()}`);
      setRecords(data);
    } catch (error) {
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const displayRecords = filters.monthNumber === "all"
    ? (() => {
        const aggregated = records.reduce((acc: any[], current: any) => {
          const studentId = current.student?._id;
          if (!studentId) return acc;
          
          let existing = acc.find((r: any) => r.student?._id === studentId);
          if (!existing) {
            existing = {
              _id: studentId,
              student: current.student,
              studentTrade: current.studentTrade,
              month: "All Months",
              totalWorkingDays: 0,
              daysPresent: 0,
              percentage: 0,
              status: "regular",
            };
            acc.push(existing);
          }
          
          existing.totalWorkingDays += current.totalWorkingDays;
          existing.daysPresent += current.daysPresent;
          
          return acc;
        }, []);

        aggregated.forEach((item: any) => {
          if (item.totalWorkingDays > 0) {
            item.percentage = Math.round((item.daysPresent / item.totalWorkingDays) * 100);
          } else {
            item.percentage = 0;
          }
          item.status = item.percentage < 80 ? "low" : "regular";
        });

        return aggregated;
      })()
    : records;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            {isStudent 
              ? "Track your monthly attendance progress." 
              : "Manage and monitor student attendance."}
          </p>
        </div>
        {isStudent && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Submit Attendance
          </Button>
        )}
      </div>

      {!isStudent && (
        <div className="flex flex-wrap gap-4 items-end bg-card p-4 rounded-xl border border-border/50">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground ml-1">Month</label>
            <Select 
              value={filters.monthNumber} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, monthNumber: val }))}
            >
              <SelectTrigger className="w-40 bg-background">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={m} value={i === 0 ? "all" : i.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground ml-1">Year</label>
            <Input 
              type="number" 
              className="w-28 bg-background" 
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchRecords} className="mb-0.5">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Active Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
          </CardContent>
        </Card>

        {!isStudent && (
          <>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" /> Low Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {displayRecords.filter((r: any) => r.status === "low").length} Students
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" /> Total Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {displayRecords.length}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <AttendanceTable 
        records={displayRecords} 
        loading={loading} 
        onRefresh={fetchRecords} 
      />

      <AttendanceForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={fetchRecords} 
      />
    </div>
  );
};

export default Attendance;
