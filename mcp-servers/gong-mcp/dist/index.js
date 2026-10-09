#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';
// Redirect all console output to stderr
const originalConsole = { ...console };
console.log = (...args) => originalConsole.error(...args);
console.info = (...args) => originalConsole.error(...args);
console.warn = (...args) => originalConsole.error(...args);
dotenv.config();
const GONG_API_URL = 'https://api.gong.io/v2';
const GONG_ACCESS_KEY = process.env.GONG_ACCESS_KEY;
const GONG_ACCESS_SECRET = process.env.GONG_ACCESS_SECRET;
// Check for required environment variables
if (!GONG_ACCESS_KEY || !GONG_ACCESS_SECRET) {
    console.error("Error: GONG_ACCESS_KEY and GONG_ACCESS_SECRET environment variables are required");
    process.exit(1);
}
// Gong API Client
class GongClient {
    constructor(accessKey, accessSecret) {
        this.accessKey = accessKey;
        this.accessSecret = accessSecret;
    }
    async generateSignature(method, path, timestamp, params) {
        const stringToSign = `${method}\n${path}\n${timestamp}\n${params ? JSON.stringify(params) : ''}`;
        const encoder = new TextEncoder();
        const keyData = encoder.encode(this.accessSecret);
        const messageData = encoder.encode(stringToSign);
        const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
        return btoa(String.fromCharCode(...new Uint8Array(signature)));
    }
    async request(method, path, params, data) {
        const timestamp = new Date().toISOString();
        const url = `${GONG_API_URL}${path}`;
        const response = await axios({
            method,
            url,
            params,
            data,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${this.accessKey}:${this.accessSecret}`).toString('base64')}`,
                'X-Gong-AccessKey': this.accessKey,
                'X-Gong-Timestamp': timestamp,
                'X-Gong-Signature': await this.generateSignature(method, path, timestamp, data || params)
            }
        });
        return response.data;
    }
    async listCalls(fromDateTime, toDateTime) {
        const params = {};
        if (fromDateTime)
            params.fromDateTime = fromDateTime;
        if (toDateTime)
            params.toDateTime = toDateTime;
        return this.request('GET', '/calls', params);
    }
    async retrieveTranscripts(callIds) {
        return this.request('POST', '/calls/transcript', undefined, {
            filter: {
                callIds,
                includeEntities: true,
                includeInteractionsSummary: true,
                includeTrackers: true
            }
        });
    }
}
const gongClient = new GongClient(GONG_ACCESS_KEY, GONG_ACCESS_SECRET);
// Tool definitions
const LIST_CALLS_TOOL = {
    name: "list_calls",
    description: "List Gong calls with optional date range filtering. Returns call details including ID, title, start/end times, participants, and duration.",
    inputSchema: {
        type: "object",
        properties: {
            fromDateTime: {
                type: "string",
                description: "Start date/time in ISO format (e.g. 2024-03-01T00:00:00Z)"
            },
            toDateTime: {
                type: "string",
                description: "End date/time in ISO format (e.g. 2024-03-31T23:59:59Z)"
            }
        }
    }
};
const RETRIEVE_TRANSCRIPTS_TOOL = {
    name: "retrieve_transcripts",
    description: "Retrieve transcripts for specified call IDs. Returns detailed transcripts including speaker IDs, topics, and timestamped sentences.",
    inputSchema: {
        type: "object",
        properties: {
            callIds: {
                type: "array",
                items: { type: "string" },
                description: "Array of Gong call IDs to retrieve transcripts for"
            }
        },
        required: ["callIds"]
    }
};
// Server implementation
const server = new Server({
    name: "example-servers/gong",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Type guards
function isGongListCallsArgs(args) {
    return (typeof args === "object" &&
        args !== null &&
        (!("fromDateTime" in args) || typeof args.fromDateTime === "string") &&
        (!("toDateTime" in args) || typeof args.toDateTime === "string"));
}
function isGongRetrieveTranscriptsArgs(args) {
    return (typeof args === "object" &&
        args !== null &&
        "callIds" in args &&
        Array.isArray(args.callIds) &&
        args.callIds.every(id => typeof id === "string"));
}
// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [LIST_CALLS_TOOL, RETRIEVE_TRANSCRIPTS_TOOL],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        if (!args) {
            throw new Error("No arguments provided");
        }
        switch (name) {
            case "list_calls": {
                if (!isGongListCallsArgs(args)) {
                    throw new Error("Invalid arguments for list_calls");
                }
                const { fromDateTime, toDateTime } = args;
                const response = await gongClient.listCalls(fromDateTime, toDateTime);
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify(response, null, 2)
                        }],
                    isError: false,
                };
            }
            case "retrieve_transcripts": {
                if (!isGongRetrieveTranscriptsArgs(args)) {
                    throw new Error("Invalid arguments for retrieve_transcripts");
                }
                const { callIds } = args;
                const response = await gongClient.retrieveTranscripts(callIds);
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify(response, null, 2)
                        }],
                    isError: false,
                };
            }
            default:
                return {
                    content: [{ type: "text", text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
