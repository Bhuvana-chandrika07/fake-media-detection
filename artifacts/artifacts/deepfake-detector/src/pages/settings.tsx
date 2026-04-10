import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Mail, Info, AlertCircle, Phone } from "lucide-react";
import { EmergencyReportModal } from "@/components/emergency-report-modal";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoAnalysis, setAutoAnalysis] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("en");
  const [showEmergencyReport, setShowEmergencyReport] = useState(false);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-display font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Customize your experience and preferences.</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme.</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for scan results and updates.</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>

          {/* Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Analysis Settings
              </CardTitle>
              <CardDescription>
                Configure analysis behavior and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-Analysis</Label>
                  <p className="text-sm text-muted-foreground">Automatically analyze uploaded files without manual confirmation.</p>
                </div>
                <Switch checked={autoAnalysis} onCheckedChange={setAutoAnalysis} />
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Language & Region
              </CardTitle>
              <CardDescription>
                Set your language and regional preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Language</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred language.</p>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">Download all your scan history and data.</p>
                </div>
                <Button variant="outline">Export</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
                </div>
                <Button variant="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Us
              </CardTitle>
              <CardDescription>
                Get in touch with our support team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm">Email</p>
                  <p className="text-sm text-muted-foreground">support@deepfakedetector.com</p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-sm">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Available Monday-Friday, 9 AM - 5 PM EST</p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-sm">Response Time</p>
                  <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
                </div>
              </div>
              <Button className="w-full" variant="outline">Send Message</Button>
            </CardContent>
          </Card>

          {/* About Us */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                About Us
              </CardTitle>
              <CardDescription>
                Learn more about our mission and vision.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">DeepFake Detector</span> is an advanced AI-powered platform designed to identify and analyze manipulated media content with high accuracy.
                </p>
                <p>
                  Our mission is to combat misinformation by providing individuals and organizations with reliable tools to detect deepfakes and synthetic media.
                </p>
                <p className="text-muted-foreground">
                  Version 2.0 | [c] 2026 DeepFake Detector. All rights reserved.
                </p>
              </div>
              <Button className="w-full" variant="outline">Visit Website</Button>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>
                Critical support and escalation contacts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Security Incident Hotline
                  </p>
                  <p className="text-sm text-muted-foreground">+1 (800) 555-0123</p>
                  <p className="text-xs text-muted-foreground">24/7 Emergency Support</p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-sm">Abuse Report</p>
                  <p className="text-sm text-muted-foreground">abuse@deepfakedetector.com</p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-sm">Technical Support</p>
                  <p className="text-sm text-muted-foreground">technical@deepfakedetector.com</p>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant="destructive"
                onClick={() => setShowEmergencyReport(true)}
              >
                Report Emergency
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <EmergencyReportModal 
        isOpen={showEmergencyReport} 
        onClose={() => setShowEmergencyReport(false)} 
      />
    </Layout>
  );
}