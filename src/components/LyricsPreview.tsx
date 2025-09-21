import React from "react";
import { Card } from "@/components/ui/card";
import { LyricLine } from "./LyricsEditor";

interface LyricsPreviewProps {
  lyrics: LyricLine[];
  currentTime: number;
  audioFile: File | null;
}

export const LyricsPreview: React.FC<LyricsPreviewProps> = ({
  lyrics,
  currentTime,
  audioFile,
}) => {
  const sortedLyrics = [...lyrics].sort((a, b) => a.startTime - b.startTime);
  
  const getCurrentLyric = () => {
    return sortedLyrics.find(
      (line) => currentTime >= line.startTime && currentTime <= line.endTime
    );
  };

  const getUpcomingLyrics = () => {
    const currentIndex = sortedLyrics.findIndex(
      (line) => currentTime >= line.startTime && currentTime <= line.endTime
    );
    
    if (currentIndex === -1) {
      // No current lyric, find the next one
      const nextIndex = sortedLyrics.findIndex(
        (line) => line.startTime > currentTime
      );
      return nextIndex !== -1 ? sortedLyrics.slice(nextIndex, nextIndex + 3) : [];
    }
    
    // Return next 2-3 lyrics
    return sortedLyrics.slice(currentIndex + 1, currentIndex + 4);
  };

  const getPreviousLyrics = () => {
    const currentIndex = sortedLyrics.findIndex(
      (line) => currentTime >= line.startTime && currentTime <= line.endTime
    );
    
    if (currentIndex === -1) {
      // No current lyric, find the previous ones
      let prevIndex = -1;
      for (let i = sortedLyrics.length - 1; i >= 0; i--) {
        if (sortedLyrics[i].endTime < currentTime) {
          prevIndex = i;
          break;
        }
      }
      return prevIndex !== -1 ? sortedLyrics.slice(Math.max(0, prevIndex - 2), prevIndex + 1) : [];
    }
    
    // Return previous 2-3 lyrics
    return sortedLyrics.slice(Math.max(0, currentIndex - 3), currentIndex);
  };

  const currentLyric = getCurrentLyric();
  const upcomingLyrics = getUpcomingLyrics();
  const previousLyrics = getPreviousLyrics();

  if (!audioFile) {
    return (
      <Card className="p-8 bg-timeline-bg border-border/30">
        <div className="text-center text-muted-foreground">
          <h3 className="text-xl font-semibold mb-2">Karaoke Preview</h3>
          <p>Upload an audio file to start creating your karaoke video</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-timeline-bg border-border/30 min-h-[400px] flex flex-col justify-center">
      <div className="text-center space-y-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-8">KARAOKE PREVIEW</h3>
        
        {/* Previous lyrics - faded */}
        <div className="space-y-2 min-h-[60px] flex flex-col justify-end">
          {previousLyrics.slice(-2).map((line) => (
            <div
              key={line.id}
              className="text-lg text-muted-foreground/60 opacity-60 transition-all duration-300"
            >
              {line.text}
            </div>
          ))}
        </div>

        {/* Current lyric - highlighted */}
        <div className="min-h-[80px] flex items-center justify-center">
          {currentLyric ? (
            <div className="text-4xl font-bold text-center lyric-text music-gradient bg-clip-text text-transparent animate-pulse">
              {currentLyric.text}
            </div>
          ) : (
            <div className="text-2xl text-muted-foreground/40">
              {lyrics.length === 0 ? "Add some lyrics to get started!" : "♪"}
            </div>
          )}
        </div>

        {/* Upcoming lyrics - preview */}
        <div className="space-y-2 min-h-[60px] flex flex-col justify-start">
          {upcomingLyrics.slice(0, 2).map((line) => (
            <div
              key={line.id}
              className="text-lg text-muted-foreground/80 transition-all duration-300"
            >
              {line.text}
            </div>
          ))}
        </div>
      </div>
      
      {lyrics.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {sortedLyrics.length} lyric lines • {currentTime.toFixed(1)}s
        </div>
      )}
    </Card>
  );
};