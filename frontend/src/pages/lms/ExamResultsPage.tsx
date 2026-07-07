import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Award, Calendar, ChevronRight, FileText } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StudentResult {
  _id: string;
  exam: {
    _id: string;
    title: string;
    subject: { name: string };
    questions: any[];
  };
  score: number;
  submittedAt: string;
}

const ExamResultsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // We need an endpoint that returns all results for the logged-in student
        const { data } = await api.get("/exams/results/my");
        setResults(data);
      } catch (error) {
        toast.error("Failed to load your results");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "student") {
      fetchResults();
    } else {
      // Teachers might want a different view, but for now let's focus on students
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Exam Results</h1>
        <p className="text-muted-foreground">Track your academic performance and scores.</p>
      </div>

      {results.length === 0 ? (
        <Card className="border-dashed py-20 text-center">
          <CardContent className="space-y-4">
            <Award className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <p className="text-xl font-semibold">No Results Yet</p>
              <p className="text-muted-foreground">You haven't completed any exams so far.</p>
            </div>
            <Button onClick={() => navigate("/lms/exams")}>Browse Available Exams</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => {
            const total = result.exam.questions?.length || 0;
            const percentage = total > 0 ? Math.round((result.score / total) * 100) : 0;
            
            return (
              <Card key={result._id} className="group hover:shadow-xl transition-all border-primary/10">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex justify-between items-start">
                    <Badge variant={percentage >= 50 ? "default" : "destructive"}>
                      {percentage}% Score
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(result.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="mt-4 text-lg line-clamp-1">{result.exam.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <FileText className="h-3.3 w-3.3" />
                    {result.exam.subject?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Points</p>
                      <p className="text-2xl font-bold">{result.score} / {total}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center border-4 ${percentage >= 50 ? "border-green-500/20 text-green-600" : "border-red-500/20 text-red-600"}`}>
                      <Award className="h-6 w-6" />
                    </div>
                  </div>
                  <Button 
                    className="w-full group" 
                    variant="outline"
                    onClick={() => navigate(`/lms/exams/${result.exam._id}`)}
                  >
                    Review Responses
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExamResultsPage;
