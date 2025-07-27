import { MessageCircle, Lightbulb, Heart, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Assistant() {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">AI Yordamchi</h1>
        <p className="text-muted-foreground">Shaxsiy sog'liq maslahatlari va tavsiyalarni oling</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-gradient-to-r from-water-100 to-water-50 border-water-200">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-water-200 rounded-full">
              <MessageCircle className="h-8 w-8 text-water-700" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-water-800 mb-2">Tez Orada!</h2>
            <p className="text-water-600">
              Sizning shaxsiy AI sog'liq yordamchingiz moslashtirilgan maslahatlar beradi,
              ovqatlanish bo'yicha savollaringizga javob beradi va sog'liq maqsadlaringizga erishishga yordam beradi.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Nimani Kutish Mumkin</h2>

        <div className="grid gap-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-mint-500 mt-1" />
                <div>
                  <h3 className="font-medium">Shaxsiy Maslahatlar</h3>
                  <p className="text-sm text-muted-foreground">
                    Maqsadlaringiz va taraqqiyotingizga asoslangan kunlik sog'liq tavsiyalari
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <h3 className="font-medium">Sog'liq Tahlili</h3>
                  <p className="text-sm text-muted-foreground">
                    Ovqatlanish tarzingizni tahlil qilish va yaxshilash takliflarini berish
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-medium">Tezkor Javoblar</h3>
                  <p className="text-sm text-muted-foreground">
                    Ovqatlanish bo'yicha savollar bering va AI tomonidan javoblar oling
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Siz uchun yaxshiroq AI yordamchi yaratishda yordam berish uchun ilovadan foydalanishni davom eting! 🤖
        </p>
      </div>
    </div>
  );
}
