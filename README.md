# Twitter Bot

This bot will automatically write tweets for you. It uses OpenAI's GPT-3 API to create clever tweets on the fly.

## What you will need

You will need a Twitter Developer account as well as an OpenAI account.
Under Twitter you should create a new app, enable OAuth2 and generate a new client ID and client Secret.
You should also generate a new ApiKey inside your OpenAI account.
These keys should be added to your .env file.

You will need Node.js as well as Firebase CLI Tools installed on your computer.

## How to run

The code here is the code that you will typically find inside of the functions folder after running `firebase init functions`.
You will have to set up your own Firebase project beforehand, and then replace the files inside your newly created functions folder with those in this repo.
Essentially you can clone this repo from within your new functions folder. That should do the trick.
Run `npm install` to install all the required packages.

Add your own keys and URLs to your .env file

* TWITTER_CLIENT_ID="YOUR TWITTER CLIENT ID"
* TWITTER_SECRET="YOUR TWITTER CLIENT SECRET"
* OPENAI_API_KEY="YOUR OPENAI API KEY"
* CALLBACK_URL="YOUR TWITTER CALLBACK URL"

Make sure you have the relevant Google API's enabled.
Also make sure you have created a Firebase Firestore database.

Then run `firebase serve` and visit the URLs in the following order:

* http://127.0.0.1:5000/your-firebase-project-name/server-location/auth
* http://127.0.0.1:5000/your-firebase-project-name/server-location/tweet

Also do not forget to set your callback URL inside the App settings in the Twitter Developer portal.