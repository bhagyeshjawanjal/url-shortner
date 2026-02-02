import * as models from "../models/models.js";
import dotenv from "dotenv";

function generateShortCode(length = 6) {

  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = "";

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * chars.length);
    code += chars[index];
  }

  return code;
}

async function generateAndSaveURl(req, res){

  var aErrorResponse = {'error' : true, 'error_code' : 400};

  let iClientID = req.iClientID ?? 0;
  let sOriginalUrl = req.sOriginalUrl ?? '';
  let urlCode = generateShortCode();

  if (!sOriginalUrl) {
    return res.status(400).send({ error: true, message: "Original URL required" });
  }

  let iClickCount = 0;

  let iInserID = await models.InsertShortUrl(iClientID, sOriginalUrl, urlCode, iClickCount);

  const shortUrl = `${process.env.BASE_URL}/${iClientID}/${urlCode}`;

  if(iInserID > 0){
    return{
      success: true,
      short_url: shortUrl
    };
  }else{
    return{
      error: true,
      message: "Error while creating url"
    };
  }
}

async function getUrlAndIncrementClick(iClientID, shortCode) {

  // Basic validation
  // if (iClientID <= 0) {
  //   return { error: true, error_code: 400, message: "Invalid client ID" };
  // }

  // if (!shortCode) {
  //   return { error: true, error_code: 400, message: "Original URL required" };
  // }

  const originalUrl = await models.getUrlAndIncrementClick(iClientID, shortCode);

  return originalUrl;
}


export{
  generateAndSaveURl,
  getUrlAndIncrementClick
}