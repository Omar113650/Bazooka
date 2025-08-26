import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();
import google from "../models/LoginGoogle.js";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Google Client ID or Secret is missing in environment variables"
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,

    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await google.findOne({ googleId: profile.id });

        if (!user) {
          user = await google.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value || "",
            name: profile.displayName,
            picture: profile.photos?.[0]?.value || "",
          });
        }

        return done(null, profile);
      } catch (error) {
        console.error("Google Auth Error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;

// التجربه
// https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Fauth%2Fgoogle%2Fcallback&scope=profile%20email&client_id=941298748930-rfgd9k1j4vfeainhse5naahl44ngni82.apps.googleusercontent.com&service=lso&o2v=2&flowName=GeneralOAuthFlow
