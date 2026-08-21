import connectionPromise from "../Db_conn/db_conn.js";

async function InsertShortUrl(clientId=0, sOriginalUrl, sShortUrl, iClickCount=0) {

    const dAddedOn = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        const connection = await connectionPromise;

		const query = `
		    INSERT INTO mxcel_short_urls 
		    (client_id, original_url, short_code, click_count, created_at) 
		    VALUES (?, ?, ?, ?, ?)
		`;

		const params = [clientId, sOriginalUrl, sShortUrl, iClickCount, dAddedOn];

		const [result] = await connection.execute(query, params);

		return result.insertId;

    } catch (error) {

        // A duplicate short_code is expected occasionally and is retryable by the
        // caller, so it must be distinguishable from a real DB failure.
        if (error.code === 'ER_DUP_ENTRY') {
            error.duplicate = true;
            throw error;
        }

        // Handle error
        console.error('Error executing query:', error);
        return false;
    }
}

async function getUrlByShortCode(clientId, shortCode) {

  const connection = await connectionPromise;

  const selectQuery = `
    SELECT id, original_url
    FROM mxcel_short_urls
    WHERE client_id = ? AND short_code = ?
    LIMIT 1
  `;

  const [rows] = await connection.execute(selectQuery, [clientId, shortCode]);

  if (rows.length === 0) {
    return null; // not found
  }

  return { id: rows[0].id, original_url: rows[0].original_url };
}

/**
 * Applies buffered click counts in one statement.
 * aCounts is a Map of url id -> number of clicks to add.
 */
async function incrementClickCounts(aCounts) {

  if (!aCounts || aCounts.size === 0) {
    return;
  }

  const aIds = [...aCounts.keys()];

  // UPDATE ... CASE id WHEN ? THEN ? ... so the whole batch is a single round trip.
  const sCases = aIds.map(() => 'WHEN ? THEN click_count + ?').join(' ');
  const sPlaceholders = aIds.map(() => '?').join(', ');

  const updateQuery = `
    UPDATE mxcel_short_urls
    SET click_count = CASE id ${sCases} ELSE click_count END
    WHERE id IN (${sPlaceholders})
  `;

  const aParams = [];
  for (const iId of aIds) {
    aParams.push(iId, aCounts.get(iId));
  }
  aParams.push(...aIds);

  const connection = await connectionPromise;

  await connection.execute(updateQuery, aParams);
}

export{
	InsertShortUrl,
	getUrlByShortCode,
	incrementClickCounts
}