import { exec } from "child_process";
import { promises as fs } from "fs";

const execCommand = ({ command }) => {
  return new Promise((resolve, reject) => {
    // Add -v quiet to suppress FFmpeg output
    const modifiedCommand = command.includes('ffmpeg') 
      ? command.replace('ffmpeg', 'ffmpeg -v quiet') 
      : command;
    
    exec(modifiedCommand, (error, stdout, stderr) => {
      if (error) {
        // Only log essential error information
        console.error('Command failed:', error.message);
        reject(new Error(`Command failed: ${error.message}`));
        return;
      }
      resolve(stdout);
    });
  });
};

const readJsonTranscript = async ({ fileName }) => {
  const data = await fs.readFile(fileName, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async ({ fileName }) => {
  const data = await fs.readFile(fileName);
  return data.toString("base64");
};

export { execCommand, readJsonTranscript, audioFileToBase64 };
