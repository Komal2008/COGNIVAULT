import React, { createContext, useContext, useEffect, useState } from "react";
import { MoodMeta, MoodType } from "../types";
import { atmosphereEngine, MOODS_CONFIG } from "../lib/audioAtmosphere";
import { useAuth } from "./AuthContext";

interface AtmosphereContextType {
  currentMood: MoodType;
  moodConfig: MoodMeta;
  setMood: (mood: MoodType) => void;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  togglePlay: () => void;
  playMood: (mood?: MoodType) => void;
  pauseAudio: () => void;
  stopAudio: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  getFrequencyData: (arr: Uint8Array) => void;
}

const AtmosphereContext = createContext<AtmosphereContextType | undefined>(undefined);

export const AtmosphereProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateUserMood } = useAuth();
  const [currentMood, setCurrentMoodState] = useState<MoodType>("reflective");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.4);

  // Sync initial mood from user profile if available
  useEffect(() => {
    if (userProfile?.currentMood) {
      setCurrentMoodState(userProfile.currentMood);
    }
  }, [userProfile?.currentMood]);

  const setMood = (mood: MoodType) => {
    setCurrentMoodState(mood);
    updateUserMood(mood);
    if (isPlaying) {
      atmosphereEngine.play(mood);
    }
  };

  const playMood = (mood?: MoodType) => {
    const target = mood || currentMood;
    atmosphereEngine.play(target);
    setIsPlaying(true);
    if (mood && mood !== currentMood) {
      setCurrentMoodState(mood);
      updateUserMood(mood);
    }
  };

  const pauseAudio = () => {
    atmosphereEngine.pause();
    setIsPlaying(false);
  };

  const stopAudio = () => {
    atmosphereEngine.stop();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playMood();
    }
  };

  const setVolume = (vol: number) => {
    atmosphereEngine.setVolume(vol);
    setVolumeState(vol);
  };

  const toggleMute = () => {
    const muted = atmosphereEngine.toggleMute();
    setIsMuted(muted);
  };

  const getFrequencyData = (arr: Uint8Array) => {
    atmosphereEngine.getFrequencyData(arr);
  };

  const moodConfig = MOODS_CONFIG[currentMood] || MOODS_CONFIG.reflective;

  return (
    <AtmosphereContext.Provider
      value={{
        currentMood,
        moodConfig,
        setMood,
        isPlaying,
        isMuted,
        volume,
        togglePlay,
        playMood,
        pauseAudio,
        stopAudio,
        setVolume,
        toggleMute,
        getFrequencyData,
      }}
    >
      {children}
    </AtmosphereContext.Provider>
  );
};

export const useAtmosphere = () => {
  const context = useContext(AtmosphereContext);
  if (!context) {
    throw new Error("useAtmosphere must be used within an AtmosphereProvider");
  }
  return context;
};
