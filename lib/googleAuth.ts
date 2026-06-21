import { google } from "googleapis";
import { getRequiredEnvValues } from "./env";

export function getGoogleOAuthClient() {
  const {
    GOOGLE_CLIENT_ID: clientId,
    GOOGLE_CLIENT_SECRET: clientSecret,
    GOOGLE_REFRESH_TOKEN: refreshToken,
  } = getRequiredEnvValues([
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REFRESH_TOKEN",
  ] as const);

  const auth = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  auth.setCredentials({
    refresh_token: refreshToken,
  });

  return auth;
}
