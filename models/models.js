import connectionPromise from "../Db_conn/db_conn.js";

async function InsertShortUrl(clientId=0, sOriginalUrl, sShortUrl, iClickCount=0) {

    const dAddedOn = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        const connection = await connectionPromise;

		const query = `
		    INSERT INTO short_urls 
		    (client_id, original_url, short_code, click_count, created_at) 
		    VALUES (?, ?, ?, ?, ?)
		`;

		const params = [1, sOriginalUrl, sShortUrl, iClickCount, dAddedOn];

		const [result] = await connection.execute(query, params);

		return result.insertId;

    } catch (error) {
        // Handle error
        console.error('Error executing query:', error);
        return false;
    }
}

async function getUrlAndIncrementClick(clientId, shortCode) {

  const connection = await connectionPromise;

  const selectQuery = `
    SELECT id, original_url
    FROM short_urls
    WHERE client_id = ? AND short_code = ?
    LIMIT 1
  `;

  const [rows] = await connection.execute(selectQuery, [clientId, shortCode]);

  if (rows.length === 0) {
    return null; // not found
  }

  const urlId = rows[0].id;
  const originalUrl = rows[0].original_url;

  const updateQuery = `
    UPDATE short_urls
    SET click_count = click_count + 1
    WHERE id = ?
  `;

  await connection.execute(updateQuery, [urlId]);

  return {original_url:originalUrl};
}

export{
	InsertShortUrl,
	getUrlAndIncrementClick
}