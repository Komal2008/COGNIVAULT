// /src/components/rituals/TomorrowNoteCard.tsx
// Creates continuity across days: "A Note for Tomorrow"
// Shows yesterday's note for you upon arrival, with warm Cocoa Sunrise styling.

import React, { useState, useEffect } from "react";
import { Mail, Sparkles, Check, ChevronRight } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { TomorrowNote } from "../../types";

export const TomorrowNoteCard: React.FC = () => {
  const { user } = useAuth();
  const [latestNote, setLatestNote] = useState<TomorrowNote | null>(null);

  useEffect(() => {
    if (!user) {
      setLatestNote({
        id: "demo_note",
        note: "Remember what you realized today: progress doesn't require certainty.",
        createdAt: new Date(),
        targetDate: new Date().toISOString().split("T")[0],
        read: false,
      });
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "tomorrow_notes"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const d = docSnap.data();
        setLatestNote({
          id: docSnap.id,
          note: d.note || "",
          createdAt: d.createdAt?.toDate?.() || new Date(),
          targetDate: d.targetDate || "",
          read: !!d.read,
          sourceJournalId: d.sourceJournalId,
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (!latestNote) return null;

  return (
    <div className="bg-[#FFF8EE] border border-[#E8B84A]/50 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3 relative overflow-hidden">
      <div className="flex items-center gap-2">
        <span className="text-lg">💌</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#E8B84A] font-bold">
          CONTINUITY • A NOTE FOR TODAY
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-[#FFFCF7] border border-[#E8D6C3] shadow-2xs">
        <p className="text-sm sm:text-base font-serif italic text-[#3B2922] leading-relaxed">
          "{latestNote.note}"
        </p>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#6B4938] font-serif">
        <span>Penned during your previous reflection session</span>
        <span className="text-[10px] font-mono text-[#8C7A6B]">
          {new Date(latestNote.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
