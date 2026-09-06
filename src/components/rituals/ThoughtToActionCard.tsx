// /src/components/rituals/ThoughtToActionCard.tsx
// Connects introspection with practical momentum:
// Displays saved action steps, allows checking off (+20 XP each), and generating new actions from recent reflections.

import React, { useState, useEffect } from "react";
import { CheckSquare, Square, Target, Sparkles, Plus, Trash2, ArrowRight } from "lucide-react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useGamification } from "../../context/GamificationContext";
import { ThoughtToActionItem } from "../../types";

export const ThoughtToActionCard: React.FC = () => {
  const { user } = useAuth();
  const { recordActionCompleted } = useGamification();
  const [actions, setActions] = useState<ThoughtToActionItem[]>([]);
  const [newActionText, setNewActionText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!user) {
      // Guest demo action
      setActions([
        {
          id: "demo_action_1",
          observation: "You noticed needing more quiet space during morning work.",
          actionStep: "Spend 20 minutes with zero notifications on your next project block.",
          completed: false,
          createdAt: new Date(),
        },
      ]);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "actions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: ThoughtToActionItem[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          observation: d.observation || "",
          actionStep: d.actionStep || "",
          completed: !!d.completed,
          completedAt: d.completedAt?.toDate?.() || undefined,
          createdAt: d.createdAt?.toDate?.() || new Date(),
          sourceJournalId: d.sourceJournalId,
        });
      });
      setActions(items);
    });

    return () => unsubscribe();
  }, [user]);

  const handleToggleComplete = async (action: ThoughtToActionItem) => {
    const updatedStatus = !action.completed;

    if (!user) {
      setActions((prev) =>
        prev.map((a) => (a.id === action.id ? { ...a, completed: updatedStatus } : a))
      );
      if (updatedStatus) {
        await recordActionCompleted();
      }
      return;
    }

    const docRef = doc(db, "users", user.uid, "actions", action.id);
    await updateDoc(docRef, {
      completed: updatedStatus,
      completedAt: updatedStatus ? serverTimestamp() : null,
    });

    if (updatedStatus) {
      await recordActionCompleted();
    }
  };

  const handleAddManualAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;

    if (!user) {
      setActions((prev) => [
        {
          id: `demo_${Date.now()}`,
          observation: "Grounded intentional focus.",
          actionStep: newActionText.trim(),
          completed: false,
          createdAt: new Date(),
        },
        ...prev,
      ]);
      setNewActionText("");
      setIsAdding(false);
      return;
    }

    const colRef = collection(db, "users", user.uid, "actions");
    await addDoc(colRef, {
      observation: "Personal intention anchored from reflection.",
      actionStep: newActionText.trim(),
      completed: false,
      createdAt: serverTimestamp(),
    });

    setNewActionText("");
    setIsAdding(false);
  };

  const handleDeleteAction = async (id: string) => {
    if (!user) {
      setActions((prev) => prev.filter((a) => a.id !== id));
      return;
    }
    await deleteDoc(doc(db, "users", user.uid, "actions", id)).catch(() => {});
  };

  return (
    <div className="bg-[#FFFCF7] border border-[#E8D6C3] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-[#E8D6C3] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <div>
            <h3 className="text-lg font-serif font-bold text-[#3B2922]">
              Thought → Action
            </h3>
            <p className="text-xs text-[#6B4938] font-serif italic">
              Small, achievable steps anchored in your daily reflections.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 rounded-xl bg-[#FFF8EE] border border-[#E8D6C3] hover:border-[#E8B84A] text-xs font-serif font-bold text-[#6B4938] hover:text-[#3B2922] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus size={14} />
          <span>Add Step</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddManualAction} className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#E8D6C3] space-y-3 animate-in fade-in">
          <input
            type="text"
            value={newActionText}
            onChange={(e) => setNewActionText(e.target.value)}
            placeholder="e.g. Spend 15 minutes drafting the first section..."
            className="w-full p-3 rounded-xl bg-[#FFFCF7] border border-[#E8D6C3] text-xs text-[#3B2922] focus:outline-hidden focus:border-[#E8B84A]"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-serif text-[#6B4938] hover:bg-[#F5EBE1] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newActionText.trim()}
              className="px-4 py-1.5 rounded-xl bg-[#6B4938] hover:bg-[#3B2922] text-[#FFF8EE] font-serif font-bold text-xs cursor-pointer disabled:opacity-50"
            >
              Save Action
            </button>
          </div>
        </form>
      )}

      {/* Actions List */}
      <div className="space-y-3">
        {actions.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#6B4938] font-serif italic">
            No action steps yet. In your next journal conversation, click "Extract Action" or add a step above.
          </div>
        ) : (
          actions.map((action) => (
            <div
              key={action.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                action.completed
                  ? "bg-[#F5EBE1]/50 border-[#E8D6C3] opacity-75"
                  : "bg-[#FFF8EE] border-[#E8D6C3] hover:border-[#E8B84A]/60 shadow-2xs"
              }`}
            >
              <button
                onClick={() => handleToggleComplete(action)}
                className="mt-0.5 text-[#6B4938] hover:text-[#3B2922] cursor-pointer shrink-0 transition-colors"
                title={action.completed ? "Mark incomplete" : "Complete action (+20 XP)"}
              >
                {action.completed ? (
                  <CheckSquare size={19} className="text-[#A8B29A]" />
                ) : (
                  <Square size={19} className="text-[#6B4938]" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                {action.observation && (
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C7A6B] block">
                    Context: {action.observation}
                  </span>
                )}
                <p
                  className={`text-xs sm:text-sm font-serif mt-0.5 ${
                    action.completed
                      ? "line-through text-[#8C7A6B]"
                      : "text-[#3B2922] font-medium"
                  }`}
                >
                  {action.actionStep}
                </p>
              </div>

              <button
                onClick={() => handleDeleteAction(action.id)}
                className="text-[#8C7A6B] hover:text-red-600 opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 transition-opacity cursor-pointer"
                title="Remove action"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
