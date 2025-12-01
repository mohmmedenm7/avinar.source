import React, { useState } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
}

export interface QuizData {
    title: string;
    questions: Question[];
    duration?: number;
    difficulty?: string;
}

interface QuizEditorProps {
    quizData: QuizData;
    setQuizData: (data: QuizData) => void;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({ quizData, setQuizData }) => {
    const handleAddQuestion = () => {
        setQuizData({
            ...quizData,
            questions: [
                ...quizData.questions,
                { question: "", options: ["", "", "", ""], correctAnswer: 0 },
            ],
        });
    };

    const handleRemoveQuestion = (index: number) => {
        const newQuestions = quizData.questions.filter((_, i) => i !== index);
        setQuizData({ ...quizData, questions: newQuestions });
    };

    const handleQuestionChange = (index: number, value: string) => {
        const newQuestions = [...quizData.questions];
        newQuestions[index].question = value;
        setQuizData({ ...quizData, questions: newQuestions });
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...quizData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuizData({ ...quizData, questions: newQuestions });
    };

    const handleCorrectAnswerChange = (qIndex: number, value: number) => {
        const newQuestions = [...quizData.questions];
        newQuestions[qIndex].correctAnswer = value;
        setQuizData({ ...quizData, questions: newQuestions });
    };

    return (
        <div className="space-y-6 text-right" dir="rtl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">إعداد الاختبار (اختياري)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الاختبار</label>
                            <Input
                                value={quizData.title}
                                onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                                placeholder="مثال: اختبار أساسيات Node.js"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">المدة (بالدقائق)</label>
                            <Input
                                type="number"
                                value={quizData.duration || ""}
                                onChange={(e) => setQuizData({ ...quizData, duration: parseInt(e.target.value) || 0 })}
                                placeholder="مثال: 30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">مستوى الصعوبة</label>
                            <select
                                value={quizData.difficulty || "beginner"}
                                onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:border-blue-500 focus:outline-none"
                            >
                                <option value="beginner">مبتدئ</option>
                                <option value="intermediate">متوسط</option>
                                <option value="advanced">متقدم</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {quizData.questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-gray-700">السؤال {qIndex + 1}</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleRemoveQuestion(qIndex)}
                                    >
                                        <Trash2 className="h-4 w-4" /> حذف
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <Input
                                        value={q.question}
                                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                        placeholder="نص السؤال..."
                                        className="font-medium"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2">
                                                <div
                                                    className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${q.correctAnswer === oIndex
                                                        ? "bg-green-500 border-green-500 text-white"
                                                        : "border-gray-300 hover:border-gray-400"
                                                        }`}
                                                    onClick={() => handleCorrectAnswerChange(qIndex, oIndex)}
                                                    title="Click to set as correct answer"
                                                >
                                                    {q.correctAnswer === oIndex && <CheckCircle2 size={14} />}
                                                </div>
                                                <Input
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                    placeholder={`الخيار ${oIndex + 1}`}
                                                    className={q.correctAnswer === oIndex ? "border-green-500 ring-1 ring-green-500" : ""}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        * اضغط على الدائرة بجانب الخيار لتحديده كإجابة صحيحة.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button onClick={handleAddQuestion} variant="outline" className="w-full border-dashed">
                        <Plus className="mr-2 h-4 w-4" /> إضافة سؤال
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
