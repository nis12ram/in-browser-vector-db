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
    * If already a vectorBlock is opened then you first need to close it using closeVectorBlock() and the open the new one.
    * 
    * 
    * @param {string} vectorBlockName - The name of vectorBlock.
    * 
    * @returns {Promise<{vectorBlockConnection: VectorBlockConnection, msg: string}>}  A promise that resolves with an object containing an instance of VectorBlockConnection and a message.
    */
    async openVectorBlock(vectorBlockName) {
        if (!vectorBlockName || typeof vectorBlockName !== 'string') throw new InputError('Invalid vectorBlockName specified.');

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
                    throw new new OpenVectorBlockError(`VectorBlock creation failed.Note vectorBlock = objectStore.\n${error.message}`);
                };
            };
            dbOpenRequest.onsuccess = (e) => {
                const db = e.target.result;
                if (!isConfigBlockexists) throw new ConfigBlockError('ConfigBlock Creation failed.');
                if (vectorBlock) {
                    const vectorBlockConnection = new VectorBlockConnection({ dbName: this.dbName, db, vectorBlockName });
                    resolve(Object.assign(vectorBlockConnection, { msg: 'VectorBlock created.' }));
                    this.vectorBlockOpened = true;
                    this._db = db;
                };
            };
            dbOpenRequest.onerror = (e) => { throw new OpenVectorBlockError(`VectorBlock creation failed.Note vectorBlock = objectStore.${e.target.error.message}`) };
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
            return { msg: 'Vector Block is closed' }
        } else throw new Error('Closing vectorBlock failed.No opened vectorBlock found.');
    };

    /**
    * Deletes a vectorBlock.
    *      
    * @param {string} vectorBlockName - The name of vectorBlock.
    * 
    * @returns {Promise<{msg:string}>}  
    * 
    * @example
    * const connection = new Connection();
    * const dbConnection = await connection.openDb('test');
    * console.log(await dbConnection.deleteVectorBlock('t1'));
    */
    async deleteVectorBlock(vectorBlockName) {
        if (!vectorBlockName || typeof vectorBlockName !== 'string') throw new InputError('Invalid vectorBlockName specified.');

        if (this.vectorBlockOpened) {
            try {
                this.closeVectorBlock();
            } catch (error) {
                // No open VectorBlock  is found.
            };
        };

        const vectorBlockExistenceResult = await this._checkVectorBlockExistence(vectorBlockName);
        if (vectorBlockExistenceResult.success) {
            vectorBlockExistenceResult.db.close();
            this._dbVersion += 1;
            return new Promise((resolve, reject) => {
                const dbOpenRequest = indexedDB.open(this.dbName, this._dbVersion);
                dbOpenRequest.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    // Deleting vectorBlock
                    try {
                        db.deleteObjectStore(vectorBlockName);
                    } catch (error) {
                        reject(new Error(`VectorBlock deletion failed.Note vectorBlock = objectStore.${error.message}`));
                    };
                };
                dbOpenRequest.onsuccess = (e) => {
                    const db = e.target.result;
                    const transaction = db.transaction('configBlock', 'readwrite');
                    // Deleting vectorBlock configuration details.
                    const deleteVectorBlockConfigDetailsRequest = transaction.objectStore('configBlock').delete(vectorBlockName);
                    deleteVectorBlockConfigDetailsRequest.onsuccess = () => {
                        resolve({ msg: 'VectorBlock deleted sucessfully.' });
                        db.close();
                    };
                    deleteVectorBlockConfigDetailsRequest.onerror = (e) => reject(new Error(`VectorBlock deletion failed.Note vectorBlock = objectStore.${e.target.error.message}`));
                };
                dbOpenRequest.onerror = (e) => reject(new OpenVectorBlockError(`VectorBlock deletion failed.Note vectorBlock = objectStore.${e.target.error.message}`));
            });
        } else throw new Error('VectorBlock deletion failed.The vectorBlock do not exists.');
    };
};