import fs from "fs";
import readline from "readline";
import { google } from "googleapis";

const CREDENTIALS_PATH = "credentials/oauth-client.json";
const TOKEN_PATH = "credentials/google-token.json";

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));

const client = credentials.installed || credentials.web;

const oAuth2Client = new google.auth.OAuth2(
  client.client_id,
  client.client_secret,
  client.redirect_uris[0]
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/drive.file"],
  prompt: "consent",
});

console.log("\nOpen this URL in your browser:\n");
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nPaste the code here: ", async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log("\nToken saved to credentials/google-token.json");
  } catch (error) {
    console.error("Error getting token:", error);
  } finally {
    rl.close();
  }
});
