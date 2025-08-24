import {
  User,
  Globe,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Palette,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";


function ThemeIndicator() {
  return (
    <p className="text-sm text-muted-foreground">
      Doim tungi rejim
    </p>
  );
}

export default function Settings() {
  const { resetUserData } = useUser();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    if (confirm("Haqiqatan ham barcha ma'lumotlarni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi!")) {
      setIsResetting(true);
      try {
        resetUserData();
        alert("Barcha ma'lumotlar muvaffaqiyatli o'chirildi!");
        // Reload the page to show reset state
        window.location.reload();
      } catch (error) {
        alert("Xatolik yuz berdi: " + error);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Sozlamalar</h1>
        <p className="text-muted-foreground">
          Caloria AI tajribangizni sozlang
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-lg">
                S
              </span>
            </div>
            <div>
              <p className="font-medium">Samandar Qadirov</p>
              <p className="text-sm text-muted-foreground">
                Bugundan beri faol
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Profilni Tahrirlash
          </Button>
        </CardContent>
      </Card>

      {/* Language Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Til
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Afzal ko'rgan tilingizni tanlang
            </p>
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <span>🇺🇸 English</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5 border-primary/20">
                <span className="font-medium">🇺🇿 O'zbek</span>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <span>🇷🇺 Русский</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Section */}
      <Card className="theme-transition">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Mavzu (Theme)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ilova ko'rinishini o'zingizga moslashtiring
            </p>

            {/* Theme Toggle Controls */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Rejim</p>
                  <ThemeIndicator />
                </div>
              </div>
              <span className="text-sm text-muted-foreground">Tungi rejim</span>
            </div>

            {/* Theme Preview Cards */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-950/20 dark:to-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-calorie"></div>
                  <span className="text-sm font-medium">Calorie Theme</span>
                </div>
                <div className="text-xs text-muted-foreground">Kaloriya</div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-water"></div>
                  <span className="text-sm font-medium">Water Theme</span>
                </div>
                <div className="text-xs text-muted-foreground">Suv</div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-green-50 to-purple-50 dark:from-green-950/20 dark:to-purple-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-step"></div>
                  <span className="text-sm font-medium">Activity Theme</span>
                </div>
                <div className="text-xs text-muted-foreground">Faollik</div>
              </div>
            </div>

            {/* Theme Information */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Auto</strong> rejimi Telegram va tizim sozlamalariga
                asoslangan. Qo'lda o'zgartirilganda sizning tanlovingiz
                saqlanadi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirishnomalar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ovqat Eslatmalari</Label>
              <p className="text-sm text-muted-foreground">
                Ovqatlaringizni qayd qilishni eslatish
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Taraqqiyot Hisobotlari</Label>
              <p className="text-sm text-muted-foreground">
                Haftalik sog'liq xulosalari
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Suv Eslatmalari</Label>
              <p className="text-sm text-muted-foreground">
                Kun davomida suv ichishni eslating
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Rag'batlantiruvchi Xabarlar</Label>
              <p className="text-sm text-muted-foreground">
                Kunlik rag'batlantiruvchi maslahatlar
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Data Reset Section */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Trash2 className="h-5 w-5" />
            Ma'lumotlarni Tozalash
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-red-700">
                Bu amal barcha saqlangan ma'lumotlarni o'chiradi:
              </p>
              <ul className="text-xs text-red-600 space-y-1 ml-4">
                <li>• Kaloriya ma'lumotlari</li>
                <li>• Ovqat yozuvlari</li>
                <li>• Uyqu va qadamlar</li>
                <li>• Foydalanuvchi profili</li>
                <li>• Barcha sozlamalar</li>
              </ul>
            </div>
          </div>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleResetData}
            disabled={isResetting}
          >
            {isResetting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                O'chirilmoqda...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Barcha Ma'lumotlarni O'chirish
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Other Options */}
      <div className="space-y-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Maxfiylik va Xavfsizlik</p>
                <p className="text-sm text-muted-foreground">
                  Ma'lumotlarni himoya qilish sozlamalari
                </p>
              </div>
              <Button variant="ghost" size="sm">
                →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Yordam va Qo'llab-quvvatlash</p>
                <p className="text-sm text-muted-foreground">
                  Ko'p beriladigan savollar va qo'llab-quvvatlash
                </p>
              </div>
              <Button variant="ghost" size="sm">
                →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* App Info */}
      <div className="text-center pt-4 pb-8">
        <p className="text-sm text-muted-foreground">Caloria AI v1.0.0</p>
        <p className="text-xs text-muted-foreground mt-1">
          Yaxshi sog'liq uchun ❤️ bilan yaratilgan
        </p>
      </div>
    </div>
  );
}
