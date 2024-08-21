import { isEqual, gt, isInteger, isNumber } from "lodash";
import { InputError } from "./error";

export const filterOperators = Object.freeze({
    $eq: equal,
    $ne: notEqual,
    $gt: greaterThen,
});

function equal({ value1, value2 }) {
    return isEqual(value1, value2);
};

function notEqual({ value1, value2 }) {
    return !isEqual(value1, value2);
};

function greaterThen({ value1, value2 }) {
    if (!isNumber(value1) || !isNumber(value2)) throw new InputError('Filter operation $gt failed.Inputs should be number.')
    return gt(value1, value2);
};