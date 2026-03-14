import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MedicineReminderProvider } from "@/context/MedicineReminderContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import HealthProfile from "@/pages/HealthProfile";
import HealthSurvey from "@/pages/HealthSurvey";
import MedicineManager from "@/pages/MedicineManager";
import MedicineFood from "@/pages/MedicineFood";
import DietPlanner from "@/pages/DietPlanner";
import FoodTracker from "@/pages/FoodTracker";
import FitnessTracker from "@/pages/FitnessTracker";
import WellnessTracker from "@/pages/WellnessTracker";
import VaccinationTracker from "@/pages/VaccinationTracker";
import WomensHealth from "@/pages/WomensHealth";
import Settings from "@/pages/Settings";
import EmergencyCard from "@/pages/EmergencyCard";
import NotFound from "@/pages/NotFound";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function SurveyRequiredRoute({ children }: { children: React.ReactNode }) {
  const { token, user, loading } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user?.surveyCompleted) return <Navigate to="/survey" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return !token ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<SurveyRequiredRoute><Dashboard /></SurveyRequiredRoute>} />
      <Route path="/survey" element={<PrivateRoute><HealthSurvey /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><HealthProfile /></PrivateRoute>} />
      <Route path="/medicines" element={<SurveyRequiredRoute><MedicineManager /></SurveyRequiredRoute>} />
      <Route path="/interactions" element={<SurveyRequiredRoute><MedicineFood /></SurveyRequiredRoute>} />
      <Route path="/diet" element={<SurveyRequiredRoute><DietPlanner /></SurveyRequiredRoute>} />
      <Route path="/food-tracker" element={<SurveyRequiredRoute><FoodTracker /></SurveyRequiredRoute>} />
      <Route path="/fitness" element={<SurveyRequiredRoute><FitnessTracker /></SurveyRequiredRoute>} />
      <Route path="/wellness" element={<SurveyRequiredRoute><WellnessTracker /></SurveyRequiredRoute>} />
      <Route path="/vaccinations" element={<SurveyRequiredRoute><VaccinationTracker /></SurveyRequiredRoute>} />
      <Route path="/womens-health" element={<SurveyRequiredRoute><WomensHealth /></SurveyRequiredRoute>} />
      <Route path="/emergency" element={<SurveyRequiredRoute><EmergencyCard /></SurveyRequiredRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MedicineReminderProvider>
          <AppRoutes />
        </MedicineReminderProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
