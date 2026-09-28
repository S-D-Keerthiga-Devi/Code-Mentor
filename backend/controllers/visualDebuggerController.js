import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// High-Speed In-Memory Cache (LRU-style with 15-minute TTL)
// ─────────────────────────────────────────────────────────────────────────────
const flowCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHE_SIZE = 150;

function getCacheKey(code, language) {
    return `${language || 'js'}::${code.trim()}`;
}

function getCachedFlow(key) {
    const entry = flowCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        flowCache.delete(key);
        return null;
    }
    return entry.data;
}

function setCachedFlow(key, data) {
    if (flowCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = flowCache.keys().next().value;
        if (oldestKey) flowCache.delete(oldestKey);
    }
    flowCache.set(key, { data, timestamp: Date.now() });
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: extract the first valid JSON object or array from any string
// ─────────────────────────────────────────────────────────────────────────────
function extractJSON(text) {
    if (!text || typeof text !== 'string') return null;

    // 1. Strip markdown code fences if present
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    let target = fenceMatch ? fenceMatch[1].trim() : text.trim();

    // 2. Direct JSON parse
    try {
        return JSON.parse(target);
    } catch (_) {}

    // 3. Find first { and last }
    const firstBrace = target.indexOf('{');
    const lastBrace = target.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
            return JSON.parse(target.slice(firstBrace, lastBrace + 1));
        } catch (_) {}
    }

    // 4. Find first [ and last ] in case AI returned an array of nodes
    const firstBracket = target.indexOf('[');
    const lastBracket = target.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
        try {
            return JSON.parse(target.slice(firstBracket, lastBracket + 1));
        } catch (_) {}
    }

    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bulletproof Graph Normalizer: handles any nested or flat AI response shape
// ─────────────────────────────────────────────────────────────────────────────
function normalizeGraphData(parsed) {
    if (!parsed) return null;

    let nodes = null;
    let edges = null;

    // 1. Direct match: { nodes: [...], edges: [...] }
    if (Array.isArray(parsed.nodes)) {
        nodes = parsed.nodes;
        edges = Array.isArray(parsed.edges) ? parsed.edges : [];
    } else if (Array.isArray(parsed)) {
        // AI returned raw array of nodes directly: [...]
        nodes = parsed;
        edges = [];
    } else if (typeof parsed === 'object') {
        // Search one level deep for a property containing nodes array
        for (const key of Object.keys(parsed)) {
            const val = parsed[key];
            if (val && typeof val === 'object') {
                if (Array.isArray(val.nodes)) {
                    nodes = val.nodes;
                    edges = Array.isArray(val.edges) ? val.edges : [];
                    break;
                }
            }
        }

        // If not found, check standard alternative keys
        if (!nodes) {
            for (const key of ['elements', 'steps', 'graph', 'chart', 'flow', 'reactFlow', 'data', 'architectureMap']) {
                if (Array.isArray(parsed[key])) {
                    nodes = parsed[key];
                    break;
                }
            }
        }
    }

    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
        return null;
    }

    // 2. Normalize and sanitize all nodes
    const formattedNodes = nodes.map((node, index) => {
        const id = node.id !== undefined && node.id !== null ? String(node.id) : `node_${index + 1}`;
        const nodeData = node.data || {};

        const label = nodeData.label || node.label || node.name || node.text || `Step ${index + 1}`;
        const type = nodeData.type || node.type || "statement";
        const complexityScore = Number(nodeData.complexityScore || node.complexityScore || 1);
        const lineNumber = Number(nodeData.lineNumber || node.lineNumber || index + 1);
        const mockMemoryState = (nodeData.mockMemoryState && typeof nodeData.mockMemoryState === 'object')
            ? nodeData.mockMemoryState
            : (node.mockMemoryState && typeof node.mockMemoryState === 'object')
                ? node.mockMemoryState
                : {};

        let shape = nodeData.shape || node.shape || "rectangle";
        if (index === 0 || index === nodes.length - 1 || /start|begin|return|end|exit/i.test(label) || /start|begin|return|end|exit/i.test(type)) {
            shape = "pill";
        } else if (/if|while|for|switch|branch|condition/i.test(label) || /if|while|for|switch|branch|condition/i.test(type)) {
            shape = "diamond";
        }

        const position = (node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number')
            ? node.position
            : { x: 250, y: 50 + index * 110 };

        return {
            id,
            data: {
                label,
                type,
                complexityScore,
                lineNumber,
                mockMemoryState,
                shape
            },
            position
        };
    });

    // 3. Normalize or synthesize edges
    let formattedEdges = [];
    if (Array.isArray(edges) && edges.length > 0) {
        formattedEdges = edges.map((edge, index) => {
            const source = edge.source !== undefined ? String(edge.source) : String(formattedNodes[index]?.id || `node_${index + 1}`);
            const target = edge.target !== undefined ? String(edge.target) : String(formattedNodes[index + 1]?.id || `node_${index + 2}`);
            return {
                id: edge.id ? String(edge.id) : `e-${index + 1}`,
                source,
                target
            };
        });
    } else {
        // Auto-generate sequential edges
        for (let i = 0; i < formattedNodes.length - 1; i++) {
            formattedEdges.push({
                id: `e-${i + 1}`,
                source: formattedNodes[i].id,
                target: formattedNodes[i + 1].id
            });
        }
    }

    return {
        nodes: formattedNodes,
        edges: formattedEdges
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Heuristic Fallback Flow Generator (Guarantees instant flowchart if AI times out)
// ─────────────────────────────────────────────────────────────────────────────
function generateHeuristicFlow(code, language) {
    const rawLines = code.split("\n");
    const cleaned = [];
    rawLines.forEach((line, idx) => {
        const t = line.trim();
        if (t && t !== "{" && t !== "}" && !t.startsWith("//")) {
            cleaned.push({ text: t, lineNum: idx + 1 });
        }
    });

    const nodes = [];
    const edges = [];

    // Start Node
    nodes.push({
        id: "node_start",
        data: {
            label: `Start (${language || "Code"})`,
            type: "start",
            complexityScore: 1,
            lineNumber: 1,
            mockMemoryState: {},
            shape: "pill"
        },
        position: { x: 250, y: 50 }
    });

    // Content Nodes
    cleaned.forEach((item, i) => {
        const id = `node_${i + 1}`;
        let shape = "rectangle";
        let type = "statement";
        let complexityScore = 1;

        if (/function|def |class /i.test(item.text)) {
            shape = "pill";
            type = "declaration";
        } else if (/if|else if|switch/i.test(item.text)) {
            shape = "diamond";
            type = "conditional";
            complexityScore = 2;
        } else if (/for|while|forEach|map/i.test(item.text)) {
            shape = "diamond";
            type = "loop";
            complexityScore = 5;
        } else if (/return/i.test(item.text)) {
            shape = "pill";
            type = "return";
        }

        nodes.push({
            id,
            data: {
                label: item.text.length > 38 ? item.text.slice(0, 35) + "..." : item.text,
                type,
                complexityScore,
                lineNumber: item.lineNum,
                mockMemoryState: {},
                shape
            },
            position: { x: 250, y: 50 + (i + 1) * 110 }
        });
    });

    // End Node
    nodes.push({
        id: "node_end",
        data: {
            label: "End Execution",
            type: "end",
            complexityScore: 1,
            lineNumber: rawLines.length,
            mockMemoryState: {},
            shape: "pill"
        },
        position: { x: 250, y: 50 + (cleaned.length + 1) * 110 }
    });

    for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({
            id: `e-${i + 1}`,
            source: nodes[i].id,
            target: nodes[i + 1].id
        });
    }

    return { nodes, edges };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fast Groq Runner
// ─────────────────────────────────────────────────────────────────────────────
const runFastGroqAnalysis = async (prompt) => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set in environment");
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"];
    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`⚡ [Groq Fast] Querying model: ${modelName}`);
            const t0 = Date.now();
            const response = await groq.chat.completions.create({
                model: modelName,
                messages: [
                    { role: "system", content: "You are a specialized code-to-graph architecture compiler. Output strictly valid JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
                max_tokens: 1500
            });

            const text = response.choices[0]?.message?.content?.trim() || "";
            if (text) {
                console.log(`✅ [Groq Fast] ${modelName} completed in ${Date.now() - t0}ms (${text.length} chars)`);
                return text;
            }
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ [Groq Fast] ${modelName} failed: ${error.message}`);
        }
    }

    throw lastError || new Error("All Groq fast models failed.");
};

// ─────────────────────────────────────────────────────────────────────────────
// Fast Gemini Runner
// ─────────────────────────────────────────────────────────────────────────────
const runFastGeminiAnalysis = async (prompt) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in environment");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ["gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-flash-latest"];
    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`⚡ [Gemini Fast] Querying model: ${modelName}`);
            const t0 = Date.now();
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.1,
                }
            });
            const response = await model.generateContent(prompt);
            const text = response.response.text().trim();
            console.log(`✅ [Gemini Fast] ${modelName} completed in ${Date.now() - t0}ms (${text.length} chars)`);
            return text;
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ [Gemini Fast] ${modelName} failed: ${error.message}`);
        }
    }

    throw lastError || new Error("All Gemini models failed.");
};

// ─────────────────────────────────────────────────────────────────────────────
// Graph Compiler Pipeline
// ─────────────────────────────────────────────────────────────────────────────
async function executeGraphCompilerAgent(code, language) {
    const prompt = `You are an Algorithmic Graph Compiler.
Analyze the following ${language || "code"} and convert its control flow into a React Flow architecture map with "nodes" and "edges".

Output a valid JSON object matching EXACTLY this structure:
{
  "nodes": [
    {
      "id": "node_1",
      "data": {
        "label": "Start: functionName(args)",
        "type": "start",
        "complexityScore": 1,
        "lineNumber": 1,
        "mockMemoryState": {"param1": "val1"},
        "shape": "pill"
      },
      "position": {"x": 250, "y": 50}
    }
  ],
  "edges": [
    {"source": "node_1", "target": "node_2"}
  ]
}

Guidelines:
- "shape": "pill" for Start/Return/End nodes, "diamond" for branching (if/for/while), "rectangle" for declarations & assignments.
- "complexityScore": O(1)=1, O(logN)=3, O(N)=5, O(N^2)=10.
- "lineNumber": the 1-indexed line number in the source code.
- Layout: increase y by 90-110 for each sequential step.
- Every node MUST connect logically via edges in execution order.

Code to analyze:
\`\`\`${language || ""}
${code}
\`\`\``;

    let responseText = "";

    // 1. Try Groq ultra-fast
    try {
        responseText = await runFastGroqAnalysis(prompt);
    } catch (groqErr) {
        console.warn(`⚠️ [GraphCompiler] Groq failed (${groqErr.message}). Switching to Gemini...`);
        try {
            responseText = await runFastGeminiAnalysis(prompt);
        } catch (geminiErr) {
            console.error(`❌ [GraphCompiler] Both providers failed: ${geminiErr.message}`);
            throw new Error(`AI generation services temporarily unavailable.`);
        }
    }

    return responseText;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler: POST /api/ai/visualize-flow
// ─────────────────────────────────────────────────────────────────────────────
export const generateVisualFlow = async (req, res) => {
    const { code, language } = req.body;

    if (!code || !code.trim()) {
        return res.status(400).json({ error: "No code provided for visualizer." });
    }

    // 1. In-memory cache hit
    const cacheKey = getCacheKey(code, language);
    const cachedData = getCachedFlow(cacheKey);
    if (cachedData) {
        console.log(`⚡ [VisualFlow] Serving cached flow graph (${cachedData.nodes?.length} nodes)`);
        return res.status(200).json(cachedData);
    }

    try {
        const rawText = await executeGraphCompilerAgent(code, language);
        const parsedData = extractJSON(rawText);

        // 2. Bulletproof Normalization
        const normalized = normalizeGraphData(parsedData);

        if (normalized && normalized.nodes.length > 0) {
            setCachedFlow(cacheKey, normalized);
            console.log(`✅ [VisualFlow] Generated graph: ${normalized.nodes.length} nodes, ${normalized.edges.length} edges`);
            return res.status(200).json(normalized);
        }

        // 3. Resilient Fallback to Gemini if Groq returned unexpected shape
        console.warn("⚠️ [VisualFlow] Primary parse returned unexpected shape. Retrying with Gemini Flash...");
        const geminiText = await runFastGeminiAnalysis(`You are an Algorithmic Graph Compiler. Return a JSON object with "nodes" and "edges" arrays for this code:\n${code}`);
        const geminiParsed = extractJSON(geminiText);
        const geminiNormalized = normalizeGraphData(geminiParsed);

        if (geminiNormalized && geminiNormalized.nodes.length > 0) {
            setCachedFlow(cacheKey, geminiNormalized);
            return res.status(200).json(geminiNormalized);
        }

        // 4. Heuristic Fallback (Ensures visualizer ALWAYS works instantly)
        console.log("⚡ [VisualFlow] Applying dynamic AST heuristic flow generator...");
        const fallbackGraph = generateHeuristicFlow(code, language);
        setCachedFlow(cacheKey, fallbackGraph);
        return res.status(200).json(fallbackGraph);

    } catch (error) {
        console.warn("⚠️ [VisualFlow] Exception in AI pipeline, serving instant dynamic heuristic graph:", error.message);
        const fallbackGraph = generateHeuristicFlow(code, language);
        setCachedFlow(cacheKey, fallbackGraph);
        return res.status(200).json(fallbackGraph);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Route handler: POST /api/ai/optimize-node
// ─────────────────────────────────────────────────────────────────────────────
export const optimizeNodeCode = async (req, res) => {
    const { fullCode, lineNumber, language } = req.body;

    if (!fullCode || !lineNumber) {
        return res.status(400).json({ error: "Missing required fields: fullCode and lineNumber." });
    }

    const prompt = `You are an Expert Software Architect. The user wants to optimize a specific inefficient node.

Code context (${language || "javascript"}):
\`\`\`
${fullCode}
\`\`\`

Focus on the logic around line ${lineNumber}. Rewrite that inefficient block to a better time complexity.
Output ONLY a raw JSON object in this exact format:
{
  "optimizedCode": "// rewritten code block as a string",
  "targetLineStart": <integer>,
  "targetLineEnd": <integer>
}`;

    let rawText = "";

    try {
        rawText = await runFastGroqAnalysis(prompt);
    } catch (groqErr) {
        try {
            rawText = await runFastGeminiAnalysis(prompt);
        } catch (geminiErr) {
            return res.status(500).json({ error: "AI providers unavailable for optimization." });
        }
    }

    const parsedData = extractJSON(rawText);

    if (!parsedData || !parsedData.optimizedCode) {
        return res.status(500).json({ error: "AI returned invalid optimization response." });
    }

    console.log(`✅ [Optimizer] Optimization complete for line ${lineNumber}`);
    return res.status(200).json(parsedData);
};
