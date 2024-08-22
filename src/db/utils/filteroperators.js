import { isEqual, gt, isNumber, lt, gte, lte, isString, isBoolean, includes, isArray } from "lodash";
import { InputError } from "./error";
import { DbUtils } from "./dbUtils";

export const filterOperators = Object.freeze({
    $eq: equal,
    $ne: notEqual,
    $gt: greaterThen,
    $lt: lessThen,
    $gte: greaterThenOrEqual,
    $lte: lessThenOrEqual,
    $in: inside,
    $nin: NotInside,
});

/**
* Checks two values are equal or not.
*
* This method supports comparing arrays, strings, numbers, bools. .
* 
* @param {any} value1 - The value to compare(from metadata).
* @param {any} value2 - The value to compare against(from filterCondition).
* 
* @returns {Boolean} true if value1 and value2 are equal.otherwise false.
*/
function equal({ value1, value2 }) {
    if (!isString(value1) && !isBoolean(value1) && !isArray(value1) && !isNumber(value1)) throw new InputError('Filter operation $eq failed.Input should be one from string, number, array, bool only');
    if (!isString(value2) && !isBoolean(value2) && !isArray(value2) && !isNumber(value2)) throw new InputError('Filter operation $eq failed.Input should be one from string, number, array, bool only');
    return isEqual(value1, value2);
};

/**
* Checks two values are equal or not.
*
* This method supports comparing arrays, strings, numbers, bools. .
* 
* @param {any} value1 - The value to compare(from metadata).
* @param {any} value2 - The value to compare against(from filterCondition).
* 
* @returns {Boolean} true if value1 and value2 are not equal.otherwise false.
*/
function notEqual({ value1, value2 }) {
    if (!isString(value1) && !isBoolean(value1) && !isArray(value1) && !isNumber(value1)) throw new InputError('Filter operation $ne failed.Input should be one from string, number, array, bool only');
    if (!isString(value2) && !isBoolean(value2) && !isArray(value2) && !isNumber(value2)) throw new InputError('Filter operation $ne failed.Input should be one from string, number, array, bool only');
    return !equal({ value1, value2 });
};

/**
* Checks if value1 is greater then value2.
*
* This method supports comparing numbers.
* 
* @param {number} value1 - The value to compare(from metadata).
* @param {number} value2 - The value to compare against(from filterCondition).
* 
* @returns {Boolean} true if value1 is greater then value2.otherwise false.
*/
function greaterThen({ value1, value2 }) {
    if (!isNumber(value1) || !isNumber(value2)) throw new InputError('Filter operation $gt failed.Inputs should be number.');
    return gt(value1, value2);
};

/**
* Checks if value1 is less then value2.
*
* This method supports comparing numbers.
* 
* @param {number} value1 - The value to compare(from metadata).
* @param {number} value2 - The value to compare against(from filterCondition).
* 
* @returns {Boolean} true if value1 is less then value2.otherwise false.
*/
function lessThen({ value1, value2 }) {
    if (!isNumber(value1) || !isNumber(value2)) throw new InputError('Filter operation $lt failed.Inputs should be number.');
    return lt(value1, value2);
};

/**
* Checks if value1 is greater then or equal to value2.
*
* This method supports comparing numbers.
* 
* @param {number} value1 - The value to compare(from metadata).
* @param {number} value2 - The value to compare against(from filterCondition).
* 
* @returns {Boolean} true if value1 is greater then or equal to value2.otherwise false.
*/
function greaterThenOrEqual({ value1, value2 }) {
    if (!isNumber(value1) || !isNumber(value2)) throw new InputError('Filter operation $gte failed.Inputs should be number.');
    return gte(value1, value2);
};

/**
* Checks if value1 is less then or equal to value2.
*
* This method supports comparing numbers.
* 
* @param {number} value1 - The value to compare(from metadata).
* @param {number} value2 - The value to compare against(from filterCondition).
* 
* @returns {Boolean} true if value1 is less then or equal to value2.otherwise false.
*/
function lessThenOrEqual({ value1, value2 }) {
    if (!isNumber(value1) || !isNumber(value2)) throw new InputError('Filter operation $lte failed.Inputs should be number.');
    return lte(value1, value2);
};

/**
* Checks if value2 is inside value1.
*
* This method supports comparing  string, number, and bool.
* 
* @param {Array} value1 - The value to compare(from metadata).
* @param {any} value2 - The value to compare against(from filterCondition).
* 
* @returns {Boolean} true if value2 is inside value1.otherwise false.
*/
function inside({ value1, value2 }) {
    if (!isArray(value1)) throw new InputError('Filter operation $in failed.The value to compare against should be an array');

    const value2Type = typeof value2;
    if (!isString(value2) && !isNumber(value2) && isBoolean(value2)) throw new InputError('Filter operation $in failed.The supported data types are string, number and bool only.');

    const { isArrayHaveSingleType, type: value1ElementType } = DbUtils.arrayHaveSingleType(value1);
    if (isArrayHaveSingleType) {
        if (!isEqual(value2Type, value1ElementType)) throw new InputError(`Filter operation $in failed.The type of element in array: ${value1ElementType} not matches with type of value: ${value2Type}`);
        const isInside = includes(value1, value2);
        if (isInside) return true;
        else return false;
    } else throw new InputError('Filter operation $in failed.Array should have same type element.');
};

/**
* Checks if value2 is inside value1.
*
* This method supports comparing  string, number, and bool.
* 
* @param {Array} value1 - The value to compare(from metadata).
* @param {any} value2 - The value to compare against(from filterCondition).
* 
* @returns {Boolean} true if value2 is inside value1.otherwise false.
*/
function NotInside({ value1, value2 }) {
    if (!isArray(value1)) throw new InputError('Filter operation $nin failed.The value to compare against should be an array');

    const value2Type = typeof value2;
    if (!isString(value2) && !isNumber(value2) && isBoolean(value2)) throw new InputError('Filter operation $nin failed.The supported data types are string, number and bool only.');

    const { isArrayHaveSingleType, type: value1ElementType } = DbUtils.arrayHaveSingleType(value1);
    if (isArrayHaveSingleType) {
        if (!isEqual(value2Type, value1ElementType)) throw new InputError(`Filter operation $nin failed.The type of element in array: ${value1ElementType} not matches with type of value: ${value2Type}`);
        const isInside = includes(value1, value2);
        if (!isInside) return true;
        else return false;
    } else throw new InputError('Filter operation $nin failed.Array should have same type element.');
};