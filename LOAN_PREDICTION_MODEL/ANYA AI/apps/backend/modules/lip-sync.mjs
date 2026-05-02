import { exec } from "child_process";
import { join } from "path";
import { promisify } from "util";
import { readFile } from "fs/promises";
import { textToSpeech } from "./sarvamAI.mjs";

const execAsync = promisify(exec);

async function lipSync({ messages, languageCode = 'en' }) {
  try {
    const processedMessages = [];
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const audioFileName = `output_${Date.now()}_${i}.wav`;
      const jsonFileName = `output_${Date.now()}_${i}.json`;
      
      // Generate audio using Sarvam AI with language support
      const audioPath = await textToSpeech({
        text: message.text,
        fileName: audioFileName,
        languageCode
      });

      // Run Rhubarb Lip Sync
      const rhubarbPath = process.platform === 'win32' ? 'bin\\rhubarb.exe' : 'bin/rhubarb';
      await execAsync(`${rhubarbPath} -f json "${audioPath}" -o "${join(process.cwd(), 'tmp', jsonFileName)}"`);

      // Read the lip sync data
      const lipSyncData = JSON.parse(
        await readFile(join(process.cwd(), 'tmp', jsonFileName), 'utf8')
      );

      // Convert audio to base64
      const audioData = await readFile(audioPath);
      const audioBase64 = audioData.toString('base64');

      processedMessages.push({
        ...message,
        audio: audioBase64,
        lipsync: lipSyncData
      });
    }

    return processedMessages;
  } catch (error) {
    console.error('Error in lip sync processing:', error);
    throw error;
  }
}

export { lipSync };
