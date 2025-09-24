import { pipeline } from "@huggingface/transformers";
import { LyricLine, LyricWord } from "@/components/LyricsEditor";

export type { LyricLine, LyricWord };

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

  async generateLyrics(audioFile: File, wordLevel: boolean = true): Promise<LyricLine[]> {
    await this.initialize();
    
    const audioUrl = URL.createObjectURL(audioFile);
    
    try {
      const result = await this.transcriber(audioUrl, {
        return_timestamps: wordLevel ? "word" : "segment",
        chunk_length_s: 10,
      });
      
      URL.revokeObjectURL(audioUrl);
      
      // Process the result to create LyricLine objects
      const lyrics: LyricLine[] = [];
      
      if (result.chunks && Array.isArray(result.chunks)) {
        // Group words into lines for better readability
        let currentLine = "";
        let currentWords: LyricWord[] = [];
        let lineStartTime = 0;
        let lineIndex = 0;

        result.chunks.forEach((chunk: any, index: number) => {
          if (chunk.text && chunk.timestamp) {
            const word = chunk.text.trim();
            const wordStartTime = chunk.timestamp[0] || 0;
            const wordEndTime = chunk.timestamp[1] || wordStartTime + 0.5;

            if (wordLevel) {
              currentWords.push({
                word,
                startTime: wordStartTime,
                endTime: wordEndTime
              });
            }

            // Start new line every 8-12 words or at punctuation
            if (currentLine === "") {
              lineStartTime = wordStartTime;
            }
            
            currentLine += (currentLine ? " " : "") + word;
            
            const shouldEndLine = 
              currentWords.length >= 8 || 
              word.match(/[.!?]/) || 
              (index === result.chunks.length - 1);

            if (shouldEndLine && currentLine.trim()) {
              lyrics.push({
                id: `auto-${lineIndex}`,
                text: currentLine.trim(),
                startTime: lineStartTime,
                endTime: wordEndTime,
                words: wordLevel ? [...currentWords] : undefined,
              });
              
              currentLine = "";
              currentWords = [];
              lineIndex++;
            }
          }
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
          
          const lineWords: LyricWord[] = wordLevel ? 
            chunkWords.map((word, wordIndex) => ({
              word,
              startTime: currentTime + (wordIndex * duration / chunkWords.length),
              endTime: currentTime + ((wordIndex + 1) * duration / chunkWords.length)
            })) : undefined;
          
          lyrics.push({
            id: `auto-${i / chunkSize}`,
            text: chunkWords.join(" "),
            startTime: currentTime,
            endTime: currentTime + duration,
            words: lineWords,
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

export function exportLyricsAsLRC(lyrics: LyricLine[]): string {
  let lrc = "";
  lrc += "[ar:Karaoke Creator]\n";
  lrc += "[ti:Generated Lyrics]\n";
  lrc += "[al:Auto-Generated]\n";
  lrc += "[by:Karaoke Creator]\n\n";
  
  lyrics.forEach(line => {
    const minutes = Math.floor(line.startTime / 60);
    const seconds = (line.startTime % 60).toFixed(2);
    const timestamp = `[${minutes.toString().padStart(2, '0')}:${seconds.padStart(5, '0')}]`;
    lrc += `${timestamp}${line.text}\n`;
  });
  
  return lrc;
}

export function exportLyricsAsJSON(lyrics: LyricLine[]): string {
  const exportData = {
    version: "1.0",
    metadata: {
      title: "Generated Lyrics",
      artist: "Unknown",
      generator: "Karaoke Creator",
      createdAt: new Date().toISOString()
    },
    lyrics: lyrics.map(line => ({
      id: line.id,
      text: line.text,
      startTime: line.startTime,
      endTime: line.endTime,
      words: line.words || []
    }))
  };
  
  return JSON.stringify(exportData, null, 2);
}