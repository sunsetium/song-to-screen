import React, { useCallback } from "react";
import { Upload, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onFileSelect,
  selectedFile,
}) => {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith("audio/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file && file.type.startsWith("audio/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Card className="p-8 border-dashed border-2 border-primary/30 bg-card/50 backdrop-blur-sm">
      <div
        className="flex flex-col items-center justify-center space-y-4 min-h-[200px]"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {selectedFile ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/20">
              <Music className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <label htmlFor="audio-file">
              <Button variant="outline" className="cursor-pointer">
                Change File
              </Button>
            </label>
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
            </div>
            <label htmlFor="audio-file">
              <Button className="cursor-pointer music-gradient">
                Choose File
              </Button>
            </label>
          </div>
        )}
        
        <input
          id="audio-file"
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </Card>
  );
};