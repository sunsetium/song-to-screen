import React, { useState, useCallback } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface LyricWord {
  word: string;
  startTime: number;
  endTime: number;
}

export interface LyricLine {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  words?: LyricWord[];
}

interface LyricsEditorProps {
  lyrics: LyricLine[];
  onLyricsChange: (lyrics: LyricLine[]) => void;
  currentTime: number;
}

export const LyricsEditor: React.FC<LyricsEditorProps> = ({
  lyrics,
  onLyricsChange,
  currentTime,
}) => {
  const [newLineText, setNewLineText] = useState("");

  const addLyricLine = useCallback(() => {
    if (!newLineText.trim()) return;

    const newLine: LyricLine = {
      id: Date.now().toString(),
      text: newLineText.trim(),
      startTime: currentTime,
      endTime: currentTime + 3, // Default 3 second duration
    };

    onLyricsChange([...lyrics, newLine]);
    setNewLineText("");
  }, [newLineText, currentTime, lyrics, onLyricsChange]);

  const updateLyricLine = useCallback(
    (id: string, updates: Partial<LyricLine>) => {
      const updatedLyrics = lyrics.map((line) =>
        line.id === id ? { ...line, ...updates } : line
      );
      onLyricsChange(updatedLyrics);
    },
    [lyrics, onLyricsChange]
  );

  const deleteLyricLine = useCallback(
    (id: string) => {
      const filteredLyrics = lyrics.filter((line) => line.id !== id);
      onLyricsChange(filteredLyrics);
    },
    [lyrics, onLyricsChange]
  );

  const setCurrentTimeAsStart = useCallback(
    (id: string) => {
      updateLyricLine(id, { startTime: currentTime });
    },
    [currentTime, updateLyricLine]
  );

  const setCurrentTimeAsEnd = useCallback(
    (id: string) => {
      updateLyricLine(id, { endTime: currentTime });
    },
    [currentTime, updateLyricLine]
  );

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const sortedLyrics = [...lyrics].sort((a, b) => a.startTime - b.startTime);

  return (
    <Card className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Lyrics Editor</h3>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter lyric line..."
              value={newLineText}
              onChange={(e) => setNewLineText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addLyricLine();
                }
              }}
              className="flex-1"
            />
            <Button 
              onClick={addLyricLine} 
              disabled={!newLineText.trim()}
              className="music-gradient"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Current time: {formatTime(currentTime)}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedLyrics.map((line) => {
          const isActive =
            currentTime >= line.startTime && currentTime <= line.endTime;
          
          return (
            <div
              key={line.id}
              className={`p-4 border rounded-lg space-y-3 transition-all ${
                isActive
                  ? "border-lyric-highlight bg-primary/10 shadow-glow"
                  : "border-border bg-card/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <Input
                  value={line.text}
                  onChange={(e) =>
                    updateLyricLine(line.id, { text: e.target.value })
                  }
                  className="text-base font-medium"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteLyricLine(line.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Start Time</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={line.startTime.toFixed(1)}
                      onChange={(e) =>
                        updateLyricLine(line.id, {
                          startTime: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentTimeAsStart(line.id)}
                      className="text-xs"
                    >
                      <Clock className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">End Time</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={line.endTime.toFixed(1)}
                      onChange={(e) =>
                        updateLyricLine(line.id, {
                          endTime: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentTimeAsEnd(line.id)}
                      className="text-xs"
                    >
                      <Clock className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {lyrics.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No lyrics added yet. Start by typing a line above!
          </div>
        )}
      </div>
    </Card>
  );
};