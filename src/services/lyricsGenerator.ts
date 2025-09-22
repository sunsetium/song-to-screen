import { pipeline } from "@huggingface/transformers";
import { LyricLine } from "@/components/LyricsEditor";

export class LyricsGenerator {
  private transcriber: any = null;
  private isLoading = false;

  async initialize() {
    if (this.transcriber || this.isLoading) return;
    
    this.isLoading = true;
    try {
      this.transcriber = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en",
        { device: "webgpu" }
      );
    } catch (error) {
      // Fallback to CPU if WebGPU fails
      this.transcriber = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en"
      );
    }
    this.isLoading = false;
  }

  async generateLyrics(audioFile: File): Promise<LyricLine[]> {
    await this.initialize();
    
    const audioUrl = URL.createObjectURL(audioFile);
    
    try {
      const result = await this.transcriber(audioUrl, {
        return_timestamps: true,
        chunk_length_s: 10,
      });
      
      URL.revokeObjectURL(audioUrl);
      
      // Process the result to create LyricLine objects
      const lyrics: LyricLine[] = [];
      
      if (result.chunks && Array.isArray(result.chunks)) {
        result.chunks.forEach((chunk: any, index: number) => {
          lyrics.push({
            id: `auto-${index}`,
            text: chunk.text.trim(),
            startTime: chunk.timestamp[0] || 0,
            endTime: chunk.timestamp[1] || (chunk.timestamp[0] + 3),
          });
        });
      } else {
        // Fallback: split text into estimated chunks
        const text = result.text || "";
        const words = text.split(" ");
        const estimatedDuration = 120; // Assume 2-minute song
        const wordsPerSecond = words.length / estimatedDuration;
        
        let currentTime = 0;
        const chunkSize = Math.max(5, Math.floor(wordsPerSecond * 3)); // 3-second chunks
        
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunkWords = words.slice(i, i + chunkSize);
          const duration = chunkWords.length / wordsPerSecond;
          
          lyrics.push({
            id: `auto-${i / chunkSize}`,
            text: chunkWords.join(" "),
            startTime: currentTime,
            endTime: currentTime + duration,
          });
          
          currentTime += duration;
        }
      }
      
      return lyrics.filter(lyric => lyric.text.length > 0);
    } catch (error) {
      console.error("Error generating lyrics:", error);
      throw new Error("Failed to generate lyrics from audio");
    }
  }
}