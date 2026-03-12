import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <Activity className="h-16 w-16 text-primary/30 mx-auto mb-4" />
      <h1 className="text-6xl font-bold text-foreground mb-2" style={{ fontFamily: "Syne, sans-serif" }}>404</h1>
      <p className="text-muted-foreground mb-6">This page isn't part of your health plan.</p>
      <Button asChild><Link to="/dashboard"><Home className="h-4 w-4 mr-2" />Back to Dashboard</Link></Button>
    </motion.div>
  </div>
);

export default NotFound;
