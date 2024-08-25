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
    * @param {string} dbName - The name of the db.
    * 
    * @returns {Promise<{dbConnection: DbConnection, msg: string}>}  A promise that resolves with an object containing an instance of DbConnection and a message.
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
    * @returns {Promise<{dbConnection: DbConnection, msg: string}>}  A promise that resolves with an object containing an instance of DbConnection and a message.
    */
    async openDb(dbName) {
        if (!dbName || typeof dbName !== 'string') throw new InputError('Invalid dbName specified.');
        return this._openDbHelper(dbName);
    }

    /**
    * Deletes a db.
    * 
    * Note: Don’t try to delete the database if any vectorBlock is still open.
    * 
    * Before deleting the database, make sure the vectorBlock is closed.
    * 
    * @param {string} dbName - The name of db.
    * 
    * @returns {Promise<{msg:string}>} 
    * 
    * @example
    * 
    * case-1(when vectorBlock is opened)
    * 
    * const connection = new Connection();
    * const dbConnection = await connection.openDb('test');
    * const vectorBlockConnection = await dbConnection.openVectorBlock('t1');
    * // first close the open vectorBlock.
    * console.log(dbConnection.closeVectorBlock());
    * // then delete the db.
    * console.log(await connection.deleteDb('test'));
    * 
    * case-2(when no vectorBlock is opened)
    * 
    * const connection = new Connection();
    * const dbConnection = await connection.openDb('test');
    * console.log(await connection.deleteDb('test'));
    */
    async deleteDb(dbName) {
        if (!dbName || typeof dbName !== 'string') throw new ConnectionError('Invalid dbName specified.');

        const dbs = await this._getAllDbs();
        const isDbExists = dbs.some(dbObj => dbObj.name === dbName);
        if (!isDbExists) throw new ConnectionError('The db deletion failed.No specified db exists.');
        return new Promise((resolve, reject) => {
            const dbDeletionRequest = indexedDB.deleteDatabase(dbName);
            dbDeletionRequest.onsuccess = (e) => resolve({ msg: 'Db deleted successfully.' });
            dbDeletionRequest.onerror = (e) => reject(new ConnectionError(`Db deletion failed.${e.target.error.message}`));
        });
    };
};