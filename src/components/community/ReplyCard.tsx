import { User } from "lucide-react";
import { Reply } from "@/types/community";

interface ReplyCardProps {
    reply: Reply;
}

const ReplyCard = ({ reply }: ReplyCardProps) => {
    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <User size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900">{reply.author?.name || "مستخدم"}</p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-500">
                            {new Date(reply.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                </div>
            </div>
        </div>
    );
};

export default ReplyCard;
