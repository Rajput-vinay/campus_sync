import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { api } from "@/lib/api";
import type { academicYear, user, Institute } from "@/types";

const AuthContext = createContext<{
  user: user | null;
  setUser: React.Dispatch<React.SetStateAction<user | null>>;
  loading: boolean;
  year: academicYear | null;
  activeInstitute: Institute | null;
  setActiveInstitute: (inst: Institute | null) => void;
  institutes: Institute[];
}>({
  user: null,
  setUser: () => {},
  loading: true,
  year: null,
  activeInstitute: null,
  setActiveInstitute: () => {},
  institutes: [],
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<user | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<academicYear | null>(null);
  const [activeInstitute, setActiveInstituteState] = useState<Institute | null>(null);
  const [institutes, setInstitutes] = useState<Institute[]>([]);

  const setActiveInstitute = useCallback((inst: Institute | null) => {
    setActiveInstituteState(inst);
    if (inst) localStorage.setItem("activeInstituteId", inst._id);
    else localStorage.removeItem("activeInstituteId");
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setUser(data.user);

        if (data.user?.role === "super_admin") {
          const { data: instData } = await api.get("/institutes");
          const allInstitutes: Institute[] = instData.institutes || [];
          setInstitutes(allInstitutes);

          const savedId = localStorage.getItem("activeInstituteId");
          if (savedId) {
            const found = allInstitutes.find((i) => i._id === savedId);
            if (found) setActiveInstituteState(found);
          } else if (allInstitutes.length > 0) {
            const first = allInstitutes.find((i) => i.isActive) || allInstitutes[0];
            setActiveInstituteState(first);
            localStorage.setItem("activeInstituteId", first._id);
          }
        } else if (data.user?.institute) {
          const inst = typeof data.user.institute === "object" ? data.user.institute : null;
          setActiveInstituteState(inst);
        }

        try {
          const { data: yearData } = await api.get("/academic-years/current");
          setYear(yearData);
        } catch (error) {
          console.log("Failed to fetch current academic year:", error);
          setYear(null);
        }
      } catch (error) {
        // Public visitors normally have no auth cookie.
        setUser(null);
        setYear(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        year,
        activeInstitute,
        setActiveInstitute,
        institutes,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
