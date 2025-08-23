/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type FormEvent } from "react";
import { collection, query, orderBy, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { useAuth } from "../features/auth/useAuth";
import { db } from "../services/firebaseConfig";
import ButtonMotion from "./ButtonMotion";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  createdAt: Timestamp;
}

interface MessageBoxProps {
  flatId: string;
  ownerId: string;
}

export default function MessageBox({ flatId, ownerId }: MessageBoxProps) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "Conversations", flatId, "Messages"),
          orderBy("createdAt", "asc")
        );
        const snapshot = await getDocs(q);
        const list: Message[] = [];
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data() as any;
          // Filter: non-owner sees only own messages, owner sees all
          if (
            currentUser &&
            (currentUser.uid === ownerId || data.senderId === currentUser.uid)
          ) {
            list.push({
              id: docSnap.id,
              content: data.content,
              senderId: data.senderId,
              senderName: data.senderName,
              senderEmail: data.senderEmail,
              createdAt: data.createdAt,
            });
          }
        }
        setMessages(list);
      } catch (e: any) {
        console.error("Error loading messages:", e);
        setError("Impossible de charger les messages.");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [flatId, ownerId, currentUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Vous devez être connecté pour envoyer un message.");
      return;
    }
    if (!newMessage.trim()) return;

    try {
      setError(null);
      await addDoc(collection(db, "Conversations", flatId, "Messages"), {
        content: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || "Anonymous",
        senderEmail: currentUser.email,
        createdAt: Timestamp.now(),
      });
      setNewMessage("");
      // Refresh messages
      const q = query(
        collection(db, "Conversations", flatId, "Messages"),
        orderBy("createdAt", "asc")
      );
      const snapshot = await getDocs(q);
      const list: Message[] = [];
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data() as any;
        if (
          currentUser &&
          (currentUser.uid === ownerId || data.senderId === currentUser.uid)
        ) {
          list.push({
            id: docSnap.id,
            content: data.content,
            senderId: data.senderId,
            senderName: data.senderName,
            senderEmail: data.senderEmail,
            createdAt: data.createdAt,
          });
        }
      });
      setMessages(list);
    } catch (e: any) {
      console.error("Error sending message:", e);
      setError("Échec de l'envoi du message.");
    }
  };

  if (loading) return <p>Loading messages...</p>;

  return (
    <div className="border p-4 rounded-lg bg-gray-50 mt-6">
      <h3 className="text-lg font-medium mb-4">Messages</h3>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
        {messages.map(msg => (
          <div key={msg.id} className="p-2 bg-white rounded shadow-sm">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{msg.senderName}</span> ({msg.senderEmail}) •{' '}
              {msg.createdAt.toDate().toLocaleString()}
            </div>
            <p className="mt-1 text-gray-800 whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-gray-600">No messages for the moment.</p>
        )}
      </div>

      {/* Only non-owner can send */}
      {currentUser && currentUser.uid !== ownerId && (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            rows={3}
            placeholder="Votre message..."
            className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <ButtonMotion
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 hover:opacity-90 mt-2"
            disabled={!newMessage.trim()}
          >
            Send
          </ButtonMotion>
        </form>
      )}
    </div>
  );
}
