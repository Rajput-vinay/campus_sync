import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { api } from "@/lib/api";
import type { academicYear, user, Institute } from "@/types";

// 1. Create Context
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
  const [loading, setLoading] = useState(true); // <--- Vital for preventing "flicker"
  const [year, setYear] = useState<academicYear | null>(null);
  const [activeInstitute, setActiveInstituteState] = useState<Institute | null>(null);
  const [institutes, setInstitutes] = useState<Institute[]>([]);

  const setActiveInstitute = useCallback((inst: Institute | null) => {
    setActiveInstituteState(inst);
    if (inst) {
      localStorage.setItem("activeInstituteId", inst._id);
    } else {
      localStorage.removeItem("activeInstituteId");
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/users/profile");
        setUser(data.user);

        // If super_admin, fetch all institutes for the switcher
        if (data.user?.role === "super_admin") {
          const { data: instData } = await api.get("/institutes");
          const allInstitutes: Institute[] = instData.institutes || [];
          setInstitutes(allInstitutes);

          // Restore previously selected institute from storage
          const savedId = localStorage.getItem("activeInstituteId");
          if (savedId) {
            const found = allInstitutes.find((i) => i._id === savedId);
            if (found) setActiveInstituteState(found);
          } else if (allInstitutes.length > 0) {
            // Default to first active institute
            const first = allInstitutes.find((i) => i.isActive) || allInstitutes[0];
            setActiveInstituteState(first);
            localStorage.setItem("activeInstituteId", first._id);
          }
        } else if (data.user?.institute) {
          // Regular users: set their home institute as the single active scope
          const inst = typeof data.user.institute === "object" ? data.user.institute : null;
          setActiveInstituteState(inst);
        }
      } catch (error) {
        console.log(error);
        setUser(null);
      }
    };

    const fetchYear = async () => {
      try {
        const { data } = await api.get("/academic-years/current");
        setYear(data);
      } catch (error) {
        console.log(error);
        setYear(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth().then(() => fetchYear());
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
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
