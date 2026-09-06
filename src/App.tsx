import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AtmosphereProvider, useAtmosphere } from "./context/AtmosphereContext";
import { GamificationProvider } from "./context/GamificationContext";
import { Header } from "./components/common/Header";
import { Sidebar } from "./components/common/Sidebar";
import { VaultDashboard } from "./components/dashboard/VaultDashboard";
import { JournalChat } from "./components/journal/JournalChat";
import { VoiceJournalView } from "./components/journal/VoiceJournalView";
import { FocusMode } from "./components/journal/FocusMode";
import { CognivaultInsights } from "./components/insights/CognivaultInsights";
import { ReflectionJourneyView } from "./components/gamification/ReflectionJourneyView";
import { AtmosphereStudio } from "./components/atmosphere/AtmosphereStudio";
import { JournalHistory } from "./components/history/JournalHistory";
import { SettingsSecurityView } from "./components/security/SettingsSecurityView";
import { AuthModal } from "./components/auth/AuthModal";
import { SecurityModal } from "./components/security/SecurityModal";
import { XpFloatingReward } from "./components/gamification/XpFloatingReward";
import { Conversation, ViewTab } from "./types";

function MainLayout() {
  const { user } = useAuth();
  const { currentMood } = useAtmosphere();
  const [currentTab, setCurrentTab] = useState<ViewTab>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newJournalKey, setNewJournalKey] = useState(0);

  const startNewReflection = () => {
    setSelectedConversation(null);
    setNewJournalKey((key) => key + 1);
    setCurrentTab("new-journal");
  };

  const handleOpenConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setCurrentTab("new-journal");
  };

  const handleStartReflectionWithPrompt = (promptText: string) => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: "Reflection Session",
      mood: currentMood,
      topics: ["Reflection"],
      keyInsights: [],
      actionItems: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: `msg_prompt_${Date.now()}`,
          role: "model",
          content: promptText,
          timestamp: Date.now(),
        },
      ],
    };
    setSelectedConversation(newConv);
    setCurrentTab("new-journal");
  };

  const handleStartChatWithTranscript = (transcriptText: string) => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: "Voice Reflection Session",
      mood: currentMood,
      topics: ["Voice Journal"],
      keyInsights: [],
      actionItems: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      autoReflectText: transcriptText,
    };
    setSelectedConversation(newConv);
    setCurrentTab("new-journal");
  };

  return (
    <div className="cv-app-shell min-h-screen bg-[#F7F6F1] text-[#3B2A24] flex flex-col font-sans selection:bg-[#C8A96A]/30 selection:text-[#0F3D34] relative overflow-x-hidden">
      {/* Ambient Morning Sunlight Glow Orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#C8A96A]/8 rounded-full blur-[120px] pointer-events-none z-0 animate-sun-glow" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[550px] h-[550px] bg-[#0F3D34]/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Global XP & Badge Floating Reward Toasts */}
      <XpFloatingReward />

      <div className="cv-app-body flex-1 flex w-full relative z-10">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === "new-journal") {
              startNewReflection();
              return;
            }
            setCurrentTab(tab);
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <div className="cv-main-area flex min-w-0 flex-1 flex-col">
          <Header
            onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isMobileSidebarOpen={isMobileSidebarOpen}
          />

          {/* Main Content Viewport */}
          <main className="cv-main-scroll flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {currentTab === "dashboard" && (
            <VaultDashboard
              onNavigate={(tab) => {
                if (tab === "new-journal") {
                  startNewReflection();
                  return;
                }
                setCurrentTab(tab);
              }}
              onOpenConversation={handleOpenConversation}
              onStartReflectionWithPrompt={handleStartReflectionWithPrompt}
            />
          )}

          {currentTab === "new-journal" && (
            <JournalChat
              draftKey={newJournalKey}
              initialConversation={selectedConversation}
              onSaved={() => {
                // Return to history or keep view
              }}
            />
          )}

          {currentTab === "history" && (
            <JournalHistory
              onSelectConversation={handleOpenConversation}
              onNewReflection={() => {
                startNewReflection();
              }}
            />
          )}

          {currentTab === "journey" && (
            <ReflectionJourneyView
              onStartReflectionWithPrompt={handleStartReflectionWithPrompt}
            />
          )}

          {currentTab === "insights" && <CognivaultInsights />}

          {currentTab === "atmosphere" && <AtmosphereStudio />}

          {currentTab === "voice-journal" && (
            <VoiceJournalView
              onStartChatWithTranscript={handleStartChatWithTranscript}
              onSaved={() => setCurrentTab("history")}
            />
          )}

          {currentTab === "focus-mode" && (
            <FocusMode onExit={() => setCurrentTab("dashboard")} />
          )}

            {currentTab === "security" && <SettingsSecurityView />}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <AuthModal />
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AtmosphereProvider>
        <GamificationProvider>
          <MainLayout />
        </GamificationProvider>
      </AtmosphereProvider>
    </AuthProvider>
  );
}
