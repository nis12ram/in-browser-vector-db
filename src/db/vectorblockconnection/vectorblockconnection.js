import { Operations } from "../operations/operations";
import { DbUtils } from "../utils/dbutils";
import { ConfigBlockError, InputError, TransactionError } from "../utils/error";
import { vectorDTypes } from "../utils/vectordtypes";
import { isInteger, isString, isObject, isArray } from 'lodash'
export class VectorBlockConnection {
    constructor({ vectorBlockName, dbName, db }) {
        // attributes
        this.vectorBlockName = vectorBlockName;
        this.dbName = dbName;
        this._db = db;
        this.vectorDType = null;
        this.vectorDimension = null;
        this.operations = null;
        this.vectorBlockConfigured = false;
    };

    /**
    * Initializes the Operations class instance.
    */
    _initOperations() {
        if (this.vectorDType && this.vectorDimension) this.operations = new Operations({ db: this._db, vectorBlockName: this.vectorBlockName, vectorDType: this.vectorDType, vectorDimension: this.vectorDimension });
    }


    /**
    * Initializes the transaction process for configBlock.
    * 
    * @param {string} transactionMode - The mode in which transaction will be intialized.
    * 
    * @returns {{transaction:IDBTransaction,configBlock:IDBObjectStore}} 
    */
    _initTransactionForConfigBlock(transactionMode = 'readwrite') {
        try {
            const transaction = this._db.transaction('configBlock', transactionMode);
            const configBlock = transaction.objectStore('configBlock');
            return ({ transaction, configBlock })
        } catch (error) {
            throw new TransactionError(`Transaction initialization failed.Note configBlock = objectStore.${error.message}`)
        }
    };



    /**
    * Loades the stored vectorBlock configuration.
    * 
    * @returns {Boolean} returns true if the vectorBlock configuration is loaded.
    */
    async _loadVectorBlockConfiguration() {
        const { transaction, configBlock } = this._initTransactionForConfigBlock();
        return new Promise((resolve, reject) => {
            const request = configBlock.get(this.vectorBlockName);
            request.onsuccess = (e) => {
                const result = e.target.result;
                if (result) {
                    if (result.vectorDType && result.vectorDimension) {
                        this.vectorDType = result.vectorDType;
                        this.vectorDimension = result.vectorDimension;
                        this._initOperations();

                        this.vectorBlockConfigured = true;
                        resolve(true);
                    } else reject('');
                } else reject('')
            };
            request.onerror = () => reject('');
        }).catch(() => undefined);
    };

    /**
    * Verifies the specified vector details with configured details.
    * 
    * @param {number} specifiedVectorDimension
    * @param {string} specifiedVectorDType
    * 
    * @returns {Boolean} returns true if sepcified configuration is same as stored configuration.
    */
    _verifyVectorBlockConfiguration({ specifiedVectorDimension, specifiedVectorDType }) {
        if (this.vectorDType && this.vectorDimension && this.operations) {
            if (((this.vectorDType === specifiedVectorDType) && (this.vectorDimension === specifiedVectorDimension))) return true;
            else throw new ConfigBlockError(`Stored vectorBlock configuration not matches with the specified vectorBlock configuration.Stored vectorBlock configuration: vectorDType=${this.vectorDType}, vectorDimension=${this.vectorDimension}}.Specified vectorBlock configuration: vectorDType=${specifiedVectorDType}, vectorDimension=${specifiedVectorDimension}}`)
        }
    }

    /**
    * Store the vectorBlock configuration inside configBlock.
    */
    _storeVectorBlockConfiguration() {
        const { transaction, configBlock } = this._initTransactionForConfigBlock();
        const request = configBlock.put({
            vectorBlockName: this.vectorBlockName,
            vectorDType: this.vectorDType,
            vectorDimension: this.vectorDimension
        });
        request.onsuccess = (e) => {
            if (this.vectorBlockName === e.target.result) undefined;
            else throw new ConfigBlockError('Storing vectorBlock configuration failed.');
        };
        request.onerror = (e) => {
            throw new ConfigBlockError(`Storing vectorBlock configuration failed.${e.target.error} `);
        };
    };

    /**
    * Sets up the vectorBlock with the provided configuration.
    * If the vectorBlock is already configured, it loads the stored configurations and checks that it matches with the specified one..
    * If not stored, it applies the new configuration and saves them.
    * 
    * Note - The configuration will be applied only once to the VectorBlock and cannot be modified.
    * 
    * This configuration process includes:
    * 1. Setting the data type of the vectors (vectorDType).
    * 2. Setting the dimension of the vectors (vectorDimension).
    * 3. Initializing necessary operations (_initOperations).
    * 
    * @param {number} vectorDimension - The dimension of the vectors.
    * 
    * @param {string} vectorDType - The data type of the vectors.
    * 
    * @returns {Promise<{msg:string}>} 
    */
    async configureVectorBlock({ vectorDimension, vectorDType, forceCreate = false }) {
        if (!isInteger(vectorDimension)) throw new InputError('Invalid vectorDimension specified.VectorDimension should be integer.');
        if (!isString(vectorDType)) throw new InputError('Invalid vectorDType specified.vectorDType should be string.');
        if (!DbUtils.hasKey(vectorDTypes, vectorDType)) throw new InputError(`Invalid vectorDType specified.VectorDType should be one from ${Object.keys(vectorDTypes)} .`);

        const loadProcessResult = await this._loadVectorBlockConfiguration();
        const verifyProcessResult = this._verifyVectorBlockConfiguration({ specifiedVectorDimension: vectorDimension, specifiedVectorDType: vectorDType });
        if (loadProcessResult && verifyProcessResult) return { msg: 'Configuration loaded and verified.' };

        if (!this.vectorBlockConfigured) {
            this.vectorDimension = vectorDimension;
            this.vectorDType = vectorDType;
            this._initOperations();

            this.vectorBlockConfigured = true;
            this._storeVectorBlockConfiguration();
            return { msg: 'Configuration applied and stored.' };
        };
    };


};