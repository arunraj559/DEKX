import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NeonCard } from "@/components/ui/neon-card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings as SettingsIcon, Save, Trash2, Plus } from "lucide-react";
import logoImage from '@assets/generated_images/neon_hexagon_cybernetic_logo.png';
import { mockStorage } from "@/lib/mock-storage";

interface DashboardSettings {
  id: string;
  approverEmails: string;
  adminPassword: string;
  maxAdvanceDays: string;
}

export default function Settings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<DashboardSettings | null>(null);
  const [approverEmailsList, setApproverEmailsList] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [maxAdvanceDays, setMaxAdvanceDays] = useState("60");
  const [showPassword, setShowPassword] = useState(false);

  // Load settings from mock storage
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    try {
      const data = mockStorage.getSettings();
      // Cast to DashboardSettings type for consistency, adding ID
      const settingsData = {
        id: "local",
        ...data
      } as DashboardSettings;
      
      setSettings(settingsData);
      setApproverEmailsList(data.approverEmails ? data.approverEmails.split(",").map((e: string) => e.trim()) : []);
      setAdminPassword(data.adminPassword || "");
      setMaxAdvanceDays(data.maxAdvanceDays || "60");
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    }
  };

  const addApproverEmail = () => {
    if (!newEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (approverEmailsList.includes(newEmail.trim())) {
      toast({
        title: "Error",
        description: "Email already in list",
        variant: "destructive",
      });
      return;
    }

    setApproverEmailsList([...approverEmailsList, newEmail.trim()]);
    setNewEmail("");
  };

  const removeApproverEmail = (email: string) => {
    setApproverEmailsList(approverEmailsList.filter(e => e !== email));
  };

  const saveSettings = async () => {
    if (approverEmailsList.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one approver email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newSettings = {
        approverEmails: approverEmailsList.join(", "),
        adminPassword,
        maxAdvanceDays,
      };
      
      mockStorage.saveSettings(newSettings);

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
      fetchSettings();
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 255, 200, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 0, 255, 0.1) 0%, transparent 50%)',
    }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <img src={logoImage} alt="Logo" className="w-12 h-12" />
          <div>
            <h1 className="text-4xl font-bold font-display tracking-widest text-[var(--color-primary)] uppercase">
              SETTINGS
            </h1>
            <p className="text-[var(--color-secondary)] font-mono text-sm mt-1">Configure system parameters</p>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Approver Emails Section */}
        <NeonCard className="p-6 border-[var(--color-primary)]">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="text-xl font-bold text-[var(--color-primary)] uppercase tracking-widest">
              Approver Emails
            </h2>
          </div>

          <div className="space-y-4">
            {/* List of approver emails */}
            {approverEmailsList.length > 0 && (
              <div className="bg-black/40 rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto border border-[var(--color-primary)]/30">
                {approverEmailsList.map((email, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[var(--color-primary)]/10 p-3 rounded border border-[var(--color-primary)]/50">
                    <span className="text-white font-mono text-sm">{email}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeApproverEmail(email)}
                      className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/20 h-8"
                      data-testid={`button-remove-email-${idx}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new email */}
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter approver email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addApproverEmail()}
                className="bg-black/60 border-[var(--color-primary)]/50 text-white placeholder:text-white/40 focus:border-[var(--color-primary)]"
                data-testid="input-approver-email"
              />
              <Button
                onClick={addApproverEmail}
                className="bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary)]/80 font-bold"
                data-testid="button-add-email"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </NeonCard>

        {/* Admin Password Section */}
        <NeonCard className="p-6 border-[var(--color-secondary)]">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-5 h-5 text-[var(--color-secondary)]" />
            <h2 className="text-xl font-bold text-[var(--color-secondary)] uppercase tracking-widest">
              Admin Password
            </h2>
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="bg-black/60 border-[var(--color-secondary)]/50 text-white placeholder:text-white/40 focus:border-[var(--color-secondary)] pr-10"
              data-testid="input-admin-password"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] hover:text-[var(--color-secondary)]/80"
              data-testid="button-toggle-password"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-white/50 mt-2 font-mono">
            Leave empty to keep current password
          </p>
        </NeonCard>

        {/* Max Advance Days Section */}
        <NeonCard className="p-6 border-[var(--color-accent)]">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="text-xl font-bold text-[var(--color-accent)] uppercase tracking-widest">
              Max Advance Days
            </h2>
          </div>

          <Input
            type="number"
            placeholder="60"
            value={maxAdvanceDays}
            onChange={(e) => setMaxAdvanceDays(e.target.value)}
            className="bg-black/60 border-[var(--color-accent)]/50 text-white placeholder:text-white/40 focus:border-[var(--color-accent)]"
            data-testid="input-max-advance-days"
          />
          <p className="text-xs text-white/50 mt-2 font-mono">
            Maximum number of days employees can request cuti in advance
          </p>
        </NeonCard>

        {/* Save Button */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-[var(--color-primary)]/50 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={saveSettings}
            disabled={loading}
            className="bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary)]/80 font-bold"
            data-testid="button-save-settings"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
