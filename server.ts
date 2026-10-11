import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client according to AI Studio guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_SYSTEM_INSTRUCTION = `Bạn là Chat 4.0 - Trợ lý trí tuệ nhân tạo thông minh thế hệ Cách mạng Công nghiệp 4.0.
Đặc điểm và nguyên tắc hoạt động của bạn:
1. Bạn có kiến thức uyên bác về công nghệ 4.0 (Trí tuệ nhân tạo AI, Dữ liệu lớn Big Data, Internet vạn vật IoT, Chuỗi khối Blockchain, Điện toán đám mây Cloud Computing, Tự động hóa Automation), lập trình (Python, JavaScript/TypeScript, Go, Rust, Java, C++, v.v.), toán học, khoa học, kinh tế, giáo dục, sáng tạo nội dung và đời sống.
2. Giao tiếp thông minh, khách quan, súc tích, cấu trúc rõ ràng, dùng bullet points hoặc markdown khi cần thiết để người dùng dễ tiếp thu.
3. Hỗ trợ đa ngôn ngữ hoàn hảo: Luôn trả lời tự nhiên theo đúng ngôn ngữ người dùng yêu cầu hoặc ngôn ngữ người dùng đang nhắn (Tiếng Việt, English, 日本語, 中文, Français, Español, 한국어, Deutsch, v.v.).
4. Khi cung cấp code, luôn định dạng đúng cú pháp ngôn ngữ lập trình với chú thích dễ hiểu.
5. Luôn khiêm tốn, lịch sự, đồng cảm và đồng hành hỗ trợ tối đa người dùng.`;

// Endpoint: Check health & capabilities
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'Chat 4.0',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint: Chat Stream (Server-Sent Events)
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { messages, systemInstruction, temperature, targetLanguage } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trong hệ thống. Vui lòng kiểm tra Settings > Secrets.',
      });
    }

    // Prepare headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let combinedInstruction = systemInstruction || DEFAULT_SYSTEM_INSTRUCTION;
    if (targetLanguage && targetLanguage !== 'auto') {
      combinedInstruction += `\nLƯU Ý QUAN TRỌNG: Hãy trả lời câu hỏi bằng ngôn ngữ được chỉ định: "${targetLanguage}".`;
    }

    // Format contents for Gemini SDK
    // contents can be an array of Content objects: { role: 'user' | 'model', parts: [{ text }] }
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: combinedInstruction,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Gemini Stream Error:', error);
    const errorMessage = error?.message || 'Có lỗi xảy ra khi xử lý phản hồi từ AI.';
    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage });
    } else {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chat 4.0 Server is listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
