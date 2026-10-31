const { spawn } = require('child_process');
const path = require('path');

// Python interpreter: "python3" on Linux containers, "python" on Windows dev machines
const PYTHON_BIN = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');
// Upper bound on concurrent Python processes so a burst of requests cannot exhaust CPU/RAM
const MAX_CONCURRENT = Number(process.env.AI_MAX_CONCURRENCY || 4);
const DEFAULT_TIMEOUT_MS = 30 * 1000;
const SCRAPER_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;

/**
 * Runs the AI / scraper Python scripts with JSON over stdin/stdout.
 * Centralizes script execution, concurrency limiting, timeouts and error handling.
 */
class AiService {
    constructor() {
        this.aiUtilsPath = path.join(__dirname, '../utils/ai');
        this.rootPath = path.join(__dirname, '../'); // For ai_service.py in root
        this.running = 0;
        this.queue = [];
    }

    // Wait for a free slot
    acquire() {
        if (this.running < MAX_CONCURRENT) {
            this.running++;
            return Promise.resolve();
        }
        return new Promise(resolve => this.queue.push(resolve));
    }

    release() {
        const next = this.queue.shift();
        if (next) next();
        else this.running--;
    }

    resolveScriptPath(scriptName, customPath) {
        if (customPath) return path.join(customPath, scriptName);
        if (scriptName === 'ai_service.py') return path.join(this.rootPath, scriptName);
        return path.join(this.aiUtilsPath, scriptName);
    }

    /**
     * Executes a Python script with JSON input and returns JSON output.
     * @param {string} scriptName - Name of the script (e.g., 'market_intelligence.py')
     * @param {object} inputData - JSON object to pass to the script via stdin
     * @param {string} [customPath] - Optional directory if the script is not in utils/ai
     * @returns {Promise<object>} - Parsed JSON result
     */
    async executeScript(scriptName, inputData, customPath = null) {
        await this.acquire();
        try {
            return await this.run(scriptName, inputData, customPath);
        } finally {
            this.release();
        }
    }

    run(scriptName, inputData, customPath) {
        return new Promise((resolve, reject) => {
            const scriptPath = this.resolveScriptPath(scriptName, customPath);
            const timeoutMs = customPath ? SCRAPER_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;
            let settled = false;
            let outputString = '';
            let errorString = '';

            const finish = (fn, value) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                fn(value);
            };

            const pythonProcess = spawn(PYTHON_BIN, [scriptPath], {
                env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
            });

            const timer = setTimeout(() => {
                pythonProcess.kill('SIGKILL');
                finish(reject, new Error(`Script ${scriptName} timed out after ${timeoutMs / 1000}s`));
            }, timeoutMs);

            pythonProcess.on('error', (err) => {
                // e.g. Python is not installed (ENOENT)
                finish(reject, new Error(`Could not start ${PYTHON_BIN} for ${scriptName}: ${err.message}`));
            });

            pythonProcess.stdout.on('data', (data) => {
                outputString += data.toString();
                if (outputString.length > MAX_OUTPUT_BYTES) {
                    pythonProcess.kill('SIGKILL');
                    finish(reject, new Error(`Script ${scriptName} produced too much output`));
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (settled) return; // already failed (spawn error, timeout, output cap)
                if (code !== 0) {
                    console.error(`[AiService] Error in ${scriptName}: ${errorString.substring(0, 2000)}`);
                    return finish(reject, new Error(`Script ${scriptName} exited with code ${code}`));
                }

                try {
                    // Scripts may print debug lines before the JSON; take the outermost object
                    const jsonStartIndex = outputString.indexOf('{');
                    const jsonEndIndex = outputString.lastIndexOf('}');

                    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                        return finish(resolve, JSON.parse(outputString.substring(jsonStartIndex, jsonEndIndex + 1)));
                    }
                    finish(resolve, outputString.trim() ? JSON.parse(outputString) : null);
                } catch (parseError) {
                    console.error(`[AiService] JSON Parse Error for ${scriptName}: ${parseError.message}`);
                    finish(reject, new Error(`Failed to parse output from ${scriptName}`));
                }
            });

            try {
                pythonProcess.stdin.on('error', () => { /* reported via close/error */ });
                pythonProcess.stdin.end(inputData ? JSON.stringify(inputData) : '');
            } catch (err) {
                finish(reject, new Error(`Failed to write to stdin of ${scriptName}: ${err.message}`));
            }
        });
    }
}

module.exports = new AiService();
