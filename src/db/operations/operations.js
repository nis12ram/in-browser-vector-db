// import { vectorDTypes } from "../utils/vectordtypes"
import { OperationsUtils } from "./operationsutils"
import { DbUtils } from "../utils/dbutils";
import { InputError, OperationsError, TransactionError } from "../utils/error";
import { isInteger, isString, isObject, isArray } from 'lodash'
export class Operations {
    constructor({ vectorBlockName, db, vectorDType, vectorDimension }) {
        this._db = db;
        this.vectorBlockName = vectorBlockName;
        this.vectorDType = vectorDType;
        this.vectorDimension = vectorDimension;
    }

    /**
    * Initialize the transaction process for vectorBlock.
    * 
    * @param {string} transactionMode - The mode in which transaction will be intialized.
    * 
    * @returns {{transaction:IDBTransaction,vectorBlock:IDBObjectStore}} 
    */
    _initTransaction(transactionMode = 'readwrite') {
        try {
            const transaction = this._db.transaction(this.vectorBlockName, transactionMode);
            const vectorBlock = transaction.objectStore(this.vectorBlockName);
            return ({ transaction, vectorBlock })
        } catch (error) {
            throw new TransactionError(`Transaction initialization failed.${error.message}`)
        }
    };

    /**
    * Template for setting up the transaction in the opertaion methods.
    * 
    * @param {Object} internal - Internal arguments.
    * 
    * @returns {{transaction:IDBTransaction,vectorBlock:IDBObjectStore}} 
    */
    _transactionTemplate(internal) {
        let transaction;
        let vectorBlock;
        if (internal.useParentTransaction) {
            transaction = internal.transaction;
            vectorBlock = internal.vectorBlock;
        } else {
            const initTransactionResult = this._initTransaction();
            transaction = initTransactionResult.transaction;
            vectorBlock = initTransactionResult.vectorBlock;
        };
        return { transaction, vectorBlock };
    };

    /**
    * Verifies the specified vector.
    * Verification process works on two parts--
    * 1 matches the dimension of specified vector with configured dimension.
    * 2 matches the dType of specified vector with configured dType.
    * 
    * @param {Array} vector - The specified vector..
    */
    _verifyVector(vector) {
        const dimesnionResult = OperationsUtils.isVectorDimensionMatches({ vector, dimension: this.vectorDimension })
        if (!dimesnionResult) throw new OperationsError(`Invalid vector dimension specified.Specified vector dimension:${vector.length}.Configured vector dimension:${this.vectorDimension}`);
        const dTypeResult = OperationsUtils.isVectorDTypeMatches({ vector, dType: this.vectorDType });
        if (!dTypeResult) throw new OperationsError(`Invalid vector dType specified.Configured vector dType:${this.vectorDType}`);
    }



    /**
    * Checks whether any entry is already inserted with the specified index or not.
    * 
    * @param {number} index - the index to check for.
    * @param {Object} internal - Internal arguments.
    * 
    * @returns {Promise<boolean>} - true if index alreday exists,otherwise false.
    */
    async _checkIndexExist(index, internal = {}) {
        if (!isInteger(index)) throw new InputError('Invalid index specified.Index should be integer.');

        const { transaction, vectorBlock } = this._transactionTemplate(internal);
        return new Promise((resolve, reject) => {
            const request = vectorBlock.count(index);
            request.onsuccess = (e) => {
                if (e.target.result > 0) resolve(true);
                else resolve(false);
            };
            request.onerror = () => resolve(false);
        });
    };

    /**
    * Adds a single entry to the database.
    * If the index is already there, it just returns a message like: 'Insert already done at index: _.'
    * If the index is new, it adds the entry and returns a message like: 'Insert done at index: _.'
    * 
    * @param {number} index - The position where the entry is stored.
    * @param {string} text - The text content of the entry.
    * @param {Array} vector - The vector data for the entry.
    * @param {Object} metadata - Additional information about the entry.
    * @param {Object} internal - Internal arguments.
    * 
    * @returns {Promise<{msg:string}>} 
    */
    async insert({ index, text, vector, metadata = {} }, internal = {}) {
        if (!isInteger(index)) throw new InputError('Invalid index specified.Index should be integer.');
        if (!isString(text)) throw new InputError('Invalid text specified.Text should be string.');
        if (!isArray(vector)) throw new InputError('Invalid vector specified.Vector should be array.');
        if (!isObject(metadata)) throw new InputError('Invalid metadata specified.Metadata should be object.');

        const { transaction, vectorBlock } = this._transactionTemplate(internal);

        const isIndexExist = await this._checkIndexExist(index, { useParentTransaction: true, transaction, vectorBlock });
        if (isIndexExist) return { msg: `Insert operation passed.Insert is already perfomed at index: ${index}` };

        this._verifyVector(vector);

        const readableEntry = { index, text, vector, metadata };
        const dbEntry = OperationsUtils.convertReadableEntryToDbEntry({ readableEntry, vectorDType: this.vectorDType });
        return new Promise((resolve, reject) => {
            const request = vectorBlock.add(dbEntry);
            request.onsuccess = (e) => {
                if (index === e.target.result) resolve({ msg: `Insert is perfomed at index: ${index}` });
                else reject(new OperationsError(`Insert operation failed.`));
            };
            request.onerror = (e) => {
                reject(new OperationsError(`Insert operation failed.Note vectorBlock = ObjectStore.${e.target.error.message}`));
                console.log(e.target.error);
            };
        });
    };

    /**
    * Adds multiple entries to the database.
    * If the index is already there, it just returns a message like: 'Insert already done at index: _.'
    * If the index is new, it adds the entry and returns a message like: 'Insert done at index: _.'
    * 
    * @param {Array<number>} indices - An array of positions where the entries are stored.
    * @param {Array<string>} texts - An array of text content for each entry.
    * @param {Array<Array>} vectors - An array containing the vector data for each entry.
    * @param {Array<Object>} metadataArray - An array of objects containing additional information about each entry.
    * @param {Object} internal - Internal arguments.
    * 
    * @returns {Promise<Array<{msg:string}>>} 
    */
    async insertMany({ indices, texts, vectors, metadataArray = [] }, internal = {}) {
        if (!isArray(indices)) throw new InputError('Invalid indices specified.Indices should be array.');
        if (!isArray(texts)) throw new InputError('Invalid texts specified.Texts should be array.');
        if (!isArray(vectors)) throw new InputError('Invalid vectors specified.Vectors should be array.');
        if (!isArray(metadataArray)) throw new InputError('Invalid metadata specified.Metadata should be array.');

        if (metadataArray.length === 0) metadataArray = DbUtils.createEmptyObjectsArray(indices.length);

        const lengthResult = DbUtils.arraysHaveEqualLengths(indices, texts, vectors, metadataArray);
        if (!lengthResult) throw new InputError('Invalid inputs specified.All inputs should have same length.');

        const { transaction, vectorBlock } = this._transactionTemplate(internal);
        const insertManyResult = [];
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            const text = texts[i];
            const vector = vectors[i];
            const metadata = metadataArray[i];
            const insertResult = await this.insert({ index, text, vector, metadata }, { useParentTransaction: true, transaction, vectorBlock });
            insertManyResult.push(insertResult);
        };
        return insertManyResult;
    };

    /**
    * Retrieve the readable entry based on the index.
    * 
    * @param {number} index - the index of the entry.
    * @param {Object} internal - Internal arguments.
    * 
    * @returns {Promise<{index:number,text:string,vector:Array,metadata:Object}>} - Retrieved readable entry.
    */
    async getByIndex(index, internal = {}) {
        if (!isInteger(index)) throw new InputError('Invalid index specified.Index should be integer.');

        const { transaction, vectorBlock } = this._transactionTemplate(internal);
        return new Promise((resolve, reject) => {
            const request = vectorBlock.get(index);
            request.onsuccess = (e) => {
                if (e.target.result) {
                    const dbEntry = e.target.result;
                    const readableEntry = OperationsUtils.convertDbEntryToReadableEntry({ dbEntry, vectorDType: this.vectorDType });
                    resolve(readableEntry);
                } else reject(new OperationsError(`GetByIndex operation failed.Index ${index} not matches.`))
            };
            request.onerror = (e) => reject(new OperationsError(`GetByIndex operation failed.Note vectorBlock = objectStore.${e.target.error.message}`));
        });
    };

    /**
    * Retrieve the readable entries based on the indices.
    * 
    * @param {array} indices - the indices of the entries.
    * @param {Object} internal - Internal arguments.
    * 
    * @returns {Promise<Array<{index:number,text:string,vector:Array,metadata:Object}>>} - Retrieved readable entries.
    */
    async getByIndices(indices, internal = {}) {
        if (!isArray(indices)) throw new InputError('Invalid indices specified.Indices should be array.');

        const { transaction, vectorBlock } = this._transactionTemplate(internal);
        const getByIndicesResult = [];
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            const getByIndexResult = await this.getByIndex(index, { useParentTransaction: true, transaction, vectorBlock });
            getByIndicesResult.push(getByIndexResult);
        };
        return getByIndicesResult;
    };

    /**
    * Updates a single existing entry in the db based on the specified index.
    * 1 If the index is not found, it just returns a message like: 'Index not matches...'.
    * 2 if the matchEntries algorithm find nothing to update , it just returns a message like: 'Update operation passed...'.
    * 3 If the index is found and their are something to update, it updates the entry and returns a message like: 'Update is perfomed at index: _'.
    * 
    * @param {number} index - The index of the entry to be updated. Must be an integer.
    * @param {Object} entry - The new data for the entry.
    * @param {string} entry.text - The text content for the entry.
    * @param {Array} entry.vector - The vector data for the entry.
    * @param {Object} entry.metadata - Additional information about the entry.
    * @param {Object} internal - Internal arguments.
    * 
    * @returns {Promise<{msg: string}>} - A message indicating the status of the update.
    */
    async update(index, { text, vector, metadata = {} }, internal = {}) {
        if (!isInteger(index)) throw new InputError('Invalid index specified.Index should be integer.');
        if (!isString(text)) throw new InputError('Invalid text specified.Text should be string.');
        if (!isArray(vector)) throw new InputError('Invalid vector specified.Vector should be array.');
        if (!isObject(metadata)) throw new InputError('Invalid metadata specified.Metadata should be object.');

        const { transaction, vectorBlock } = this._transactionTemplate(internal);

        const isIndexExist = await this._checkIndexExist(index, { useParentTransaction: true, transaction, vectorBlock });
        if (!isIndexExist) throw new InputError(`Index: ${index} not matches.Specified index should be already present in db.`);

        const alreadyStoredEntryToRead = await this.getByIndex(index, { useParentTransaction: true, transaction, vectorBlock });
        const newValuesEntryToRead = { index, text, vector, metadata };
        console.log(alreadyStoredEntryToRead);
        console.log(newValuesEntryToRead);
        const areEntriesMatches = OperationsUtils.matchEntries({ entry1: alreadyStoredEntryToRead, entry2: newValuesEntryToRead });
        if (areEntriesMatches) return { msg: `Update operation passed.The stored entry is the same as the entry given for the update, so there's nothing to update.` };

        this._verifyVector(vector);

        const newValuesentryToStore = OperationsUtils.convertReadableEntryToDbEntry({ readableEntry: newValuesEntryToRead, vectorDType: this.vectorDType });
        return new Promise((resolve, reject) => {
            const request = vectorBlock.put(newValuesentryToStore);
            request.onsuccess = (e) => {
                if (e.target.result === index) resolve({ msg: `Update is perfomed at index: ${index}` });
                else reject(new OperationsError('Update operation failed.'));
            };
            request.onerror = (e) => reject(new OperationsError(`Update operation failed.${e.target.error.message}`));
        });
    };

    /**
    * Updates multiple existing entries in the db based on the specified indices.
    * 1 If the index is not found, it just returns a message like: 'Index not matches...'.
    * 2 if the matchEntries algorithm find nothing to update , it just returns a message like: 'Update operation passed...'.
    * 3 If the index is found and their are something to update, it updates the entry and returns a message like: 'Update is perfomed at index: _'.
    * 
    * @param {Array<number>} indices - An array of positions where the entries are stored.
    * @param {Array<string>} texts - An array of text content for each entry.
    * @param {Array<Array>} vectors - An array containing the vector data for each entry.
    * @param {Array<Object>} metadataArray - An array of objects containing additional information about each entry.
    * @param {Object} internal - Internal arguments.
    * 
    * @returns {Promise<Array<{msg:string}>>} 
    */
    async updateMany(indices, { texts, vectors, metadataArray = [] }, internal = {}) {
        if (!isArray(indices)) throw new InputError('Invalid indices specified.Indices should be array.');
        if (!isArray(texts)) throw new InputError('Invalid texts specified.Texts should be array.');
        if (!isArray(vectors)) throw new InputError('Invalid vectors specified.Vectors should be array.');
        if (!isArray(metadataArray)) throw new InputError('Invalid metadata specified.Metadata should be array.');

        if (metadataArray.length === 0) metadataArray = DbUtils.createEmptyObjectsArray(indices.length);

        const lengthResult = DbUtils.arraysHaveEqualLengths(indices, texts, vectors, metadataArray);
        if (!lengthResult) throw new InputError('Invalid inputs specified.All inputs should have same length.');

        const { transaction, vectorBlock } = this._transactionTemplate(internal);
        const updateManyResult = [];
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            const text = texts[i];
            const vector = vectors[i];
            const metadata = metadataArray[i];
            const updateResult = await this.update(index, { text, vector, metadata }, { useParentTransaction: true, transaction, vectorBlock });
            updateManyResult.push(updateResult);
        };
        return updateManyResult;
    };

    /**
    * Deletes a single entry based on the specified index.
    * 
    * @param {number} index - The index of the entry to delete.
    * @param {Object} internal - Internal arguments.
    * 
    * @returns {Promise<{ msg: string }>} A promise that resolves to an object containing a message indicating the result of the deletion.
    */
    async deleteByIndex(index, internal = {}) {
        if (!isInteger(index)) throw new InputError('Invalid index specified.Index should be integer.');

        const { transaction, vectorBlock } = this._transactionTemplate(internal);

        const isIndexExist = await this._checkIndexExist(index, { useParentTransaction: true, transaction, vectorBlock });
        if (!isIndexExist) throw new InputError(`Index: ${index} not matches.Specified index should be already present in db.`);

        return new Promise((resolve, reject) => {
            const request = vectorBlock.delete(index);
            request.onsuccess = (e) => {
                if (!e.target.result) resolve({ msg: `Delete is perfomed at index: ${index}` });
                else reject(new OperationsError('Delete operation failed.'));
            };
            request.onerror = (e) => reject(new OperationsError(`Delete operation failed.${e.target.error.message}`));
        });
    };

    /**
    * Deletes multiple entries based on the specified indices.
    * 
    * @param {Array<number>} indices - An array of indices specifying the entries to delete.
    * @param {Object} internal - Internal arguments..
    * 
    * @returns {Promise<Array<{ msg: string }>>} A promise that resolves to an array of objects, each containing a message indicating the result of the deletion.
    */
    async deleteByIndices(indices, internal = {}) {
        if (!isArray(indices)) throw new InputError('Invalid indices specified.Indices should be array.');

        const { transaction, vectorBlock } = this._transactionTemplate(internal);
        const deleteByIndicesResult = [];
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            const deleteByIndexResult = await this.deleteByIndex(index, { useParentTransaction: true, transaction, vectorBlock });
            deleteByIndicesResult.push(deleteByIndexResult);
        };
        return deleteByIndicesResult;
    };

    async search() {

    }
};

