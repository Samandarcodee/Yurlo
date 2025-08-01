/**
 * Enhanced Professional Profile Page
 * Comprehensive user profile management with all features
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Edit, Save, X, Camera, Settings, Target, Activity,
  Heart, Calendar, Clock, Bell, Shield, Download, Upload,
  TrendingUp, Award, Star, Users, BarChart3, Palette,
  Moon, Sun, Globe, Zap, Coffee, Apple, Droplets,
  Footprints, Weight, Ruler, Plus, Trash2, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTelegram } from '@/hooks/use-telegram';
import { useTheme } from '@/contexts/ThemeContext';
import UserProfileService, { EnhancedUserProfile, Achievement, Badge as UserBadge } from '@/services/user-profile-service';
import TelegramUserService from '@/services/telegram-user-service';
import DailyTrackingService from '@/services/daily-tracking-service';

export default function EnhancedProfile() {
  const { user: telegramUser, cloudStorage, hapticFeedback, showAlert, showConfirm } = useTelegram();
  const { theme, setTheme } = useTheme();
  
  // Services
  const [profileService] = useState(() => 
    UserProfileService.getInstance(TelegramUserService.getInstance(cloudStorage))
  );
  const [trackingService] = useState(() => 
    DailyTrackingService.getInstance(TelegramUserService.getInstance(cloudStorage))
  );

  // Profile data
  const [profile, setProfile] = useState<EnhancedUserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<EnhancedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI states
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState<string | null>(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const telegramId = telegramUser?.id?.toString() || 'demo_user';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await profileService.getEnhancedProfile(telegramId);
      setProfile(profileData);
      setEditedProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      showAlert('Profil yuklanmadi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const saveProfileSection = async (section: keyof EnhancedUserProfile, data: any) => {
    try {
      setSaving(true);
      hapticFeedback.impact('light');
      
      const success = await profileService.updateProfileSection(telegramId, section, data);
      
      if (success) {
        await loadProfile();
        setEditMode(null);
        hapticFeedback.notification('success');
        showAlert('Ma\'lumotlar saqlandi!');
      } else {
        hapticFeedback.notification('error');
        showAlert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      }
    } catch (error) {
      console.error('Error saving profile section:', error);
      hapticFeedback.notification('error');
      showAlert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const avatarUrl = e.target?.result as string;
        await saveProfileSection('avatar', avatarUrl);
        setShowAvatarUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportData = async () => {
    try {
      const data = await profileService.exportProfileData(telegramId);
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yurlo-profile-${telegramId}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showAlert('Ma\'lumotlar eksport qilindi!');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showAlert('Eksport xatolik bilan yakunlandi.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-sm mx-4 theme-card shadow-xl">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground font-medium">Profil yuklanmoqda...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 theme-card shadow-xl">
          <CardContent className="pt-8 pb-6 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-foreground">Profil topilmadi</h3>
            <p className="text-muted-foreground mb-6">
              Iltimos, avval ro'yxatdan o'ting
            </p>
            <Button className="w-full" onClick={() => window.location.href = '/onboarding'}>
              Ro'yxatdan o'tish
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30">
      <div className="container-mobile min-h-screen pb-24">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Profil</h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExportDialog(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(editMode ? null : 'basic')}
                className="text-muted-foreground hover:text-foreground"
              >
                {editMode ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-4 space-y-6">
          {/* Profile Header */}
          <Card className="theme-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                    onClick={() => setShowAvatarUpload(true)}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-muted-foreground">@{profile.username}</p>
                  
                  {/* Level & Experience */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        Level {profile.level || 1}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {profile.experience || 0} XP
                      </span>
                    </div>
                    <Progress 
                      value={((profile.experience || 0) % 1000) / 10} 
                      className="h-1" 
                    />
                  </div>
                </div>

                {/* Streak */}
                {profile.streak && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {profile.streak.currentDays}
                    </div>
                    <div className="text-xs text-muted-foreground">kunlik</div>
                    <div className="text-xs text-muted-foreground">streak</div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {profile.bio}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Umumiy</TabsTrigger>
              <TabsTrigger value="health">Salomatlik</TabsTrigger>
              <TabsTrigger value="goals">Maqsadlar</TabsTrigger>
              <TabsTrigger value="settings">Sozlamalar</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="theme-card">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {profile.weight || '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">kg</div>
                    <div className="text-sm font-medium">Vazn</div>
                  </CardContent>
                </Card>
                
                <Card className="theme-card">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-accent mb-1">
                      {profile.height || '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">sm</div>
                    <div className="text-sm font-medium">Bo'y</div>
                  </CardContent>
                </Card>
              </div>

              {/* Achievements */}
              {profile.achievements && profile.achievements.length > 0 && (
                <Card className="theme-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5" />
                      <span>Yutuqlar</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {profile.achievements.slice(0, 6).map((achievement) => (
                        <div
                          key={achievement.id}
                          className="text-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="text-2xl mb-1">{achievement.icon}</div>
                          <div className="text-xs font-medium">{achievement.title}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <Card className="theme-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>So'nggi faollik</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Oxirgi faollik: {new Date(profile.lastActiveAt).toLocaleDateString('uz-UZ')}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health" className="space-y-4">
              {/* Body Composition */}
              <Card className="theme-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span>Tana tarkibi</span>
                    </div>
                    {editMode !== 'body' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditMode('body')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editMode === 'body' ? (
                    <EditBodyComposition
                      profile={editedProfile!}
                      onChange={setEditedProfile}
                      onSave={() => saveProfileSection('bodyFatPercentage', editedProfile?.bodyFatPercentage)}
                      onCancel={() => setEditMode(null)}
                      saving={saving}
                    />
                  ) : (
                    <ViewBodyComposition profile={profile} />
                  )}
                </CardContent>
              </Card>

              {/* Medical Info */}
              <Card className="theme-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Tibbiy ma'lumotlar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.medicalConditions && profile.medicalConditions.length > 0 ? (
                      <div>
                        <Label className="text-sm font-medium">Kasalliklar</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.medicalConditions.map((condition, index) => (
                            <Badge key={index} variant="outline">{condition}</Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Tibbiy ma'lumotlar kiritilmagan</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-4">
              <GoalsSection
                profile={profile}
                editMode={editMode}
                onEdit={setEditMode}
                onSave={saveProfileSection}
                saving={saving}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <SettingsSection
                profile={profile}
                onSave={saveProfileSection}
                theme={theme}
                onThemeChange={setTheme}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Avatar Upload Dialog */}
        <Dialog open={showAvatarUpload} onOpenChange={setShowAvatarUpload}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Avatar o'zgartirish</DialogTitle>
              <DialogDescription>
                Yangi profil rasmini tanlang
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="focus-professional"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowAvatarUpload(false)}>
                Bekor qilish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ma'lumotlarni eksport qilish</DialogTitle>
              <DialogDescription>
                Barcha profil va tracking ma'lumotlaringizni JSON formatida yuklab oling.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowExportDialog(false)}>
                Bekor qilish
              </Button>
              <Button onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Eksport qilish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// === HELPER COMPONENTS === //

const EditBodyComposition: React.FC<{
  profile: EnhancedUserProfile;
  onChange: (profile: EnhancedUserProfile) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}> = ({ profile, onChange, onSave, onCancel, saving }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Yog' foizi (%)</Label>
        <Input
          type="number"
          value={profile.bodyFatPercentage || ''}
          onChange={(e) => onChange({
            ...profile,
            bodyFatPercentage: parseFloat(e.target.value) || undefined
          })}
          placeholder="15.5"
        />
      </div>
      
      <div>
        <Label>Mushak massasi (kg)</Label>
        <Input
          type="number"
          value={profile.muscleMass || ''}
          onChange={(e) => onChange({
            ...profile,
            muscleMass: parseFloat(e.target.value) || undefined
          })}
          placeholder="45.2"
        />
      </div>

      <div className="flex space-x-2">
        <Button onClick={onSave} disabled={saving} className="flex-1">
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Bekor qilish
        </Button>
      </div>
    </div>
  );
};

const ViewBodyComposition: React.FC<{ profile: EnhancedUserProfile }> = ({ profile }) => {
  const bmi = profile.weight && profile.height 
    ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
    : null;

  return (
    <div className="grid grid-cols-2 gap-4">
      {bmi && (
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{bmi}</div>
          <div className="text-sm text-muted-foreground">BMI</div>
        </div>
      )}
      
      {profile.bodyFatPercentage && (
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{profile.bodyFatPercentage}%</div>
          <div className="text-sm text-muted-foreground">Yog' foizi</div>
        </div>
      )}
      
      {profile.muscleMass && (
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{profile.muscleMass}kg</div>
          <div className="text-sm text-muted-foreground">Mushak massasi</div>
        </div>
      )}
    </div>
  );
};

const GoalsSection: React.FC<{
  profile: EnhancedUserProfile;
  editMode: string | null;
  onEdit: (mode: string | null) => void;
  onSave: (section: keyof EnhancedUserProfile, data: any) => void;
  saving: boolean;
}> = ({ profile, editMode, onEdit, onSave, saving }) => {
  return (
    <Card className="theme-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Maqsadlar</span>
          </div>
          {editMode !== 'goals' && (
            <Button variant="ghost" size="sm" onClick={() => onEdit('goals')}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profile.goals ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Asosiy maqsad</Label>
              <p className="text-sm text-muted-foreground">
                {profile.goals.type === 'lose_weight' && 'Vazn kamaytirish'}
                {profile.goals.type === 'gain_weight' && 'Vazn oshirish'}
                {profile.goals.type === 'maintain_weight' && 'Vaznni saqlash'}
                {profile.goals.type === 'build_muscle' && 'Mushak qurish'}
              </p>
            </div>
            
            {profile.goals.targetWeight && (
              <div>
                <Label className="text-sm font-medium">Maqsad vazn</Label>
                <p className="text-sm text-muted-foreground">{profile.goals.targetWeight} kg</p>
              </div>
            )}
            
            {profile.goals.targetCalories && (
              <div>
                <Label className="text-sm font-medium">Kunlik kaloriya</Label>
                <p className="text-sm text-muted-foreground">{profile.goals.targetCalories} kal</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Maqsadlar belgilanmagan</p>
        )}
      </CardContent>
    </Card>
  );
};

const SettingsSection: React.FC<{
  profile: EnhancedUserProfile;
  onSave: (section: keyof EnhancedUserProfile, data: any) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
}> = ({ profile, onSave, theme, onThemeChange }) => {
  return (
    <div className="space-y-4">
      {/* Theme Settings */}
      <Card className="theme-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Tema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tungi rejim</Label>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => onThemeChange(checked ? 'dark' : 'light')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="theme-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Bildirishnomalar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ovqat eslatmalari</Label>
              <Switch
                checked={profile.reminderSettings?.mealReminders ?? true}
                onCheckedChange={(checked) => onSave('reminderSettings', {
                  ...profile.reminderSettings,
                  mealReminders: checked
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Suv eslatmalari</Label>
              <Switch
                checked={profile.reminderSettings?.waterReminders ?? true}
                onCheckedChange={(checked) => onSave('reminderSettings', {
                  ...profile.reminderSettings,
                  waterReminders: checked
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Sport eslatmalari</Label>
              <Switch
                checked={profile.reminderSettings?.exerciseReminders ?? true}
                onCheckedChange={(checked) => onSave('reminderSettings', {
                  ...profile.reminderSettings,
                  exerciseReminders: checked
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="theme-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Maxfiylik</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Do'stlar bilan taraqqiyot ulashish</Label>
              <Switch
                checked={profile.privacySettings?.shareProgressWithFriends ?? false}
                onCheckedChange={(checked) => onSave('privacySettings', {
                  ...profile.privacySettings,
                  shareProgressWithFriends: checked
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Ma'lumotlar tahlili</Label>
              <Switch
                checked={profile.privacySettings?.allowDataAnalytics ?? true}
                onCheckedChange={(checked) => onSave('privacySettings', {
                  ...profile.privacySettings,
                  allowDataAnalytics: checked
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};