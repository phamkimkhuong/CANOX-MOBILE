import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandMMKVStorage } from './storage';

interface VideoState {
    isMuted: boolean;
    setIsMuted: (isMuted: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;
}

export const useVideoStore = create<VideoState>()(
    persist(
        (set) => ({
            isMuted: false,
            volume: 1.0,
            setIsMuted: (isMuted) => set({ isMuted }),
            setVolume: (volume) => set({ volume }),
        }),
        {
            name: 'video-settings',
            storage: createJSONStorage(() => zustandMMKVStorage as any),
        }
    )
);
