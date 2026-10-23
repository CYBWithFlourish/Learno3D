import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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

// Endpoint 1: Text-to-3D Lab Generator (Gemma Spatial Intelligence Engine)
app.post('/api/gemini/generate-lab', async (req, res) => {
  try {
    const { prompt, gradeLevel = '9-12 (High School)', currentDomain = 'physics' } = req.body;
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
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
    const { userMessage, sceneContext, gradeLevel = 'High School' } = req.body;

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage || 'Give me guidance on this experiment.',
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Welcome to the lab! Try adjusting the parameters to observe how the system responds.';
    res.json({ success: true, reply });
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
    const { componentName, componentRole, domain, gradeLevel } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Component: ${componentName}
Domain: ${domain}
Role: ${componentRole}
Grade Level: ${gradeLevel}

Provide an educational spatial inspection breakdown in JSON format:
{
  "summary": "1-2 sentence core function of this component",
  "mechanics": "Detailed how-it-works explanation adapted for ${gradeLevel}",
  "formula": "Relevant mathematical or physical formula if applicable",
  "quizQuestion": "A multiple-choice question testing understanding",
  "quizOptions": ["Option A", "Option B", "Option C", "Option D"],
  "correctOptionIndex": 0,
  "explanation": "Why this answer is correct"
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    res.json({ success: true, data: JSON.parse(jsonText) });
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
    console.log(`Gemma Spatial XR Studio running on port ${PORT}`);
  });
}

startServer();
