import { BarChart3, TrendingUp, Calendar, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Analytics() {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Tahlil</h1>
        <p className="text-muted-foreground">Vaqt davomida sog'ligingiz taraqqiyotini kuzating</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-gradient-to-r from-health-100 to-health-50 border-health-200">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-health-200 rounded-full">
              <BarChart3 className="h-8 w-8 text-health-700" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-health-800 mb-2">Kengaytirilgan Tahlil Tez Orada!</h2>
            <p className="text-health-600">
              Sog'liq yo'lingizni ko'rsatish uchun batafsil grafiklar, taraqqiyot kuzatuvi
              va tushunchalar bu yerda mavjud bo'ladi.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Nimani Ko'rasiz</h2>

        <div className="grid gap-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h3 className="font-medium">Vazn va Kaloriya Tendensiyalari</h3>
                  <p className="text-sm text-muted-foreground">
                    Iste'mol qilingan va yoqilgan kaloriyalar hamda vazn o'zgarishlarini ko'rsatuvchi vizual grafiklar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-medium">Haftalik va Oylik Hisobotlar</h3>
                  <p className="text-sm text-muted-foreground">
                    Vaqt davomida sog'liq ko'rsatkichlaringizning to'liq xulosalari
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <h3 className="font-medium">Maqsad Taraqqiyotini Kuzatish</h3>
                  <p className="text-sm text-muted-foreground">
                    Vazn va fitnes maqsadlaringizga erishish jarayonini kuzating
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Batafsil tahlilni ochish uchun ovqat va faoliyatlaringizni qayd qilishda davom eting! 📊
        </p>
      </div>
    </div>
  );
}
