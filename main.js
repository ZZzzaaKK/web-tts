"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = __importStar(require("request"));
const readline = __importStar(require("readline"));
const fs = __importStar(require("fs"));
// Replace YOUR_API_KEY with your actual API key
const API_KEY = "pub_xeantfvrcfxlyoamlz";
const API_SECRET = "pk_c2d305f3-9026-406c-95cb-ce17640b2b64";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
rl.question('Enter the text you want to synthesize\n', (text) => {
    rl.close();
    const speakOptions = {
        url: 'https://api.uberduck.ai/speak',
        auth: {
            user: API_KEY,
            pass: API_SECRET,
        },
        json: {
            speech: text,
            voice: 'zwf',
        },
    };
    request.post(speakOptions, (error, response, body) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log(response);
        console.log(body);
        const uuid = body.uuid;
        const speakStatusOptions = {
            url: `https://api.uberduck.ai/speak-status?uuid=${uuid}`,
            auth: {
                user: API_KEY,
                pass: API_SECRET,
            },
        };
        const waitForResponse = setInterval(() => {
            request.get(speakStatusOptions, (error, response, body) => {
                if (error) {
                    console.error(error);
                    return;
                }
                const parsedBody = JSON.parse(body);
                console.log(parsedBody);
                if (parsedBody.path !== null) {
                    console.log(parsedBody.path);
                    const audioUrl = parsedBody.path;
                    const file = fs.createWriteStream("output.wav");
                    request.get(audioUrl).pipe(file);
                    clearInterval(waitForResponse);
                }
            });
        }, 1000);
    });
});
//# sourceMappingURL=main.js.map