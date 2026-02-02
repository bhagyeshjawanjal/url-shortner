import connectionPromise from "../Db_conn/db_conn.js";

async function getClientByClientKey(sClientKey) {

    try {
        const connection = await connectionPromise;
        const [results, fields] = await connection.execute(
            'SELECT * FROM `service_clients` WHERE client_key = ?',
            [sClientKey]
        );
        return results[0];
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function getClientDetailsByID(iClientID) {

    try {
        const connection = await connectionPromise;
        const [results, fields] = await connection.execute(
            'SELECT client_key, client_secret FROM `service_clients` WHERE client_id = ?',
            [iClientID]
        );
        return results[0];
    } catch (err) {
        console.log(err);
        return false;
    }
}
async function getClientDetails() {

    try {
        const connection = await connectionPromise;
        const [results, fields] = await connection.execute(
            'SELECT client_id, name, callback_url FROM `service_clients` WHERE status = 1'
        );
        return results;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function addClientDetails(aClientRequest) {

    const dAddedOn = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        const connection = await connectionPromise;
        const [result] = await connection.execute(
            'INSERT INTO `service_clients` (name, client_key, client_secret, callback_url, added_on, added_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                aClientRequest.client_name,
                aClientRequest.client_key,
                aClientRequest.client_secret,
                aClientRequest.callback_url,
                dAddedOn,
                0,
                1
            ]
        );
        return result.insertId;
    } catch (error) {
        // Handle error
        console.error('Error executing query:', error);
        return false;
    }
}

export {
    addClientDetails,
    getClientDetailsByID,
    getClientByClientKey,
    getClientDetails
};