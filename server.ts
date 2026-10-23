import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

app.use(express.json({ limit: '10mb' }));

// Server-side Google GenAI initialization with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Universal Gemma Spatial Intelligence Router
 * Seamlessly routes between:
 * 1. Google AI Studio Free Tier (gemini-3.8-flash / gemini-3.1-flash-lite)
 * 2. Local Open-Weights Gemma 2 (Ollama / vLLM - gemma2:9b / gemma2:2b)
 * With automatic resilience and zero downtime fallback.
 */
async function executeGemmaPrompt({
  prompt,
  systemInstruction,
  responseMimeType = 'application/json',
  provider = 'cloud-free',
  model = 'gemma2:9b',
}: {
  prompt: string;
  systemInstruction: string;
  responseMimeType?: string;
  provider?: string;
  model?: string;
}): Promise<string> {
  // If user requested local Ollama Gemma, try querying local Ollama first
  if (provider === 'local-ollama') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const ollamaRes = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.includes('gemma') ? model : 'gemma2:9b',
          prompt: `${systemInstruction}\n\nUser Request: ${prompt}`,
          format: responseMimeType === 'application/json' ? 'json' : undefined,
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        if (data.response) {
          return data.response;
        }
      }
    } catch (e) {
      console.warn('Local Ollama Gemma unreachable, falling back to Cloud Free Tier:', e);
    }
  }

  // Cloud Free Tier via Google AI Studio
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: responseMimeType as any,
      temperature: 0.7,
    },
  });

  return response.text || '';
}

// Status Endpoint: Check available Gemma models and connectivity
app.get('/api/gemma/status', async (req, res) => {
  let ollamaReachable = false;
  let ollamaModels: string[] = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const check = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    if (check.ok) {
      const data = await check.json();
      ollamaReachable = true;
      ollamaModels = (data.models || []).map((m: any) => m.name);
    }
  } catch {
    ollamaReachable = false;
  }

  res.json({
    cloudFreeTierActive: !!process.env.GEMINI_API_KEY,
    ollamaReachable,
    ollamaHost: OLLAMA_HOST,
    ollamaModels,
    supportedGemmaModels: [
      { id: 'cloud-gemini-flash', name: 'Google Free Tier (Gemma/Flash)', provider: 'cloud-free', default: true },
      { id: 'gemma2:9b', name: 'Gemma 2 9B (Local Open-Weights)', provider: 'local-ollama' },
      { id: 'gemma2:2b', name: 'Gemma 2 2B (Local Edge / WebGPU)', provider: 'local-ollama' },
    ],
  });
});

// Endpoint 1: Text-to-3D Lab Generator (Gemma Spatial Intelligence Engine)
app.post('/api/gemini/generate-lab', async (req, res) => {
  try {
    const { prompt, gradeLevel = '9-12 (High School)', currentDomain = 'physics', provider = 'cloud-free', model = 'gemma2:9b' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemPrompt = `You are Gemma Spatial Intelligence, an advanced open-weights generative 3D physics and simulation engine for WebXR interactive classrooms.
Your job is to translate educational STEM, Medical, or Engineering simulation prompts into a rich, interactive 3D scene specification and physics parameters.

Target student level: ${gradeLevel}
Current domain hint: ${currentDomain}

Return ONLY valid JSON matching this exact structure:
{
  "title": "Short descriptive title",
  "domain": "physics" | "anatomy" | "circuits" | "aerospace" | "general",
  "description": "Engaging 1-2 sentence overview of the interactive simulation lab",
  "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "physicsConfig": {
    "gravity": [0, -9.81, 0],
    "restitution": 0.8,
    "friction": 0.2,
    "airResistance": 0.01,
    "timeScale": 1.0
  },
  "cameraPosition": [0, 2.5, 6.0],
  "cameraTarget": [0, 1.0, 0],
  "components": [
    {
      "id": "unique_string_id",
      "name": "Human-readable label",
      "type": "sphere" | "box" | "cylinder" | "torus" | "ring" | "capsule" | "cone",
      "position": [x, y, z],
      "rotation": [rx, ry, rz],
      "scale": [sx, sy, sz],
      "color": "#hex",
      "roughness": 0.3,
      "metalness": 0.2,
      "mass": 1.0, // 0 for static anchor/ground/mount, >0 for dynamic physics bodies
      "restitution": 0.85,
      "isHero": true,
      "description": "Educational explanation of what this component is and its role",
      "metadata": {
        "formula": "e.g. F = m * g or V = I * R",
        "keyMetric": "e.g. Velocity: 4.2 m/s",
        "quizQuestion": "A thoughtful question about this part"
      }
    }
  ],
  "socraticPrompts": [
    "Initial guiding question for the avatar mentor to ask the student"
  ]
}

Ensure coordinates fit within a standard VR classroom lab table area (X between -4 and 4, Y between 0 and 3.5, Z between -3 and 2).
Components should be logically assembled with attractive contrasting colors and PBR properties. Return at least 3 to 8 distinct components.`;

    const rawJson = await executeGemmaPrompt({
      prompt,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      provider,
      model,
    });

    const parsed = JSON.parse(rawJson || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating 3D lab:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate 3D simulation',
    });
  }
});

// Endpoint 2: Spatial AI Avatar Mentor Dialogue (Socratic Tutor)
app.post('/api/gemini/tutor-dialogue', async (req, res) => {
  try {
    const { userMessage, sceneContext, gradeLevel = 'High School', provider = 'cloud-free', model = 'gemma2:9b' } = req.body;

    const systemPrompt = `You are Dr. Nova / Gemma, an empathetic, brilliant spatial AI avatar mentor inside a 3D WebXR Virtual Reality classroom.
The student is interacting with an interactive simulation:
Current Simulation: ${sceneContext?.labTitle || 'STEM Laboratory'}
Domain: ${sceneContext?.domain || 'General Science'}
Selected Object: ${sceneContext?.selectedObjectName || 'None'}
Simulation State Summary: ${JSON.stringify(sceneContext?.stats || {})}
Target Student Level: ${gradeLevel}

Provide Socratic feedback:
1. Directly acknowledge their action or question.
2. Explain the underlying physical / biological / electrical mechanism using intuitive analogies.
3. End with an intriguing question or challenge encouraging them to test a variable in the 3D lab.
Keep your response concise (2-4 sentences max) so it sounds great when spoken out loud by the avatar.`;

    const reply = await executeGemmaPrompt({
      prompt: userMessage || 'Give me guidance on this experiment.',
      systemInstruction: systemPrompt,
      responseMimeType: 'text/plain',
      provider,
      model,
    });

    res.json({ success: true, reply: reply || 'Welcome to the lab! Try adjusting the parameters to observe how the system responds.' });
  } catch (error: any) {
    console.error('Error in tutor dialogue:', error);
    res.status(500).json({ error: error.message || 'Tutor dialogue failed' });
  }
});

// Endpoint 3: Text-to-Speech (Avatar Voice using gemini-3.8-flash-lite-tts)
app.post('/api/gemini/tts', async (req, res) => {
  try {
    const { text, voice = 'Zephyr' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: 'Clear, encouraging, insightful science mentor',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }, // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio generated' });
    }

    res.json({ success: true, audioBase64: base64Audio });
  } catch (error: any) {
    console.error('Error in TTS generation:', error);
    res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// Endpoint 4: Contextual 3D Component Inspector
app.post('/api/gemini/inspect-component', async (req, res) => {
  try {
    const { componentName, componentRole, domain, gradeLevel, provider = 'cloud-free', model = 'gemma2:9b' } = req.body;

    const systemPrompt = `You are Gemma Spatial Intelligence analyzing 3D components in WebXR.
Provide an educational spatial inspection breakdown in JSON format:
{
  "summary": "1-2 sentence core function of this component",
  "mechanics": "Detailed how-it-works explanation adapted for ${gradeLevel}",
  "formula": "Relevant mathematical or physical formula if applicable",
  "quizQuestion": "A multiple-choice question testing understanding",
  "quizOptions": ["Option A", "Option B", "Option C", "Option D"],
  "correctOptionIndex": 0,
  "explanation": "Why this answer is correct"
}`;

    const rawJson = await executeGemmaPrompt({
      prompt: `Component: ${componentName}\nDomain: ${domain}\nRole: ${componentRole}\nGrade Level: ${gradeLevel}`,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      provider,
      model,
    });

    res.json({ success: true, data: JSON.parse(rawJson || '{}') });
  } catch (error: any) {
    console.error('Error inspecting component:', error);
    res.status(500).json({ error: error.message || 'Inspection failed' });
  }
});

// Vite mounting & static handling
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Learno3D (Gemma Spatial XR) running on port ${PORT}`);
  });
}

startServer();
