## Current State
Lots of features missing, just a small hobby project.

## Prerequisites
- TypeScript is installed
- Node is installed
- You will also need to generate an API key for use with the Uberduck API [here](https://app.uberduck.ai/account/manage). Once you got it, create a file named .env at the root of the project and create two entries, one for API_KEY, and one for API_SECRET, with your corresponding API key details. The file should look similar to this:
```.env
API_KEY = `Your API key`
API_SECRET = `Your API secret`
```

## How to run
Navigate to the web-tts folder. Run:
```
tsc
node dist/main.js
```
You will now be prompted to provide a URL. The URL should point to a valid web site. The program will then make continued requests to the Uberduck API until it gets a response. Sometimes, the Uberduck API will return an error. This may be caused due to the content of the site or other reasons. You can try again, or try a different URL. If the program succeeds, it will create a file called output.wav at the root of the folder. You can play this file to get your audio output.

## Planned Features
- Ease setup
- Play audio directly without having to open a file first
- Create an interface that allows for easy selection of different voices
- Release as Chrome/Firefox extension
- Create an interface that allows for playing/pausing the audio for the extension