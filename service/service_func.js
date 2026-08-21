import * as models from "../models/models.js";
import * as clickBuffer from "./click_buffer.js";
import { randomInt } from "node:crypto";
import dotenv from "dotenv";

const CODE_LENGTH = 6;

// How many times a duplicate code is regenerated before giving up.
const MAX_INSERT_ATTEMPTS = 5;

function generateShortCode(length = CODE_LENGTH) {

  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = "";

  for (let i = 0; i < length; i++) {
    const index = randomInt(chars.length);
    code += chars[index];
  }

  return code;
}

async function generateAndSaveURl(req, res){

  var aErrorResponse = {'error' : true, 'error_code' : 400};

  let iClientID = req.iClientID ?? 0;
  let sOriginalUrl = req.sOriginalUrl ?? '';

  if (!sOriginalUrl) {
    return res.status(400).send({ error: true, message: "Original URL required" });
  }

  let iClickCount = 0;

  for (let iAttempt = 0; iAttempt < MAX_INSERT_ATTEMPTS; iAttempt++) {

    let urlCode = generateShortCode();
    let iInserID;

    try {
      iInserID = await models.InsertShortUrl(iClientID, sOriginalUrl, urlCode, iClickCount);
    } catch (error) {
      if (error.duplicate) {
        continue; // code already taken for this client, generate another one
      }
      throw error;
    }

    if (iInserID > 0) {
      return{
        success: true,
        short_url: `${process.env.BASE_URL}/${iClientID}/${urlCode}`
      };
    }

    break; // insert failed for a non-retryable reason
  }

  return{
    error: true,
    message: "Error while creating url"
  };
}

async function getUrlAndIncrementClick(iClientID, shortCode) {

  // Basic validation
  if (iClientID <= 0) {
    return { error: true, error_code: 400, message: "Invalid client ID" };
  }

  if (!shortCode) {
    return { error: true, error_code: 400, message: "Original URL required" };
  }

  const oUrl = await models.getUrlByShortCode(iClientID, shortCode);

  if (!oUrl) {
    return { error: true, error_code: 404, message: "Short URL not found" };
  }

  // Counted in memory and flushed in batches, so the redirect isn't blocked on a write.
  clickBuffer.record(oUrl.id);

  return { original_url: oUrl.original_url };
}


export{
  generateShortCode,
  generateAndSaveURl,
  getUrlAndIncrementClick
}