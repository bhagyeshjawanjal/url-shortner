import express from "express";
import * as service from "./service/service_func.js";
import * as clientService from './service/client_confiig.js';
import * as middleWare from './Middleware/middleware.js';

import dotenv from "dotenv";

dotenv.config();

const app = express();

var port = process.env.PORT;

app.use(express.json());

// Custom middleware for authentication
app.use(middleWare.handle);

// Client related endpoints
app.post("/register-client", async (req, res) => {
    var myObj = await clientService.addClient(req.body);
    res.send(myObj);
});

app.get("/get-access-token", (req, res) => {
    var aTokenData = clientService.generateUserJWTAccessToken(req.body);
    res.send(aTokenData);
});

app.post("/generate-url", async (req, res) => {
    var oShortUrl = await service.generateAndSaveURl(req.body, res);
    // res.sendStatus(oShortUrl);
    return res.json(oShortUrl);
});

app.get("/:clientId/:shortCode", async (req, res) => {

    try {
        const { clientId, shortCode } = req.params;

        const result = await service.getUrlAndIncrementClick(clientId, shortCode);

        if (result.error) {
            return res.status(result.error_code).send(result.message);
        }

        return res.redirect(result.original_url);

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.use((req, res) => {
    res.status(404).send("Not Found");
});

app.listen(port, () => {
    console.log(`🚀 App is running on ${port}`)
});