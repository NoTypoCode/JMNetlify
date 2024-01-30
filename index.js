const { configDotenv } = require('dotenv');
const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('./public'));

const spreadsheetId = process.env.SPEADSHEETS_ID;


const theSheetData = async () => {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            type: process.env.SECRETS_TYPE,
            project_id: process.env.SECRETS_PROJECT_ID,
            private_key_id: process.env.SECRETS_PRIVATE_KEY_ID,
            private_key: process.env.SECRETS_PRIVATE_KEY,
            client_email: process.env.SECRETS_CLIENT_EMIAL,
            client_id: process.env.SECRETS_CLIENT_ID,
            auth_uri: process.env.SECRETS_AUTH_URI,
            token_uri: process.env.SECRETS_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.SECRETS_AUTH_PROVIDER_X509_CERT_URL,
            client_x509_cert_url: process.env.SECRETS_CLIENT_X509_CERT_URL,
            universe_domain: process.env.SECRETS_UNIVERSE_DOMAIN
        },
        scopes: "https://www.googleapis.com/auth/spreadsheets",

    });
    // create client instance
    const client = await auth.getClient();



    //instance of the google sheets
    const googleSheets = google.sheets({ version: "v4", auth: client });


    return { auth, client, googleSheets, spreadsheetId };
};

app.get("/lease", async (req, res) => {
    const { auth, client, googleSheets, spreadsheetId } = await theSheetData();
    //read the data from the sheets
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: process.env.DEALER_RANGE,
    });
    const dealerArray = getRows.data.values.flat();
    res.json({ dealers: dealerArray });
});


app.get("/card", async (req, res) => {
    const { auth, client, googleSheets, spreadsheetId } = await theSheetData();
    //read the data from the sheets
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: process.env.CARD_RANGE,
    });
    const creditcard = getRows.data.values.flat();
    res.send({ creditcard: creditcard });
})

app.get("/cards", async (req, res) => {
    const { auth, client, googleSheets, spreadsheetId } = await theSheetData();
    //read the data from the sheets
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: process.env.CARD_INFO_RANGE,
    });
    const cardsArray = getRows.data.values;
    res.send({ cards: cardsArray });
})


app.post("/", async (req, res) => {
    const { auth, client, googleSheets, spreadsheetId } = await theSheetData();

    const { name, amount, CardSelector, dealer } = req.body;

    //writing rows to sheets
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Sheet1!A:D",
        insertDataOption: "OVERWRITE",
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [
                [name, amount, CardSelector, dealer]
            ]
        },
    });

    res.send();
})

const PORT = process.env.PORT;
app.listen(PORT || 8080, (req, res) => { console.log(`We are up and running on ${PORT}`); });

