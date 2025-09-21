import React, { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  audioFile: File | null;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onSeek: (time: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioFile,
  currentTime,
  onTimeUpdate,
  onSeek,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioFile]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      onTimeUpdate(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback(
    (value: number[]) => {
      const newTime = value[0];
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = newTime;
        onSeek(newTime);
      }
    },
    [onSeek]
  );

  const skipBackward = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.max(0, audio.currentTime - 10);
      audio.currentTime = newTime;
      onSeek(newTime);
    }
  }, [onSeek]);

  const skipForward = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.min(duration, audio.currentTime + 10);
      audio.currentTime = newTime;
      onSeek(newTime);
    }
  }, [duration, onSeek]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!audioFile) return null;

  return (
    <Card className="p-6 bg-player-bg shadow-player">
      <audio ref={audioRef} src={audioUrl || undefined} />
      
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={skipBackward}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={togglePlay}
            className="w-12 h-12 music-gradient shadow-glow"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={skipForward}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};