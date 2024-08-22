import { InputError, OpenVectorBlockError, ConfigBlockError } from "../utils/error";
import { VectorBlockConnection } from "../vectorBlockConnection/vectorBlockConnection";
export class DbConnection {
    constructor({ dbName, dbVersion }) {
        this.dbName = dbName;
        this._dbVersion = dbVersion;
        this.vectorBlockOpened = false;
        this._db == null;
    }


    /**
    * Checks vectorBlock exists or not..
    *
    * @param {string} vectorBlockName - The name of vectorBlock.
    * 
    * @returns
    */
    async _checkVectorBlockExistence(vectorBlockName) {
        try {
            const result = await new Promise((resolve, reject) => {
                const dbOpenRequest = indexedDB.open(this.dbName, this._dbVersion);
                dbOpenRequest.onsuccess = (e) => {
                    const db = e.target.result;
                    if (db.objectStoreNames.contains(vectorBlockName)) resolve({ db, vectorBlockName, msg: 'VectorBlock already exists.', success: true });
                    else {
                        db.close();
                        reject('')
                    };
                    // db.close();
                };
                dbOpenRequest.onerror = () => reject('');
            });
            return result;
        } catch (error) {
            return {};
        };
    };

    /**
    * Opens a config block.
    *     
    * @param {IDBDatabase} db - The db instance.
    * 
    * @returns {Boolean}  true,if configBlock is opened.
    */
    _openConfigBlock(db) {
        if (db.objectStoreNames.contains('configBlock')) {
            return true;
        } else {
            try {
                const configBlock = db.createObjectStore('configBlock', { keyPath: 'vectorBlockName', autoIncrement: false });
                configBlock.createIndex('VectorDType', 'vectorDType', { unique: false });
                configBlock.createIndex('VectorDimension', 'vectorDimension', { unique: false });
                return true
            } catch (error) {
                return false;
            };
        };
    };

    /**
    * Creates a vectorBlock(objectStore in terms of indexedDb).
    * 
    * Note - You can only open a vectorBlock if no other vectorBlock is already open in the same database.
    * 
    * @param {string} vectorBlockName - The name of vectorBlock.
    * 
    * @returns {Promise<vectorBlockConnection,{msg:string}>}
    */
    async openVectorBlock(vectorBlockName) {
        if (!vectorBlockName || typeof vectorBlockName !== 'string') return Promise.reject(new InputError('Invalid vectorBlockName specified.'));

        if (this.vectorBlockOpened) throw new OpenVectorBlockError('VectorBlock creation failed. Another vectorBlock is already open');

        // checking vectorBlock already exists or not         
        const vectorBlockExistenceResult = await this._checkVectorBlockExistence(vectorBlockName);
        if (vectorBlockExistenceResult.success) {
            const vectorBlockConnection = new VectorBlockConnection({ dbName: this.dbName, db: vectorBlockExistenceResult.db, vectorBlockName });
            this.vectorBlockOpened = true;
            this._db = vectorBlockExistenceResult.db;
            return (Object.assign(vectorBlockConnection, { msg: vectorBlockExistenceResult.msg }))
        };

        this._dbVersion += 1;
        let vectorBlock;
        let isConfigBlockexists = false;
        return new Promise((resolve, reject) => {
            const dbOpenRequest = indexedDB.open(this.dbName, this._dbVersion);
            dbOpenRequest.onupgradeneeded = (e) => {
                const db = e.target.result;
                // Opening a configBlock 
                isConfigBlockexists = this._openConfigBlock(db);
                // Creating a vectorBlock
                try {
                    vectorBlock = db.createObjectStore(vectorBlockName, { keyPath: 'index', autoIncrement: false });
                    vectorBlock.createIndex('text', 'text', { unique: false });
                    vectorBlock.createIndex('buffer', 'buffer', { unique: false });
                    vectorBlock.createIndex('metadata', 'metadata', { unique: false });
                } catch (error) {
                    reject(new OpenVectorBlockError(`VectorBlock creation failed.Note vectorBlock = objectStore.\n${error.message}`));
                };
            };
            dbOpenRequest.onsuccess = (e) => {
                const db = e.target.result;
                if (!isConfigBlockexists) return reject(new ConfigBlockError('ConfigBlock Creation failed.'))
                if (vectorBlock) {
                    const vectorBlockConnection = new VectorBlockConnection({ dbName: this.dbName, db, vectorBlockName });
                    resolve(Object.assign(vectorBlockConnection, { msg: 'VectorBlock created.' }));
                    this.vectorBlockOpened = true;
                    this._db = db;
                };
            };
            dbOpenRequest.onerror = (e) => reject(new OpenVectorBlockError(`VectorBlock creation failed.Note vectorBlock = objectStore.${e.target.error.message}`));
        });
    };

    /**
    * Closes the Opened vectorBlock.
   */
    closeVectorBlock() {
        if (this._db) {
            this._db.close();
            this.vectorBlockOpened = false;
            this._db = null;
            return {msg:'Vector Block is closed'}
        } else throw new Error('Closing vectorBlock failed.No opened vectorBlock found.');
    };

    async deleteVectorBlock(vectorBlockName) {

    };
};