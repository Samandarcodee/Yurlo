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
