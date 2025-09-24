import React, { useState, useCallback } from "react";
import { AudioUploader } from "@/components/AudioUploader";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LyricsEditor, LyricLine } from "@/components/LyricsEditor";
import { LyricsPreview } from "@/components/LyricsPreview";
import { ExportSection } from "@/components/ExportSection";
import { MetadataExport } from "@/components/MetadataExport";
import { toast } from "sonner";

const Index = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setAudioFile(file);
    setCurrentTime(0);
    toast.success(`Loaded: ${file.name}`);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    // Mark auto-play as used once playback starts
    if (time > 0 && !hasAutoPlayed) {
      setHasAutoPlayed(true);
    }
  }, [hasAutoPlayed]);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleLyricsChange = useCallback((newLyrics: LyricLine[]) => {
    setLyrics(newLyrics);
  }, []);

  const handleLyricsGenerated = useCallback((generatedLyrics: LyricLine[]) => {
    setLyrics(generatedLyrics);
    setIsGeneratingLyrics(false);
    // Enable auto-play once lyrics are ready
    setTimeout(() => {
      setHasAutoPlayed(false);
    }, 500);
  }, []);

  const handleFileSelectWithLyrics = useCallback((file: File) => {
    setAudioFile(file);
    setCurrentTime(0);
    setIsGeneratingLyrics(true);
    toast.success(`Loaded: ${file.name}`);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold music-gradient bg-clip-text text-transparent mb-4">
            Karaoke Video Creator
          </h1>
          <p className="text-xl text-muted-foreground">
            Transform your MP3 files into synchronized karaoke videos
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Upload & Controls */}
          <div className="space-y-6">
            {!audioFile ? (
              <AudioUploader
                onFileSelect={handleFileSelectWithLyrics}
                selectedFile={audioFile}
                onLyricsGenerated={handleLyricsGenerated}
                isGeneratingLyrics={isGeneratingLyrics}
              />
            ) : (
              <div className="space-y-6">
                <AudioUploader
                  onFileSelect={handleFileSelectWithLyrics}
                  selectedFile={audioFile}
                  onLyricsGenerated={handleLyricsGenerated}
                  isGeneratingLyrics={isGeneratingLyrics}
                />
                <AudioPlayer
                  audioFile={audioFile}
                  currentTime={currentTime}
                  onTimeUpdate={handleTimeUpdate}
                  onSeek={handleSeek}
                  autoPlay={lyrics.length > 0 && !hasAutoPlayed && !isGeneratingLyrics}
                />
              </div>
            )}

            {audioFile && (
              <LyricsEditor
                lyrics={lyrics}
                onLyricsChange={handleLyricsChange}
                currentTime={currentTime}
              />
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <LyricsPreview
              lyrics={lyrics}
              currentTime={currentTime}
              audioFile={audioFile}
            />
          </div>
        </div>

        {/* Export Section */}
        {audioFile && lyrics.length > 0 && (
          <div className="space-y-8">
            <MetadataExport
              lyrics={lyrics}
              audioFileName={audioFile.name}
            />
            <ExportSection
              audioFile={audioFile}
              lyrics={lyrics}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;