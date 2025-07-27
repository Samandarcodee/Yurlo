import { User, Globe, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Settings() {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Customize your Caloria AI experience</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-lg">S</span>
            </div>
            <div>
              <p className="font-medium">Samandar Qadirov</p>
              <p className="text-sm text-muted-foreground">Active since today</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Language Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Choose your preferred language</p>
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5 border-primary/20">
                <span className="font-medium">🇺🇸 English</span>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <span>🇺🇿 O'zbek</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <span>🇷🇺 Русский</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Meal Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded to log your meals</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Progress Reports</Label>
              <p className="text-sm text-muted-foreground">Weekly health summaries</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Water Reminders</Label>
              <p className="text-sm text-muted-foreground">Stay hydrated throughout the day</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Motivation Messages</Label>
              <p className="text-sm text-muted-foreground">Encouraging daily tips</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Other Options */}
      <div className="space-y-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Privacy & Security</p>
                <p className="text-sm text-muted-foreground">Data protection settings</p>
              </div>
              <Button variant="ghost" size="sm">→</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Help & Support</p>
                <p className="text-sm text-muted-foreground">FAQs and contact support</p>
              </div>
              <Button variant="ghost" size="sm">→</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* App Info */}
      <div className="text-center pt-4 pb-8">
        <p className="text-sm text-muted-foreground">
          Caloria AI v1.0.0
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Built with ❤️ for better health
        </p>
      </div>
    </div>
  );
}
