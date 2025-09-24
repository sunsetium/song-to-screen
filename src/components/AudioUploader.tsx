import React, { useCallback, useState, useRef } from "react";
import { Upload, Music, X, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LyricsGenerator } from "@/services/lyricsGenerator";

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onLyricsGenerated?: (lyrics: any[]) => void;
  isGeneratingLyrics?: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onFileSelect,
  selectedFile,
  onLyricsGenerated,
  isGeneratingLyrics = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [lyricsGenerator] = useState(() => new LyricsGenerator());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (file.type.startsWith("audio/")) {
        onFileSelect(file);
        
        // Auto-generate lyrics
        if (onLyricsGenerated) {
          try {
            toast.info("Generating lyrics from audio...");
            const lyrics = await lyricsGenerator.generateLyrics(file, true);
            onLyricsGenerated(lyrics);
            toast.success("Lyrics generated successfully!");
          } catch (error) {
            console.error("Failed to generate lyrics:", error);
            toast.error("Failed to generate lyrics. You can add them manually.");
          }
        }
      } else {
        toast.error("Please select a valid audio file");
      }
    },
    [onFileSelect, onLyricsGenerated, lyricsGenerator]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemoveFile = useCallback(() => {
    onFileSelect(null as any);
  }, [onFileSelect]);

  return (
    <Card className={`p-8 border-dashed border-2 transition-all duration-200 ${
      isDragOver ? 'border-primary bg-primary/5' : 'border-primary/30 bg-card/50'
    } backdrop-blur-sm`}>
      <div
        className="flex flex-col items-center justify-center space-y-4 min-h-[200px]"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {selectedFile ? (
          <div className="text-center space-y-4 w-full">
            <div className="p-4 rounded-full bg-primary/20 mx-auto w-fit relative">
              <Music className="w-8 h-8 text-primary" />
              {isGeneratingLyrics && (
                <Wand2 className="w-4 h-4 text-primary animate-spin absolute -top-1 -right-1" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                {isGeneratingLyrics && " • Generating lyrics..."}
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isGeneratingLyrics}
              >
                Change File
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isGeneratingLyrics}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/20">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Upload Audio File</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop an MP3 file or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Lyrics will be automatically generated from your audio
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
              disabled={isGeneratingLyrics}
            >
              {isGeneratingLyrics ? (
                <>
                  <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Lyrics...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </>
              )}
            </Button>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </Card>
  );
};