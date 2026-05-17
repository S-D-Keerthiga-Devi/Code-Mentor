import axios from 'axios';

export const executeCode = async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ error: "Source code is required." });
        }

        if (!process.env.JDOODLE_CLIENT_ID || !process.env.JDOODLE_CLIENT_SECRET) {
            return res.status(500).json({ error: "JDoodle API keys missing from environment." });
        }

        const JDOODLE_LANG_MAP = {
            javascript: { language: 'nodejs', versionIndex: '4' }, // Node.js 17.x
            python: { language: 'python3', versionIndex: '4' },    // Python 3.9.x
            cpp: { language: 'cpp17', versionIndex: '1' },         // C++ 17
            java: { language: 'java', versionIndex: '4' }          // Java 17
        };

        const mappedConfig = JDOODLE_LANG_MAP[language.toLowerCase()];

        if (!mappedConfig) {
            return res.status(400).json({ error: `Language '${language}' is not supported.` });
        }

        const response = await axios.post('https://api.jdoodle.com/v1/execute', {
            clientId: process.env.JDOODLE_CLIENT_ID,
            clientSecret: process.env.JDOODLE_CLIENT_SECRET,
            script: code,
            language: mappedConfig.language,
            versionIndex: mappedConfig.versionIndex
        });

        // JDoodle sets memory to null (or string "null") for ALL failures: timeouts, crashes, runtime errors.
        // We expose a clean `isError` flag so the frontend never has to guess.
        const rawMemory = response.data.memory;
        const isError = rawMemory === null || rawMemory === undefined || rawMemory === 'null' || rawMemory === '';

        return res.status(200).json({
            success: true,
            isError,
            output: response.data.output,
            memory: isError ? null : rawMemory,
            time: response.data.cpuTime
        });

    } catch (error) {
        if (error.response && error.response.status === 429) {
            return res.status(429).json({
                success: false,
                error: "Execution Rate Limit Exceeded. Please try again later."
            });
        }

        console.error("❌ JDoodle Execution Error:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: "Execution service is currently unavailable.",
            details: error.message
        });
    }
};
