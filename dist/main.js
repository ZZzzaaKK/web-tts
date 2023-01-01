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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = __importStar(require("request"));
const readline = __importStar(require("readline"));
const fs = __importStar(require("fs"));
const dotenv = __importStar(require("dotenv"));
const cheerio = __importStar(require("cheerio"));
const playsound = require("play-sound");
dotenv.config();
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
function getUserInput(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false,
        });
        return new Promise((resolve) => {
            rl.question(`${prompt}`, (text) => {
                rl.close();
                resolve(text);
            });
        });
    });
}
function getUberduckUuid(text) {
    return __awaiter(this, void 0, void 0, function* () {
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
        return new Promise((resolve, reject) => {
            request.post(speakOptions, (error, response, body) => {
                console.log(response);
                if (error) {
                    console.log(error);
                    reject(error);
                }
                else {
                    console.log(body);
                    resolve(body.uuid);
                }
            });
        });
    });
}
function getParagraphsFromWebpage(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            try {
                // Send the HTTP request and get the response body
                request.get(url, (error, response, body) => {
                    // Load the HTML into cheerio
                    const $ = cheerio.load(body);
                    // Find all paragraph elements and extract their text content
                    const paragraphs = $('p').map((i, element) => $(element).text()).get();
                    const text = paragraphs.join(' ');
                    resolve(text);
                });
            }
            catch (error) {
                console.log(error);
                reject(error);
            }
        });
    });
}
function getSynthesizedSpeech(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            const waitForResponse = setInterval(() => {
                console.log(`Checking for response...`);
                request.get({ url: `https://api.uberduck.ai/speak-status?uuid=${uuid}` }, (error, response, body) => {
                    if (error) {
                        console.log(error);
                        return;
                    }
                    console.log(body);
                    const parsedBody = JSON.parse(body);
                    console.log(parsedBody);
                    if (parsedBody.failed_at !== null) {
                        console.error(`Failed to synthesize speech`);
                        clearInterval(waitForResponse);
                    }
                    if (parsedBody.path !== null) {
                        clearInterval(waitForResponse);
                        resolve(parsedBody.path);
                    }
                });
            }, 2000);
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = yield getUserInput('Enter a URL:\n');
        const text = yield getParagraphsFromWebpage(url);
        console.log(text);
        const uuid = yield getUberduckUuid(text);
        console.log(uuid);
        if (uuid !== null) {
            const audioUrl = yield getSynthesizedSpeech(uuid);
            console.log(`audioURL = ${audioUrl}`);
            const player = playsound();
            const file = fs.createWriteStream('output.wav');
            request.get(audioUrl).pipe(file);
            file.on('end', () => {
                player.play('output.wav', (err) => {
                    if (err) {
                        console.error('Error playing audio');
                    }
                });
            });
        }
    });
}
main();
//# sourceMappingURL=main.js.map