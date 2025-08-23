import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

export default function ConversationListPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const res = await axiosInstance.get("/chat/my");
        setConversations(res.data?.data || []);
      } catch {
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };
    fetchConvos();
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl font-semibold mb-4">My Conversations</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : conversations.length === 0 ? (
        <p className="text-gray-400">No conversations yet.</p>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => {
            const other = c.participants.find((p) => p._id !== user._id);
            return (
              <Card
                key={c._id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/chat/${c._id}`)}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <Avatar>
                    <AvatarImage src={other?.profilePicture} />
                    <AvatarFallback>{other?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{other?.name || "Unknown"}</p>
                    <p className="text-sm text-gray-500">
                      {c.lastMessage?.content
                        ? c.lastMessage.content.slice(0, 30)
                        : "No messages yet"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
