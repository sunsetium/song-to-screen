import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { LyricLine } from "@/components/LyricsEditor";

export interface ExportSettings {
  backgroundColor: string;
  backgroundImage?: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  textShadow: boolean;
  resolution: "720p" | "1080p";
}

export class VideoExporter {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  async initialize() {
    if (this.ffmpeg && this.isLoaded) return;

    this.ffmpeg = new FFmpeg();
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    this.isLoaded = true;
  }

  async exportVideo(
    audioFile: File,
    lyrics: LyricLine[],
    settings: ExportSettings
  ): Promise<Blob> {
    await this.initialize();
    if (!this.ffmpeg) throw new Error("FFmpeg not initialized");

    // Write audio file to FFmpeg filesystem
    await this.ffmpeg.writeFile("input.mp3", await fetchFile(audioFile));

    // Generate lyrics overlay filter
    const overlayFilter = this.generateLyricsFilter(lyrics, settings);
    
    // Set video dimensions
    const dimensions = settings.resolution === "1080p" ? "1920:1080" : "1280:720";
    
    // Build FFmpeg command
    const command = [
      "-i", "input.mp3",
      "-f", "lavfi",
      "-i", `color=${settings.backgroundColor}:size=${dimensions}:duration=300`,
      "-filter_complex", overlayFilter,
      "-c:v", "libx264",
      "-c:a", "aac",
      "-pix_fmt", "yuv420p",
      "-shortest",
      "output.mp4"
    ];

    await this.ffmpeg.exec(command);
    
    const data = await this.ffmpeg.readFile("output.mp4");
    return new Blob([data], { type: "video/mp4" });
  }

  private generateLyricsFilter(lyrics: LyricLine[], settings: ExportSettings): string {
    const sortedLyrics = [...lyrics].sort((a, b) => a.startTime - b.startTime);
    
    let filter = "[1:v]";
    
    sortedLyrics.forEach((lyric, index) => {
      const escapedText = lyric.text.replace(/[:']/g, '\\$&');
      const textFilter = `drawtext=fontfile=/System/Library/Fonts/Arial.ttf:text='${escapedText}':fontsize=${settings.fontSize}:fontcolor=${settings.textColor}:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,${lyric.startTime},${lyric.endTime})'${settings.textShadow ? ':shadowcolor=black:shadowx=2:shadowy=2' : ''}`;
      
      if (index === 0) {
        filter += `[${textFilter}][v${index}];`;
      } else {
        filter += `[v${index-1}][${textFilter}][v${index}];`;
      }
    });
    
    return filter + `[v${sortedLyrics.length - 1}]`;
  }
}