import fs from "fs";
import path from "path";
import { execCommand } from "./files.mjs";

async function convertAudioToMp3({ audioData }) {
  const dir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created tmp directory:', dir);
  }

  // Save the input audio
  const inputPath = path.join(dir, "input.webm");
  fs.writeFileSync(inputPath, Buffer.from(audioData));
  console.log('Saved input audio file:', inputPath);

  const outputPath = path.join(dir, "output.mp3");
  
  try {
    // Use a simpler FFmpeg command with error logging
    const command = `ffmpeg -hide_banner -loglevel error -y -i "${inputPath}" "${outputPath}" 2>&1`;
    console.log('Running FFmpeg command:', command);
    
    const result = await execCommand({ command });
    console.log('FFmpeg output:', result);
    console.log('Audio conversion completed');

    if (!fs.existsSync(outputPath)) {
      throw new Error('FFmpeg conversion failed - output file not found');
    }

    const stats = fs.statSync(outputPath);
    if (stats.size === 0) {
      throw new Error('FFmpeg conversion failed - output file is empty');
    }
    console.log('Output file size:', stats.size, 'bytes');

    const mp3AudioData = fs.readFileSync(outputPath);
    return mp3AudioData;
  } catch (error) {
    console.error('Error in audio conversion:', error);
    throw new Error(`Audio conversion failed: ${error.message}`);
  } finally {
    // Clean up temp files
    try {
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
        console.log('Cleaned up input file');
      }
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
        console.log('Cleaned up output file');
      }
    } catch (err) {
      console.error('Error cleaning up temp files:', err);
    }
  }
}

export { convertAudioToMp3 };