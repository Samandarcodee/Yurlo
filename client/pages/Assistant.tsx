import { MessageCircle, Lightbulb, Heart, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Assistant() {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">AI Assistant</h1>
        <p className="text-muted-foreground">Get personalized health tips and recommendations</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-gradient-to-r from-health-100 to-health-50 border-health-200">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-health-200 rounded-full">
              <MessageCircle className="h-8 w-8 text-health-700" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-health-800 mb-2">Coming Soon!</h2>
            <p className="text-health-600">
              Your personal AI health assistant will provide customized tips, 
              answer your nutrition questions, and help you achieve your health goals.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">What to Expect</h2>
        
        <div className="grid gap-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-medium">Personalized Tips</h3>
                  <p className="text-sm text-muted-foreground">
                    Get daily health recommendations based on your goals and progress
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
                  <h3 className="font-medium">Health Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze your eating patterns and suggest improvements
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
                  <h3 className="font-medium">Instant Answers</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask nutrition questions and get AI-powered responses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Continue using the app to help us build a better AI assistant for you! 🤖
        </p>
      </div>
    </div>
  );
}
