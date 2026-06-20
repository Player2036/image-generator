import { google } from "googleapis";
import fs from "fs";
import path from "path";

export function getGoogleOAuthClient() {
  const oauthClientPath = path.join(
    process.cwd(),
    "credentials",
    "oauth-client.json"
  );

  const tokenPath = path.join(
    process.cwd(),
    "credentials",
    "google-token.json"
  );

  const credentials = JSON.parse(
    fs.readFileSync(oauthClientPath, "utf8")
  );

  const token = JSON.parse(
    fs.readFileSync(tokenPath, "utf8")
  );

  const client = credentials.installed || credentials.web;

  const auth = new google.auth.OAuth2(
    client.client_id,
    client.client_secret,
    client.redirect_uris[0]
  );

  auth.setCredentials(token);

  return auth;
}