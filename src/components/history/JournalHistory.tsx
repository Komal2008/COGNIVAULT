import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  Lightbulb,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Coffee,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Conversation, MoodType } from "../../types";
import { MOODS_CONFIG } from "../../lib/audioAtmosphere";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";

interface JournalHistoryProps {
  onSelectConversation: (conv: Conversation) => void;
  onNewReflection: () => void;
}

export const JournalHistory: React.FC<JournalHistoryProps> = ({
  onSelectConversation,
  onNewReflection,
}) => {
  const { user, openAuthModal } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>("all");
  const [selectedDetailConv, setSelectedDetailConv] = useState<Conversation | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setFilteredConversations([]);
      return;
    }

    setLoading(true);
    const convsRef = collection(db, "users", user.uid, "conversations");
    const q = query(convsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Conversation[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Conversation));
        setConversations(list);
        setFilteredConversations(list);
        setLoading(false);
      },
      (error) => {
        console.error("History load error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Apply filters
  useEffect(() => {
    let result = conversations;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.summary?.toLowerCase().includes(q) ||
          (c.topics || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedMoodFilter !== "all") {
      result = result.filter((c) => c.mood === selectedMoodFilter);
    }

    setFilteredConversations(result);
  }, [searchQuery, selectedMoodFilter, conversations]);

  const loadConversationDetails = async (conversation: Conversation) => {
    if (!user) {
      openAuthModal();
      return null;
    }

    const messagesRef = collection(
      db,
      "users",
      user.uid,
      "conversations",
      conversation.id,
      "messages",
    );
    const messages = (await getDocs(messagesRef)).docs
      .map((messageDoc) => messageDoc.data())
      .sort((left, right) => {
        const leftTime = typeof left.timestamp === "number" ? left.timestamp : 0;
        const rightTime = typeof right.timestamp === "number" ? right.timestamp : 0;
        return leftTime - rightTime;
      });
    return {
      ...conversation,
      messages,
    } as Conversation;
  };

  const loadConversation = async (conversation: Conversation) => {
    // Navigate immediately with the selected metadata. JournalChat then hydrates
    // the complete message subcollection before displaying the saved session.
    onSelectConversation(conversation);
  };

  // Handle Deletion
  const handleDeleteEntry = async (convId: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid, "conversations", convId);
      await deleteDoc(docRef);
      setDeleteConfirmId(null);
      if (selectedDetailConv?.id === convId) {
        setSelectedDetailConv(null);
      }
      setActionSuccessMsg("Reflection permanently deleted from your private vault.");
      setTimeout(() => setActionSuccessMsg(""), 3500);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/conversations/${convId}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D6C3]/40 border border-[#6B4938]/15 text-[#6B4938] text-xs font-semibold mb-2">
            <BookOpen size={13} className="text-[#E8B84A]" />
            <span>ENCRYPTED ARCHIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3B2922] tracking-tight">
            Private Journal History
          </h1>
          <p className="text-xs sm:text-sm text-[#6B4938] mt-1 font-normal leading-relaxed">
            Your archive of reflections, summaries, topics, and personal realizations.
          </p>
        </div>

        <button
          onClick={onNewReflection}
          className="px-5 py-2.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-center border border-[#E8B84A]/30"
        >
          New Reflection
        </button>
      </div>

      {/* Success Banner */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-[#A8B29A]/20 border border-[#A8B29A]/40 text-[#3B2922] text-xs flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] flex flex-col md:flex-row items-center gap-3.5 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-4 top-3 text-[#6B4938]/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, topics, or keywords..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] text-[#3B2922] placeholder-[#6B4938]/50 text-xs focus:outline-none focus:border-[#6B4938]"
          />
        </div>

        {/* Mood Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedMoodFilter("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-colors shrink-0 cursor-pointer ${
              selectedMoodFilter === "all"
                ? "bg-[#6B4938] text-[#FFFCF7] shadow-xs"
                : "bg-[#FFF8EE] text-[#6B4938] hover:text-[#3B2922] border border-[#E8D6C3]"
            }`}
          >
            All Moods
          </button>

          {(Object.keys(MOODS_CONFIG) as MoodType[]).map((mKey) => {
            const config = MOODS_CONFIG[mKey];
            const isActive = selectedMoodFilter === mKey;
            return (
              <button
                key={mKey}
                onClick={() => setSelectedMoodFilter(mKey)}
                className={`px-3 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#6B4938] text-[#FFFCF7] shadow-xs"
                    : "bg-[#FFF8EE] border border-[#E8D6C3] text-[#6B4938] hover:text-[#3B2922]"
                }`}
              >
                <span>{config.emoji}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* History Grid or Empty State */}
      {!user ? (
        <div className="p-12 text-center bg-[#FFFCF7] border border-dashed border-[#E8D6C3] rounded-3xl space-y-3 shadow-sm">
          <p className="text-[#3B2922] text-sm font-bold font-serif">Authentication Required</p>
          <p className="text-[#6B4938] text-xs max-w-sm mx-auto leading-relaxed">
            Your private journal entries are encrypted and isolated strictly under your authenticated
            account. Please sign in to view your archive.
          </p>
          <button
            onClick={openAuthModal}
            className="px-6 py-2.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] text-xs font-semibold shadow-xs cursor-pointer border border-[#E8B84A]/30"
          >
            Sign In to Unlock History
          </button>
        </div>
      ) : filteredConversations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredConversations.map((conv) => {
            const moodItem = MOODS_CONFIG[conv.mood] || MOODS_CONFIG.reflective;
            return (
              <div
                key={conv.id}
                className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] hover:border-[#6B4938] transition-all flex flex-col justify-between space-y-4 shadow-sm group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#6B4938]">
                    <span className="flex items-center gap-1.5 font-bold font-serif text-[#3B2922]">
                      <span>{moodItem.emoji}</span>
                      <span>{moodItem.label}</span>
                    </span>
                    <span className="font-mono text-[11px] text-[#6B4938]/80">
                      {conv.createdAt?.toDate
                        ? conv.createdAt.toDate().toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent"}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#3B2922] group-hover:text-[#6B4938] transition-colors line-clamp-1">
                    {conv.title || "Untitled Reflection"}
                  </h3>

                  {conv.summary && (
                    <p className="text-xs text-[#6B4938] line-clamp-3 leading-relaxed font-serif italic">
                      "{conv.summary}"
                    </p>
                  )}

                  {conv.topics && conv.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {conv.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-[#FFF8EE] border border-[#E8D6C3] text-[10px] text-[#6B4938] font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3.5 border-t border-[#E8D6C3] flex items-center justify-between">
                  <button
                    onClick={async () => {
                      try {
                        const hydratedConversation = await loadConversationDetails(conv);
                        if (hydratedConversation) setSelectedDetailConv(hydratedConversation);
                      } catch (error) {
                        console.error("Conversation inspection error:", error);
                        setActionSuccessMsg("Unable to load that conversation right now.");
                      }
                    }}
                    className="text-xs text-[#6B4938] hover:text-[#3B2922] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowRight size={13} className="text-[#E8B84A]" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadConversation(conv)}
                      className="text-xs text-[#3B2922] hover:text-[#6B4938] font-semibold px-3 py-1 rounded-xl bg-[#FFF8EE] hover:bg-[#E8D6C3]/40 border border-[#E8D6C3] transition-colors cursor-pointer"
                    >
                      Continue
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(conv.id)}
                      className="p-1.5 rounded-lg text-[#6B4938]/60 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#FFFCF7] border border-dashed border-[#E8D6C3] rounded-3xl space-y-2 shadow-sm">
          <p className="text-[#3B2922] text-sm font-serif font-bold">No reflections found</p>
          <p className="text-[#6B4938] text-xs">
            {searchQuery || selectedMoodFilter !== "all"
              ? "No reflections match your current search or mood filters."
              : "Your private journal archive is empty. Begin your first reflection session."}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] text-[#3B2922] space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle size={20} />
              <h3 className="text-base font-serif font-bold text-[#3B2922]">Permanently Delete Entry?</h3>
            </div>
            <p className="text-xs text-[#6B4938] leading-relaxed">
              This action cannot be undone. All conversation messages, summaries, and associated
              insights will be erased from your private vault.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#6B4938] hover:text-[#3B2922] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEntry(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Inspection Modal */}
      {selectedDetailConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 rounded-3xl bg-[#FFFCF7] border border-[#E8D6C3] text-[#3B2922] space-y-5 shadow-2xl">
            <button
              onClick={() => setSelectedDetailConv(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-[#6B4938] hover:text-[#3B2922] hover:bg-[#E8D6C3]/40 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#6B4938]">
                Journal Entry Inspection
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#3B2922] mt-1">
                {selectedDetailConv.title || "Untitled Reflection"}
              </h2>
              <div className="flex items-center gap-3 text-xs text-[#6B4938] mt-1 font-mono">
                <span>Mood: {selectedDetailConv.mood}</span>
                <span>•</span>
                <span>
                  {selectedDetailConv.createdAt?.toDate
                    ? selectedDetailConv.createdAt.toDate().toLocaleString()
                    : "Archived"}
                </span>
              </div>
            </div>

            {selectedDetailConv.summary && (
              <div className="p-5 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-1.5">
                <span className="text-xs font-serif font-bold text-[#3B2922] flex items-center gap-1.5">
                  <FileText size={15} className="text-[#6B4938]" />
                  Structured Summary
                </span>
                <p className="text-xs sm:text-sm text-[#6B4938] leading-relaxed font-serif italic">
                  "{selectedDetailConv.summary}"
                </p>
              </div>
            )}

            {selectedDetailConv.messages && selectedDetailConv.messages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-serif font-bold text-[#3B2922] flex items-center gap-1.5">
                  <FileText size={15} className="text-[#6B4938]" />
                  Conversation
                </span>
                <div className="space-y-2.5">
                  {selectedDetailConv.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        message.role === "user"
                          ? "bg-[#6B4938] border-[#6B4938] text-[#FFFCF7] ml-6"
                          : "bg-[#FFF8EE] border-[#E8D6C3] text-[#3B2922] mr-6"
                      }`}
                    >
                      <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-1">
                        {message.role === "user" ? "You" : "Cognivault Companion"}
                      </span>
                      {message.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDetailConv.keyInsights && selectedDetailConv.keyInsights.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-serif font-bold text-[#3B2922] flex items-center gap-1.5">
                  <Lightbulb size={15} className="text-[#E8B84A]" />
                  Key Realizations
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#6B4938]">
                  {selectedDetailConv.keyInsights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDetailConv.actionItems && selectedDetailConv.actionItems.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-serif font-bold text-[#3B2922] flex items-center gap-1.5">
                  <ListTodo size={15} className="text-[#6B4938]" />
                  Growth Actions
                </span>
                <div className="space-y-1.5">
                  {selectedDetailConv.actionItems.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] text-xs text-[#3B2922] flex items-center gap-2"
                    >
                      <CheckCircle2
                        size={15}
                        className={act.completed ? "text-[#A8B29A]" : "text-[#6B4938]/40"}
                      />
                      <span className={act.completed ? "line-through text-[#6B4938]/50" : ""}>
                        {act.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E8D6C3]">
              <button
                onClick={() => {
                  const conv = selectedDetailConv;
                  setSelectedDetailConv(null);
                  loadConversation(conv);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFFCF7] text-xs font-semibold shadow-xs cursor-pointer border border-[#E8B84A]/30"
              >
                Open in Active Reflection Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
