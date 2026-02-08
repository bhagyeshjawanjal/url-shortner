import * as clientModel from "../models/client_config_model.js";
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import {Base64} from 'js-base64';

function generateUserJWTAccessToken(aTokenayload) {
    const aErrorResponse = {
        'code': 400
    }
    const now = new Date();
    let expiryInMinutes = "60";
    const future = new Date(now.getTime() + (expiryInMinutes * 60000));
    let sClientKey = aTokenayload.client_key !== null ? aTokenayload.client_key : '';
    let sClientSecret = aTokenayload.client_secret !== null ? aTokenayload.client_secret : '';

    if(Object.keys(aTokenayload).length === 0){
        return {
            status: 'error',
            message: 'Request body must not be empty',
        };
    }

    if(sClientKey == ''){
        aErrorResponse.message = "Client key is missing";
        return aErrorResponse;
    }

    if(sClientSecret == ''){
        aErrorResponse.message = "Client secret is missing";
        return aErrorResponse;
    }
    const jti = Base64.encodeURL(randomBytes(16));

    const payload = {
        jti: jti,
        iat: Math.floor(now.getTime() / 1000),
        nbf: Math.floor(now.getTime() / 1000),
        exp: Math.floor(future.getTime() / 1000),
        client_key: sClientKey
    };

    const accessToken = jwt.sign(payload, sClientSecret, { algorithm: 'HS256' });

    return {'sToken':accessToken, 'newDeployment':122};
}

async function getClientDetailsByID(iClientID){
    var aClientData = await clientModel.getClientDetailsByID(iClientID);
    return aClientData;
}

async function addClient(aRequestBody){
    aRequestBody.client_key = randomBytes(10).toString('hex');
    aRequestBody.client_secret = randomBytes(32).toString('hex');
    var iClientID = await clientModel.addClientDetails(aRequestBody);
    return {
        "client_key":aRequestBody.client_key,
        "client_secret":aRequestBody.client_secret
    }
}

async function getClientByClientKey(sClientKey){
    var aClientData = await clientModel.getClientByClientKey();
    return aClientData;
}

async function getClientDetails(){
    var aClientData = await clientModel.getClientDetails();
    var ResObj = {
        "success" : true,
        "data" : aClientData
    }
    return ResObj;
}

export{
    addClient,
    generateUserJWTAccessToken,
    getClientByClientKey,
    getClientDetails
};