import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
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
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/survey" element={<PrivateRoute><HealthSurvey /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><HealthProfile /></PrivateRoute>} />
      <Route path="/medicines" element={<PrivateRoute><MedicineManager /></PrivateRoute>} />
      <Route path="/interactions" element={<PrivateRoute><MedicineFood /></PrivateRoute>} />
      <Route path="/diet" element={<PrivateRoute><DietPlanner /></PrivateRoute>} />
      <Route path="/food-tracker" element={<PrivateRoute><FoodTracker /></PrivateRoute>} />
      <Route path="/fitness" element={<PrivateRoute><FitnessTracker /></PrivateRoute>} />
      <Route path="/wellness" element={<PrivateRoute><WellnessTracker /></PrivateRoute>} />
      <Route path="/vaccinations" element={<PrivateRoute><VaccinationTracker /></PrivateRoute>} />
      <Route path="/womens-health" element={<PrivateRoute><WomensHealth /></PrivateRoute>} />
      <Route path="/emergency" element={<PrivateRoute><EmergencyCard /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
