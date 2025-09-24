import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExportModal } from "./ExportModal";
import { LyricLine } from "@/types/lyrics";
import { Download, Video, Palette } from "lucide-react";

interface ExportSectionProps {
  audioFile: File;
  lyrics: LyricLine[];
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  audioFile,
  lyrics,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <>
      <Card className="p-8 border border-dashed border-primary/30 bg-card/30">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Video className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-semibold text-foreground">Export Your Karaoke Video</h3>
          </div>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create a professional karaoke video with custom backgrounds, text styling, and synchronized lyrics
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-4 bg-background/50 rounded-lg">
              <Download className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium mb-1">MP4 Export</h4>
              <p className="text-sm text-muted-foreground text-center">
                High-quality video output in standard MP4 format
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-background/50 rounded-lg">
              <Palette className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium mb-1">Custom Styling</h4>
              <p className="text-sm text-muted-foreground text-center">
                Customize colors, fonts, and background images
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-background/50 rounded-lg">
              <Video className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium mb-1">HD Quality</h4>
              <p className="text-sm text-muted-foreground text-center">
                Choose between 720p and 1080p resolutions
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsExportModalOpen(true)}
            className="px-8 py-3 text-lg"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Video
          </Button>
        </div>
      </Card>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        audioFile={audioFile}
        lyrics={lyrics}
      />
    </>
  );
};