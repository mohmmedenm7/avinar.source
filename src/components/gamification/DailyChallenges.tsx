import { CheckCircle2, Circle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DailyChallenges = () => {
    // Mock Data
    const challenges = [
        { id: 1, title: "سجل دخولك اليوم", xp: 50, completed: true, claimed: true },
        { id: 2, title: "أكمل درساً واحداً", xp: 100, completed: true, claimed: false },
        { id: 3, title: "احصل على 100% في اختبار", xp: 200, completed: false, claimed: false },
    ];

    return (
        <Card className="border-gray-200 shadow-sm h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Gift className="h-5 w-5 text-purple-600" />
                    التحديات اليومية
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {challenges.map((challenge) => (
                        <div
                            key={challenge.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${challenge.completed ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {challenge.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <Circle className="h-5 w-5 text-gray-400" />
                                )}
                                <div>
                                    <p className={`font-medium ${challenge.completed ? "text-gray-900" : "text-gray-600"}`}>
                                        {challenge.title}
                                    </p>
                                    <p className="text-xs text-gray-500">+{challenge.xp} XP</p>
                                </div>
                            </div>

                            {challenge.completed && !challenge.claimed && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs">
                                    استلم المكافأة
                                </Button>
                            )}

                            {challenge.claimed && (
                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                    تم الاستلام
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default DailyChallenges;
