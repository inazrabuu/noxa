import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  /* 
  Generate a "spec" from prompt. If OPENROUTER_API_KEY is present, attempt to call
  the LLM model for chat completion API, expecting the model to return JSON only.
  If no API key, fallback to deterministic template generator.
  
  The spec shape:
  { name: string, description?: string, files: [{ path: string, content: string }]} 
   */
  async generateSpec(prompt: string): Promise<any> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (apiKey) {
      try {
        const system = `You are a code generator. Given a user prompt, output ONLY a sngle JSON object (no extra text) with this exact schema:
        {
          "name": "<short-service-name>",
          "description": "<short-description>",
          "files": [
            {"path": "package.json", "content": "..."},
            {"path": "index.js", "content": "..."},
            ...
          ]
        }
          
        Make files minimal and runnable (use plain JS for the generated project). Keep each file content ~2000 tokens.
        
        Do not add \`\`\`json enclosing so that it can be parsed directly.`;

        const body = {
          model: process.env.LLM_MODEL || 'deepseek/deepseek-chat-v3.1:free',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt }
          ],
          temperature: 0.0,
          max_tokens: 1600
        };

        const apiUrl = `${process.env.OPENROUTER_BASE_URL}/chat/completions` || '';
        const resp = await axios.post(
          apiUrl,
          body,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 60_000
          }
        );

        const text = 
          resp.data?.choices[0].message.content ??
          resp.data?.choices[0].text;

        try {
          const parsed = JSON.parse(text);
          return parsed;
        } catch (err) {
          this.logger.warn(`LLM returned non-JSON. Returning error to caller`, err);
          throw new Error(
            `LLM response was not valid JSON. Full response: 
            ${text.slice(0, 2000)}`
          )
        }

      } catch (e) {
        this.logger.error('LLM call failed', e);
        throw e;
      }
    }

    /* Fallback generator (no API key) */
    const name = this.extractServiceName(prompt) || `generated-service`;
    const files = this.buildDefaultFiles(name, prompt);

    return {
      name,
      description: prompt,
      files
    }
  }

  private extractServiceName(prompt: string): string {
    const m = prompt.match(/(\w+)[\s-]*service/i);
    if (m) return `${m[1]}-service`.toLowerCase();

    /* Fallback to first meaningful token */
    const token = prompt.split(/\s+/).find(t => t.length > 2);
    return token ? token.toLowerCase().replace(/[^a-z0-9\-]/g, '-') + '-service' : 
            'generated-service';
  }

  private buildDefaultFiles(name: string, prompt: string) {
    const packageJson = {
      name, 
      version: '0.0.1',
      main: 'index.js',
      scripts: {
        start: 'node index.js'
      },
      dependencies: {
        express: '^4.18.2'
      }
    };

    const indexJs = `
const express = require('express');
const app = express();
app.use(express.json());

let store = [];
// Basic CRUD for /items
app.get('/items', (req, res) => res.json(store));
app.post('/items', (req, res) => {
  const item = { id: Date.now(), ...req.body };
  store.push(item);
  res.status(201).json(item);
});
app.get('/items/:id', (req, res) => {
  const it = store.find(x => String(x.id) === String(req.params.id));
  if (!it) return res.status(404).json({ error: 'not found' });
  res.json(it);
});
app.delete('/items/:id', (req, res) => {
  store = store.filter(x => String(x.id) !== String(req.params.id));
  res.status(204).end();
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('${name} listening on', port));
    `;

    const readme = `
# ${name}

Generated from prompt:
${prompt}

\`\`\`
npm install
npm start
\`\`\`
    `;

    return [
      { path: "package.json", content: JSON.stringify(packageJson, null, 2)},
      { path: "index.js", content: indexJs },
      { path: 'README.md', content: readme}
    ]
  }
}