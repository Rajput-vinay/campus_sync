import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, TrendingDown, TrendingUp, User } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Props {
  records: any[];
  loading: boolean;
  onRefresh: () => void;
}

const AttendanceTable = ({ records, loading }: Props) => {
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const [notifying, setNotifying] = useState<string | null>(null);

  const handleSendNotice = async (id: string) => {
    try {
      setNotifying(id);
      await api.post(`/attendance/notify/${id}`);
      toast.success("Notice sent to student email");
    } catch (error) {
      toast.error("Failed to send notification");
    } finally {
      setNotifying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
        <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No records found</h3>
        <p className="text-muted-foreground">Attendance history will appear here.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {!isStudent && <TableHead>Student</TableHead>}
            <TableHead>Trade</TableHead>
            <TableHead>Month</TableHead>
            <TableHead className="text-center">Working Days</TableHead>
            <TableHead className="text-center">Present</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
            <TableHead className="text-center">Status</TableHead>
            {!isStudent && <TableHead className="text-right pr-6">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record._id} className="hover:bg-muted/30">
              {!isStudent && (
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{record.student?.name}</span>
                    <span className="text-xs text-muted-foreground">{record.student?.email}</span>
                  </div>
                </TableCell>
              )}
              <TableCell>{record.studentTrade?.name}</TableCell>
              <TableCell className="font-medium">{record.month}</TableCell>
              <TableCell className="text-center">{record.totalWorkingDays}</TableCell>
              <TableCell className="text-center font-semibold text-primary">{record.daysPresent}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className={`font-bold ${record.percentage < 80 ? 'text-destructive' : 'text-green-600'}`}>
                    {record.percentage}%
                  </span>
                  {record.percentage < 80 ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={record.status === "low" ? "destructive" : "default"} className="capitalize">
                  {record.status}
                </Badge>
              </TableCell>
              {!isStudent && (
                <TableCell className="text-right pr-6">
                  {record.status === "low" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors"
                      disabled={notifying === record._id}
                      onClick={() => handleSendNotice(record._id)}
                    >
                      {notifying === record._id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Mail className="h-3 w-3" />
                      )}
                      Send Notice
                    </Button>
                  ) : (
                    <span className="text-green-600 text-sm font-medium">
                      No Action Needed
                    </span>
                  )}
                </TableCell>
              )}

            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default AttendanceTable;
