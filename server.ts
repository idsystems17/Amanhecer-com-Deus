/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI Client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. API ROUTES FIRST
// Health check path
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Text-to-Speech route using gemini-3.1-flash-tts-preview
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texto para narração é obrigatório.' });
    }

    // Attempt to invoke Gemini TTS
    const ai = getAiClient();
    const voiceName = voice || 'Kore'; // Fenrir, Puck, Charon, Kore, Zephyr

    console.log(`[TTS] Gerando áudio via Gemini para o texto. Voz: ${voiceName}`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      console.warn('[TTS] Resposta do modelo não continha áudio.');
      return res.status(500).json({ 
        error: 'O modelo de IA não retornou bloco de áudio.',
        fallbackNeeded: true 
      });
    }

    return res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error('[TTS] Falha ao gerar narração:', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Falha na geração de áudio por inteligência artificial.',
      fallbackNeeded: true,
    });
  }
});

// 2. VITE MIDDLEWARE SETUP
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Server] Iniciando em modo de Desenvolvimento...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Server] Iniciando em modo de Produção...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Servidor rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
