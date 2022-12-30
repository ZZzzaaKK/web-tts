import * as request from 'request';
import * as readline from 'readline';
import * as fs from 'fs';
import * as cheerio from 'cheerio';



const API_KEY = "pub_xeantfvrcfxlyoamlz";
const API_SECRET = "pk_c2d305f3-9026-406c-95cb-ce17640b2b64";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Enter the text you want to synthesize', (text: string) => {
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