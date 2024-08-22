import { DbConnection } from "../dbConnection/dbConnection";
import { ConnectionError, OpenDbError, InputError } from "../utils/error";
export class Connection {

    constructor() {
        // attributes 
        this.connectionAllowed = null;

        // methods
        this._canConnect();

        // logic 
        if (!this.connectionAllowed) throw new ConnectionError('IndexedDb not supported.');
    }

    /**
    * Can connect with indexedDb or not. 
    */
    _canConnect() {
        if ('indexedDB' in window) this.connectionAllowed = true;
        else this.connectionAllowed = false;

    }

    /** 
    * Get all of the available databases inside indexedDb.
    * 
    * @returns {Promise<Array<{name: string, version: number}>>}
    */
    async _getAllDbs() {
        try {
            const dbs = await indexedDB.databases();
            return dbs;
        } catch (error) {
            return []
        }
    }

    /**
    * Helper method for opening a db.
    * 
    * @returns {Promise<{dbName: string,msg: string,_dbVersion: number}>}
    */
    async _openDbHelper(dbName) {
        // Checking db already exist or not 
        const dbs = await this._getAllDbs();
        for (const dbObj of dbs) {
            if (dbObj.name === dbName) {
                const dbConnection = new DbConnection({ dbName, dbVersion: dbObj.version });
                return Object.assign(dbConnection, { msg: 'Db already exists.' });
            };
        };

        // Ceating a db
        const dbVersion = 1
        return new Promise((resolve, reject) => {
            const dbCreationRequest = indexedDB.open(dbName, dbVersion);
            dbCreationRequest.onsuccess = (e) => {
                const dbConnection = new DbConnection({ dbName, dbVersion });
                resolve(Object.assign(dbConnection, { msg: 'Db created.' }));
                const db = e.target.result;
                db.close();
            };
            dbCreationRequest.onerror = (e) => {
                reject(new OpenDbError(`Db creation failed.\n${e.target.error}`));
            };
        });
    };

    /**
    * Opens a database. If the database exists, it opens it; otherwise, it creates the database and then opens it. 
    * 
    * @param {string} dbName - The name of db.
    * 
    * @returns {Promise<{dbName: string,msg: string,_dbVersion: number}>}
    */
    async openDb(dbName) {
        if (!dbName || typeof dbName !== 'string') return Promise.reject(new InputError('Invalid dbName specified.'));
        return this._openDbHelper(dbName);
    }

    /**
    * Deletes a db.
    * 
    * @param {string} dbName - The name of db.
    * 
    * @returns {Promise<{dbName: string | null,msgmsg: string,success: boolean}>}  The db will be deleted only,if it is not connected(opened).
    */
    async deleteDb(dbName) {
        if (!dbName || typeof dbName !== 'string') return { dbName: null, msg: 'Invalid dbName specified.', success: false };

        const dbs = await this._getAllDbs();
        const isDbExists = dbs.some(dbObj => dbObj.name === dbName);
        let dbDeletionResult;
        try {
            if (isDbExists) {
                dbDeletionResult = await new Promise(async (resolve, reject) => {
                    const dbDeletionRequest = await indexedDB.deleteDatabase(dbName);
                    dbDeletionRequest.onsuccess = (e) => resolve({ dbName: dbName, msg: 'Db deleted successfully.', success: true });
                    dbDeletionRequest.onerror = (e) => reject({ dbName: null, msg: `Db deletion failed.\n${e.target.error}`, success: false });
                });
            } else {
                dbDeletionResult = { dbName: dbName, msg: 'Db not exists.', success: false };
            };
        } catch (error) {
            dbDeletionResult = { dbName: null, msg: `Db deletion failed.\n${error}`, success: false };
        };
        return dbDeletionResult;
    }

};