import * as request from 'request';
import * as readline from 'readline';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import playsound = require('play-sound');

dotenv.config();

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

async function getUserInput(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });

    return new Promise((resolve) => {
        rl.question(`${prompt}`, (text: string) => {
            rl.close();
            resolve(text);
        });
    });
}

async function getUberduckUuid(text: string): Promise<string> {
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
            } else {
                console.log(body);

                resolve(body.uuid);
            }
        });
    });
}

async function getParagraphsFromWebpage(url: string): Promise<string> {
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
}

async function getSynthesizedSpeech(uuid: string): Promise<string> {
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
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function main() {
    const url = await getUserInput('Enter a URL:\n');

    const text = await getParagraphsFromWebpage(url);
    console.log(text);

    const uuid = await getUberduckUuid(text);
    console.log(uuid);

    if (uuid !== null) {
        const audioUrl = await getSynthesizedSpeech(uuid);
        console.log(`audioURL = ${audioUrl}`);
        const player = playsound();

        const file = fs.createWriteStream('output.wav');
        request.get(audioUrl).pipe(file);

        file.on('end', () => {
            player.play('output.wav', (err: any) => {
                if (err) {
                    console.error('Error playing audio');
                }
            });
        });
    }
}

main();