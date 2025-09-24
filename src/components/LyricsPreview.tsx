import React from "react";
import { Card } from "@/components/ui/card";
import { LyricLine } from "@/components/LyricsEditor";
import { Music } from "lucide-react";

interface LyricsPreviewProps {
  lyrics: LyricLine[];
  currentTime: number;
  audioFile: File | null;
  karaokeMode?: boolean;
}

export const LyricsPreview: React.FC<LyricsPreviewProps> = ({
  lyrics,
  currentTime,
  audioFile,
  karaokeMode = true,
}) => {
  const activeLyrics = lyrics.filter(lyric => 
    currentTime >= lyric.startTime && currentTime <= lyric.endTime
  );

  // Show current line and next 2-3 lines
  const currentLineIndex = lyrics.findIndex(lyric => 
    currentTime >= lyric.startTime && currentTime <= lyric.endTime
  );
  
  const visibleLines = lyrics.slice(
    Math.max(0, currentLineIndex), 
    currentLineIndex + 3
  );

  const renderWordByWord = (lyric: LyricLine) => {
    if (!karaokeMode || !lyric.words) {
      return <span>{lyric.text}</span>;
    }

    return (
      <span>
        {lyric.words.map((word, index) => {
          const isWordActive = currentTime >= word.startTime && currentTime <= word.endTime;
          return (
            <span
              key={index}
              className={`transition-all duration-200 ${
                isWordActive 
                  ? "text-primary-glow font-bold scale-105" 
                  : "text-inherit"
              }`}
              style={{
                display: 'inline-block',
                marginRight: '0.25rem'
              }}
            >
              {word.word}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 min-h-[400px]">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Music className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-semibold text-foreground">
            {karaokeMode ? "Karaoke Preview" : "Lyrics Preview"}
          </h3>
        </div>
        
        {audioFile ? (
          <p className="text-muted-foreground">
            Now playing: <span className="font-medium text-foreground">{audioFile.name}</span>
          </p>
        ) : (
          <p className="text-muted-foreground">Upload an MP3 to see lyrics preview</p>
        )}
      </div>

      <div className="space-y-6 min-h-[200px] flex flex-col justify-center">
        {lyrics.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">
              {audioFile ? "Generating lyrics..." : "Upload an audio file to get started"}
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            {visibleLines.map((lyric) => {
              const isActive = activeLyrics.some(active => active.id === lyric.id);
              return (
                <div
                  key={lyric.id}
                  className={`text-xl font-medium transition-all duration-300 px-4 py-2 rounded-lg ${
                    isActive
                      ? "text-primary scale-110 bg-primary/10 shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {renderWordByWord(lyric)}
                </div>
              );
            })}
            
            {visibleLines.length === 0 && (
              <div className="text-muted-foreground text-lg py-8">
                ♪ Music playing ♪
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};