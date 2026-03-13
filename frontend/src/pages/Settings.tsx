import { AppLayout } from "@/components/AppLayout";
import { PageCard } from "@/components/StatCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, Shield, Info } from "lucide-react";

const Settings = () => (
  <AppLayout title="Settings">
    <div className="max-w-2xl mx-auto space-y-6">
      <PageCard title="Appearance" action={<ThemeToggle />}>
        <p className="text-sm text-muted-foreground">Toggle between light and dark mode using the button on the right.</p>
      </PageCard>

      <PageCard title="Privacy & Data" action={<Shield className="h-5 w-5 text-primary" />}>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>• Your health data is stored securely in MongoDB Atlas with encryption at rest.</p>
          <p>• Passwords are hashed using bcrypt — never stored in plain text.</p>
          <p>• JWT tokens expire after 7 days for your security.</p>
          <p>• AI chat conversations are not stored permanently.</p>
        </div>
      </PageCard>

      <PageCard title="About Medora" action={<Info className="h-5 w-5 text-primary" />}>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Version:</strong> 1.0.0</p>
          <p><strong className="text-foreground">Stack:</strong> React · Node.js · MongoDB · OpenAI</p>
          <p className="text-xs mt-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg p-3">
            ⚠️ Medora provides educational health information only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.
          </p>
        </div>
      </PageCard>
    </div>
  </AppLayout>
);

export default Settings;
