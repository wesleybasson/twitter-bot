const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

require('dotenv').config();

const dbRef = admin.firestore().doc('tokens/demo');

const TwitterApi = require('twitter-api-v2').default;
const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_SECRET,
});

const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const callbackURL = process.env.CALLBACK_URL;

// STEP 1
exports.auth = functions.https.onRequest(async (request, response) => {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callbackURL,
    {
      scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
    }
  );

  //store verifier
  await dbRef.set({
    codeVerifier,
    state
  });

  response.redirect(url);
});

// STEP 2
exports.callback = functions.https.onRequest(async (request, response) => {
  const { state, code } = request.query;
  const dbSnapshot = await dbRef.get();
  const { codeVerifier, state: storedState } = dbSnapshot.data();

  if (state !== storedState) {
    return response.status(400).send('Stored tokens do not match!');
  }

  try {
    const {
      client: loggedClient,
      accessToken,
      refreshToken,
    } = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: callbackURL,
    });

    await dbRef.set({ accessToken, refreshToken });

    return response.status(200).send({ state, code, codeVerifier, storedState });
  } catch (ex) {
    return response.status(400).send({ error: ex });
  }
});

// STEP 3
exports.tweet = functions.https.onRequest(async (request, response) => {
  const { refreshToken } = (await dbRef.get()).data();

  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await twitterClient.refreshOAuth2Token(refreshToken);

  await dbRef.set({ accessToken, refreshToken: newRefreshToken });

  const { data } = await refreshedClient.v2.me();

  const nextTweet = await openai.createCompletion('text-davinci-001', {
    prompt: 'tweet something cool and factual about ReactJS',
    max_tokens: 64,
  });

  const { data: data2 } = await refreshedClient.v2.tweet(
    nextTweet.data.choices[0].text
  );

  response.status(200).send({ data, data2 });
});
