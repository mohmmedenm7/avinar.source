import React, { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Video, FileText, Clock, Link as LinkIcon, Eye, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface Lecture {
    title: string;
    video: string;        // رفع ملف
    videoUrl: string;     // رابط خارجي
    description: string;
    duration: number;
    isFree: boolean;      // محاضرة مجانية للمعاينة
}

export interface Section {
    title: string;
    lectures: Lecture[];
}

interface CurriculumEditorProps {
    whatWillYouLearn: string[];
    setWhatWillYouLearn: (items: string[]) => void;
    curriculum: Section[];
    setCurriculum: (sections: Section[]) => void;
}

export const CurriculumEditor: React.FC<CurriculumEditorProps> = ({
    whatWillYouLearn,
    setWhatWillYouLearn,
    curriculum,
    setCurriculum,
}) => {
    // --- What Will You Learn Logic ---
    const handleAddLearnItem = () => {
        setWhatWillYouLearn([...whatWillYouLearn, ""]);
    };

    const handleRemoveLearnItem = (index: number) => {
        const newItems = whatWillYouLearn.filter((_, i) => i !== index);
        setWhatWillYouLearn(newItems);
    };

    const handleChangeLearnItem = (index: number, value: string) => {
        const newItems = [...whatWillYouLearn];
        newItems[index] = value;
        setWhatWillYouLearn(newItems);
    };

    // --- Curriculum Logic ---
    const handleAddSection = () => {
        setCurriculum([...curriculum, { title: "قسم جديد", lectures: [] }]);
    };

    const handleRemoveSection = (index: number) => {
        if (window.confirm("هل أنت متأكد من حذف هذا القسم؟")) {
            const newSections = curriculum.filter((_, i) => i !== index);
            setCurriculum(newSections);
        }
    };

    const handleSectionTitleChange = (index: number, title: string) => {
        const newSections = [...curriculum];
        newSections[index].title = title;
        setCurriculum(newSections);
    };

    const handleAddLecture = (sectionIndex: number) => {
        const newSections = [...curriculum];
        newSections[sectionIndex].lectures.push({
            title: "محاضرة جديدة",
            video: "",
            videoUrl: "",
            description: "",
            duration: 0,
            isFree: false,
        });
        setCurriculum(newSections);
    };

    const handleRemoveLecture = (sectionIndex: number, lectureIndex: number) => {
        const newSections = [...curriculum];
        newSections[sectionIndex].lectures = newSections[sectionIndex].lectures.filter(
            (_, i) => i !== lectureIndex
        );
        setCurriculum(newSections);
    };

    const handleLectureChange = (
        sectionIndex: number,
        lectureIndex: number,
        field: keyof Lecture,
        value: string | number | boolean
    ) => {
        const newSections = [...curriculum];
        newSections[sectionIndex].lectures[lectureIndex] = {
            ...newSections[sectionIndex].lectures[lectureIndex],
            [field]: value,
        };
        setCurriculum(newSections);
    };

    return (
        <div className="space-y-8 text-right" dir="rtl">
            {/* What Will You Learn Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">ماذا ستتعلم في هذا الكورس؟</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {whatWillYouLearn.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <Input
                                value={item}
                                onChange={(e) => handleChangeLearnItem(index, e.target.value)}
                                placeholder={`نقطة تعلم ${index + 1}`}
                                className="flex-1"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleRemoveLearnItem(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button onClick={handleAddLearnItem} variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> إضافة نقطة تعلم
                    </Button>
                </CardContent>
            </Card>

            {/* Curriculum Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold">المنهج الدراسي (Curriculum)</CardTitle>
                    <Button onClick={handleAddSection} className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" /> إضافة قسم جديد
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {curriculum.map((section, sIndex) => (
                        <div key={sIndex} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="font-bold text-gray-500">القسم {sIndex + 1}:</span>
                                <Input
                                    value={section.title}
                                    onChange={(e) => handleSectionTitleChange(sIndex, e.target.value)}
                                    className="flex-1 font-bold text-lg"
                                    placeholder="عنوان القسم"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleRemoveSection(sIndex)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Lectures List */}
                            <div className="space-y-4 pr-4 border-r-2 border-gray-200 mr-2">
                                {section.lectures.map((lecture, lIndex) => (
                                    <div key={lIndex} className="bg-white p-4 rounded border shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-semibold text-sm text-gray-600">
                                                    محاضرة {lIndex + 1}
                                                </h4>
                                                {lecture.isFree && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                        <Eye size={12} /> مجانية
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemoveLecture(sIndex, lIndex)}
                                            >
                                                <Trash2 className="h-4 w-4" /> حذف
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">عنوان المحاضرة</label>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                    <Input
                                                        value={lecture.title}
                                                        onChange={(e) =>
                                                            handleLectureChange(sIndex, lIndex, "title", e.target.value)
                                                        }
                                                        placeholder="مثال: مقدمة في React"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">رابط فيديو خارجي (YouTube, Vimeo)</label>
                                                <div className="flex items-center gap-2">
                                                    <LinkIcon className="h-4 w-4 text-blue-400" />
                                                    <Input
                                                        value={lecture.videoUrl || ""}
                                                        onChange={(e) =>
                                                            handleLectureChange(sIndex, lIndex, "videoUrl", e.target.value)
                                                        }
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">أو رابط فيديو مرفوع</label>
                                                <div className="flex items-center gap-2">
                                                    <Upload className="h-4 w-4 text-gray-400" />
                                                    <Input
                                                        value={lecture.video || ""}
                                                        onChange={(e) =>
                                                            handleLectureChange(sIndex, lIndex, "video", e.target.value)
                                                        }
                                                        placeholder="رابط الفيديو المباشر (مرفوع على الخادم)"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">المدة (دقائق)</label>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <Input
                                                        type="number"
                                                        value={lecture.duration}
                                                        onChange={(e) =>
                                                            handleLectureChange(
                                                                sIndex,
                                                                lIndex,
                                                                "duration",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        min={0}
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="text-xs text-gray-500 mb-1 block">الوصف</label>
                                                <Textarea
                                                    value={lecture.description}
                                                    onChange={(e) =>
                                                        handleLectureChange(sIndex, lIndex, "description", e.target.value)
                                                    }
                                                    placeholder="وصف مختصر لمحتوى المحاضرة..."
                                                    rows={2}
                                                />
                                            </div>

                                            {/* Free Preview Toggle */}
                                            <div className="md:col-span-2 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4 text-blue-600" />
                                                    <Label htmlFor={`free-${sIndex}-${lIndex}`} className="text-sm font-medium text-blue-800">
                                                        محاضرة مجانية للمعاينة
                                                    </Label>
                                                </div>
                                                <Switch
                                                    id={`free-${sIndex}-${lIndex}`}
                                                    checked={lecture.isFree || false}
                                                    onCheckedChange={(checked) =>
                                                        handleLectureChange(sIndex, lIndex, "isFree", checked)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddLecture(sIndex)}
                                    className="w-full border-dashed"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> إضافة محاضرة
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};
