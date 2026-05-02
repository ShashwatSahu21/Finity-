import { readFile } from 'fs/promises';
import { join } from 'path';
import dotenv from "dotenv";
dotenv.config();

async function readAudioFile(fileName) {
  try {
    const audioData = await readFile(join(process.cwd(), fileName));
    return audioData.toString('base64');
  } catch (error) {
    console.error(`Error reading audio file ${fileName}:`, error);
    throw error;
  }
}

async function readJsonFile(fileName) {
  try {
    const data = await readFile(join(process.cwd(), fileName), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON file ${fileName}:`, error);
    throw error;
  }
}

async function sendDefaultMessages({ userMessage }) {
  let messages;
  if (!userMessage) {
    messages = [
      {
        text: "Hey there... How was your day?",
        audio: await readAudioFile('audios/intro_0.wav'),
        lipsync: await readJsonFile('audios/intro_0.json'),
        facialExpression: "smile",
        animation: "TalkingOne",
      },
      {
        text: "I'm Jack, your personal AI assistant. I'm here to help you with anything you need.",
        audio: await readAudioFile('audios/intro_1.wav'),
        lipsync: await readJsonFile('audios/intro_1.json'),
        facialExpression: "smile",
        animation: "TalkingTwo",
      },
    ];
    return messages;
  }
  return null;
}

const defaultResponse = {
  messages: [{
    text: "I apologize, but I'm having trouble understanding. Could you please rephrase that?",
    facialExpression: "sad",
    animation: "SadIdle"
  }]
};

export { sendDefaultMessages, defaultResponse };
