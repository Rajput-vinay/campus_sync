import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import type { schedule } from "@/types";
import GeneratorControls, {
  type GenSettings,
} from "@/components/timetable/GeneratorControls";
import TimetableGrid from "@/components/timetable/TimetableGrid";
import { Button } from "@/components/ui/button";

const Timetable = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  const [scheduleData, setScheduleData] = useState<schedule[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [viewMode, setViewMode] = useState<"trade" | "personal">("trade");

  const isTeacher = user?.role === "teacher";

  // fetch timetable
  const fetchTimetable = async (tradeId: string) => {
    if (!tradeId) return;

    try {
      setLoadingSchedule(true);
      const { data } = await api.get(`/timetables/${tradeId}`);

      setScheduleData(data.schedule || []);
      setIsPublished(data.isPublished || false);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setScheduleData([]);
        setIsPublished(false);
        if (!isAdmin && user?.role !== "teacher") {
          toast("No schedule found for this trade", { icon: "📅" });
        }
      } else if (error.response && error.response.status === 403) {
        toast.warning("This timetable has not been published yet.");
        setScheduleData([]);
      } else {
        toast.error("Failed to load timetable");
      }
    } finally {
      setLoadingSchedule(false);
    }
  };

  const fetchTeacherSchedule = async () => {
    try {
      setLoadingSchedule(true);
      const { data } = await api.get("/timetables/teacher/me");
      setScheduleData(data.schedule || []);
    } catch (error: any) {
      toast.error("Failed to load your schedule");
    } finally {
      setLoadingSchedule(false);
    }
  };

  // auto fetch using useEffect
  useEffect(() => {
    if (isStudent && user?.studentTrade) {
      const tradeId = typeof user.studentTrade === 'string' 
        ? user.studentTrade 
        : (user.studentTrade as any)._id;
      
      if (tradeId) {
        setSelectedTrade(tradeId);
        fetchTimetable(tradeId);
      }
    }
    if (isTeacher) {
      setViewMode("personal");
      fetchTeacherSchedule();
    }
  }, [isStudent, isTeacher, user?.studentTrade]);

  useEffect(() => {
    if (selectedTrade && viewMode === "trade") {
      fetchTimetable(selectedTrade);
    }
  }, [selectedTrade, viewMode]);

  const handleModeChange = (mode: "trade" | "personal") => {
    setViewMode(mode);
    if (mode === "personal") {
      fetchTeacherSchedule();
    } else if (selectedTrade) {
      fetchTimetable(selectedTrade);
    } else {
      setScheduleData([]);
    }
  };

  const handlePublish = async () => {
    if (!selectedTrade) return;
    try {
      const { data } = await api.patch(`/timetables/${selectedTrade}/publish`);
      setIsPublished(data.isPublished);
      toast.success(data.message);
    } catch (error: any) {
      toast.error("Failed to update publish status");
    }
  };

  const handleGenerate = async (
    tradeId: string,
    yearId: string,
    settings: GenSettings
  ) => {
    try {
      setIsGenerating(true);
      const { data } = await api.post("/timetables/generate", {
        tradeId: tradeId,
        academicYearId: yearId,
        settings,
      });

      toast.success(data.message || "AI Generation Started");

      // Poll for updates (smart retry mechanism)
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const res = await api.get(`/timetables/${tradeId}`);
          if (res.data && res.data.schedule && res.data.schedule.length > 0) {
            console.log("res.data.schedule",res.data)
            setScheduleData(res.data.schedule);
            setIsPublished(res.data.isPublished || false);
            setIsGenerating(false);
            toast.success("Schedule generated successfully!");
            clearInterval(poll);
          }
        } catch (err) {
          // If 404, it means AI is still generating.
          if (attempts >= 6) {
            clearInterval(poll);
            setIsGenerating(false);
            toast.info("Generation is taking a bit longer. Please refresh or re-select the trade in a moment.");
          }
        }
      }, 4000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Generation failed");
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Timetable {viewMode === "personal" ? "• My Schedule" : "Management"}
          </h1>
          <p className="text-muted-foreground">
            {isStudent
              ? "View your weekly class schedule."
              : isTeacher && viewMode === "personal"
              ? "Your personal teaching schedule across all trades."
              : "View or manage weekly schedules."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isTeacher && (
            <div className="flex bg-muted p-1 rounded-lg border">
              <Button
                variant={viewMode === "personal" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("personal")}
                className="text-xs"
              >
                My Schedule
              </Button>
              <Button
                variant={viewMode === "trade" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("trade")}
                className="text-xs"
              >
                Trade Schedule
              </Button>
            </div>
          )}

          {isAdmin && selectedTrade && scheduleData.length > 0 && (
            <Button
              variant={isPublished ? "destructive" : "default"}
              onClick={handlePublish}
              size="sm"
              className="shadow-md"
            >
              {isPublished ? "Unpublish Timetable" : "Publish Timetable"}
            </Button>
          )}
        </div>
      </div>

      {!isStudent && viewMode === "trade" && (
        <GeneratorControls
          onGenerate={handleGenerate}
          onTradeChange={fetchTimetable}
          isGenerating={isGenerating}
          selectedTrade={selectedTrade}
          setSelectedTrade={setSelectedTrade}
        />
      )}
      <TimetableGrid schedule={scheduleData} isLoading={loadingSchedule} />
    </div>
  );
};

export default Timetable;
