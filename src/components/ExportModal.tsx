import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { VideoExporter, ExportSettings } from "@/services/videoExporter";
import { LyricLine } from "./LyricsEditor";
import { toast } from "sonner";
import { Download, Palette, Type, Monitor } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioFile: File;
  lyrics: LyricLine[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  audioFile,
  lyrics,
}) => {
  const [settings, setSettings] = useState<ExportSettings>({
    backgroundColor: "#000000",
    textColor: "#ffffff",
    fontSize: 48,
    fontFamily: "Arial",
    textShadow: true,
    resolution: "1080p",
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      toast.info("Starting video export...");
      
      const exporter = new VideoExporter();
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90));
      }, 1000);
      
      const exportSettingsWithImage = {
        ...settings,
        backgroundImage: backgroundImage ? URL.createObjectURL(backgroundImage) : undefined,
      };
      
      const videoBlob = await exporter.exportVideo(audioFile, lyrics, exportSettingsWithImage);
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      // Download the video
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `karaoke-${audioFile.name.replace('.mp3', '')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Video exported successfully!");
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export video. Please try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Karaoke Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Background Settings */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4" />
              <h3 className="font-semibold">Background</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <Input
                  id="backgroundColor"
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) =>
                    setSettings({ ...settings, backgroundColor: e.target.value })
                  }
                  className="w-full h-12"
                />
              </div>
              
              <div>
                <Label htmlFor="backgroundImage">Background Image (Optional)</Label>
                <Input
                  id="backgroundImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBackgroundImage(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Text Settings */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-4 h-4" />
              <h3 className="font-semibold">Text Style</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <Input
                  id="textColor"
                  type="color"
                  value={settings.textColor}
                  onChange={(e) =>
                    setSettings({ ...settings, textColor: e.target.value })
                  }
                  className="w-full h-12"
                />
              </div>
              
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min="24"
                  max="96"
                  value={settings.fontSize}
                  onChange={(e) =>
                    setSettings({ ...settings, fontSize: parseInt(e.target.value) })
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value) =>
                    setSettings({ ...settings, fontFamily: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times">Times New Roman</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="textShadow"
                  checked={settings.textShadow}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, textShadow: checked })
                  }
                />
                <Label htmlFor="textShadow">Text Shadow</Label>
              </div>
            </div>
          </Card>

          {/* Video Settings */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4" />
              <h3 className="font-semibold">Video Quality</h3>
            </div>
            <div>
              <Label>Resolution</Label>
              <Select
                value={settings.resolution}
                onValueChange={(value: "720p" | "1080p") =>
                  setSettings({ ...settings, resolution: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p (1280x720)</SelectItem>
                  <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Exporting video...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || lyrics.length === 0}
              className="flex-1"
            >
              {isExporting ? "Exporting..." : "Export Video"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};