import dotenv from "dotenv";
import { z } from "zod";
import fetch from 'node-fetch';

dotenv.config();

const messageSchema = z.object({
  messages: z.array(
    z.object({
      text: z.string(),
      facialExpression: z.enum(['smile', 'sad', 'angry', 'surprised', 'funnyFace', 'default']),
      animation: z.enum([
        'Idle', 'TalkingOne', 'TalkingThree', 'SadIdle', 'Defeated', 
        'Angry', 'Surprised', 'DismissingGesture', 'ThoughtfulHeadShake'
      ])
    })
  )
});

const systemPrompt = `You are Amol, a knowledgeable and engaging AI assistant. You must respond in this exact JSON format:

{
  "messages": [
    {
      "text": "Your response here. Keep it concise and clear, focusing on the most important points.",
      "facialExpression": "smile",
      "animation": "TalkingOne"
    }
  ]
}

Guidelines for responses:
1. Keep responses focused and concise
2. Use simple, clear language without special formatting
3. For lists or steps, use simple numbering (1. 2. 3.) and separate with periods
4. Avoid using symbols, markdown, or special characters
5. Use appropriate facial expressions:
   smile: for positive content
   sad: for challenges or difficulties
   surprised: for interesting facts
   angry: for warnings
   default: for neutral information
6. Match animations with content:
   TalkingOne: general explanations
   TalkingThree: enthusiastic content
   Idle: transitions
   SadIdle: challenges
   Defeated: difficulties
   Surprised: interesting facts
   Angry: warnings
   DismissingGesture: corrections
   ThoughtfulHeadShake: complex topics`;

function cleanTextForSpeech(text) {
  return text
    .replace(/\\n/g, '. ')
    .replace(/\n/g, '. ')
    .replace(/\*\*/g, '')
    .replace(/\([^)]+\)/g, '')
    .replace(/e\.g\.,?/g, 'for example')
    .replace(/i\.e\.,?/g, 'that is')
    .replace(/:\s+/g, '. ')
    .replace(/\s*-\s*/g, '. ')
    .replace(/\s+/g, ' ')
    .replace(/\.+/g, '.')
    .replace(/\.\s+/g, '. ')
    .replace(/\s+\./g, '.')
    .replace(/^\.|\.$/g, '')
    .replace(/\s+/g, ' ')
    .trim() + '.';
}

async function generateResponse(userMessage) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: `Give a clear and concise response to: ${userMessage}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 400,
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return {
          messages: [{
            text: "I'm receiving too many requests. Please wait a moment.",
            facialExpression: "sad",
            animation: "Defeated"
          }]
        };
      }
      return {
        messages: [{
          text: "I encountered an error. Please try again.",
          facialExpression: "sad",
          animation: "SadIdle"
        }]
      };
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      return {
        messages: [{
          text: "I received an invalid response. Please try again.",
          facialExpression: "sad",
          animation: "Defeated"
        }]
      };
    }

    const content = data.choices[0].message.content.trim();
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          messages: [{
            text: cleanTextForSpeech(content),
            facialExpression: "default",
            animation: "TalkingOne"
          }]
        };
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);

      if (!parsedResponse.messages || !Array.isArray(parsedResponse.messages)) {
        return {
          messages: [{
            text: cleanTextForSpeech(content),
            facialExpression: "default",
            animation: "TalkingOne"
          }]
        };
      }

      parsedResponse.messages = parsedResponse.messages.map(msg => ({
        text: cleanTextForSpeech(msg.text || "I'm not sure what to say."),
        facialExpression: ['smile', 'sad', 'angry', 'surprised', 'funnyFace', 'default'].includes(msg.facialExpression) 
          ? msg.facialExpression 
          : 'default',
        animation: ['Idle', 'TalkingOne', 'TalkingThree', 'SadIdle', 'Defeated', 'Angry', 'Surprised', 'DismissingGesture', 'ThoughtfulHeadShake'].includes(msg.animation)
          ? msg.animation
          : 'TalkingOne'
      }));

      return parsedResponse;
    } catch (error) {
      return {
        messages: [{
          text: cleanTextForSpeech(content),
          facialExpression: "default",
          animation: "TalkingOne"
        }]
      };
    }
  } catch (error) {
    return {
      messages: [{
        text: "I'm having trouble connecting. Please try again.",
        facialExpression: "sad",
        animation: "Defeated"
      }]
    };
  }
}

export { generateResponse }; 