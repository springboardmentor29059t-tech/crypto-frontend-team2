import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Bell,
  Shield,
  Key,
  Palette,
  Moon,
  Mail,
  Smartphone,
  Save,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, updateSettings } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const settingsSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "api", label: "API Keys", icon: Key },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const Settings = () => {
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const [form, setForm] = useState<any | null>(null);

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast({ title: "Settings saved" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    },
  });

  if (isLoading || !form) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading settings...
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center text-destructive">
          Failed to load settings.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <nav className="glass rounded-2xl p-4 space-y-1">
            {settingsSections.map((section, index) => (
              <button
                key={section.id}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left",
                  index === 0
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </nav>

          <Button variant="danger" className="w-full mt-4 gap-2" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Profile Section */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>

            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold">
                {user?.name?.slice(0, 2).toUpperCase() || "U"}
              </div>
              <div>
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={form.profile.name}
                  onChange={(e) => setForm({ ...form, profile: { ...form.profile, name: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={form.profile.email}
                  onChange={(e) => setForm({ ...form, profile: { ...form.profile, email: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  type="tel"
                  value={form.profile.phone || ""}
                  onChange={(e) => setForm({ ...form, profile: { ...form.profile, phone: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <Input
                  value={form.profile.timezone || ""}
                  onChange={(e) =>
                    setForm({ ...form, profile: { ...form.profile, timezone: e.target.value } })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="glow"
                className="gap-2"
                onClick={() => mutation.mutate(form)}
                disabled={mutation.isLoading}
              >
                <Save className="w-4 h-4" />
                {mutation.isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>

            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  title: "Email Notifications",
                  description: "Receive email alerts for important updates",
                  key: "email",
                },
                {
                  icon: Smartphone,
                  title: "Push Notifications",
                  description: "Get push notifications on your devices",
                  key: "push",
                },
                {
                  icon: Bell,
                  title: "Price Alerts",
                  description: "Notify when assets hit target prices",
                  key: "priceAlerts",
                },
                {
                  icon: Shield,
                  title: "Risk Alerts",
                  description: "Immediate alerts for scam/risk detection",
                  key: "riskAlerts",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.notifications[item.key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          notifications: { ...form.notifications, [item.key]: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Appearance Section */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Appearance</h2>

            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Moon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme across the application
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.appearance.darkMode}
                  onChange={(e) =>
                    setForm({ ...form, appearance: { ...form.appearance, darkMode: e.target.checked } })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Settings;
