import React, { useState, useEffect } from 'react';
import { ChatHistory as ChatHistoryType, getChatSessions, deleteChatSession } from '../services/databaseService';
import { TrashIcon } from './Icon';
import { History, X } from 'lucide-react';

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSession: (session: ChatHistoryType) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ isOpen, onClose, onLoadSession }) => {
  const [sessions, setSessions] = useState<ChatHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getChatSessions();
      setSessions(data);
    } catch (err) {
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat session?')) {
      const success = await deleteChatSession(sessionId);
      if (success) {
        setSessions(sessions.filter((s) => s.id !== sessionId));
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
              <History size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Chat History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <p className="mt-4 text-gray-400">Loading history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No chat history yet. Start a new conversation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    onLoadSession(session);
                    onClose();
                  }}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">
                        {session.product_name || 'Nutrition Analysis'}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {session.messages?.length || 0} messages
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(session.updated_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

