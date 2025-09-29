import { pipeline } from "@huggingface/transformers";
import { LyricLine, LyricWord } from "@/types/lyrics";

export class LyricsGenerator {
  private transcriber: any = null;
  private isLoading = false;

  async initialize() {
    if (this.transcriber || this.isLoading) return;
    
    this.isLoading = true;
    try {
      console.log("Initializing Whisper model...");
      
      // Add timeout to prevent hanging
      const initPromise = pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-base.en",
        { 
          device: "wasm", // Use WASM as it's more stable than WebGPU
          dtype: "fp32"
        }
      );
      
      // Set a timeout to prevent indefinite hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Model initialization timeout")), 60000); // 60 second timeout
      });
      
      this.transcriber = await Promise.race([initPromise, timeoutPromise]);
      console.log("Whisper model initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Whisper model:", error);
      this.isLoading = false;
      throw new Error(`Failed to initialize speech recognition: ${error.message}`);
    }
    this.isLoading = false;
  }

  async generateLyrics(audioFile: File, wordLevel: boolean = true): Promise<LyricLine[]> {
    console.log("Starting lyrics generation for:", audioFile.name);
    
    try {
      await this.initialize();
      console.log("Model initialized, starting transcription...");
      
      const audioUrl = URL.createObjectURL(audioFile);
      
      console.log("Transcribing audio with settings:", {
        return_timestamps: wordLevel ? "word" : "segment",
        chunk_length_s: 10,
      });
      
      // Add timeout for transcription to prevent hanging
      const transcriptionPromise = this.transcriber(audioUrl, {
        return_timestamps: wordLevel ? "word" : "segment",
        chunk_length_s: 10,
        force_full_sequences: false,
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Transcription timeout - audio processing took too long")), 120000); // 2 minute timeout
      });
      
      const result = await Promise.race([transcriptionPromise, timeoutPromise]);
      console.log("Transcription result:", result);
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
      
      const filteredLyrics = lyrics.filter(lyric => lyric.text.length > 0);
      console.log(`Successfully generated ${filteredLyrics.length} lyric lines`);
      return filteredLyrics;
    } catch (error) {
      console.error("Error generating lyrics:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to generate lyrics from audio";
      if (error.message && error.message.includes("cross attentions")) {
        errorMessage = "The AI model doesn't support word-level timestamps. Please try again or use manual lyrics input.";
      } else if (error.message && error.message.includes("WebGPU")) {
        errorMessage = "Graphics acceleration failed. Please try again - the system will use CPU processing.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage = "Network error while loading the AI model. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = `Speech recognition error: ${error.message}`;
      }
      
      throw new Error(errorMessage);
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