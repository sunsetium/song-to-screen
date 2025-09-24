import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LyricLine } from "@/types/lyrics";
import { exportLyricsAsLRC, exportLyricsAsJSON } from "@/services/lyricsGenerator";
import { Download, FileText, Database } from "lucide-react";
import { toast } from "sonner";

interface MetadataExportProps {
  lyrics: LyricLine[];
  audioFileName: string;
}

export const MetadataExport: React.FC<MetadataExportProps> = ({
  lyrics,
  audioFileName,
}) => {
  const handleLRCExport = () => {
    if (lyrics.length === 0) {
      toast.error("No lyrics to export");
      return;
    }

    const lrcContent = exportLyricsAsLRC(lyrics);
    const blob = new Blob([lrcContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `${audioFileName.replace('.mp3', '')}.lrc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("LRC file exported successfully!");
  };

  const handleJSONExport = () => {
    if (lyrics.length === 0) {
      toast.error("No lyrics to export");
      return;
    }

    const jsonContent = exportLyricsAsJSON(lyrics);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `${audioFileName.replace('.mp3', '')}-lyrics.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("JSON file exported successfully!");
  };

  if (lyrics.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Export Metadata</h3>
      </div>
      
      <p className="text-muted-foreground mb-4">
        Export timing data for use in other karaoke applications
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          onClick={handleLRCExport}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Export LRC
        </Button>
        
        <Button
          onClick={handleJSONExport}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </Button>
      </div>
    </Card>
  );
};