export class ConnectionError extends Error {
    constructor(msg) {
        super(msg)
        this.name = 'ConnectionError'
    }
}

export class OpenDbError extends Error {
    constructor(msg) {
        super(msg)
        this.name = 'OpenDbError'
    }
}

export class OpenVectorBlockError extends Error {
    constructor(msg) {
        super(msg)
        this.name = 'OpenVectorBlockError'
    }
}

export class ConfigBlockError extends Error {
    constructor(msg) {
        super(msg)
        this.name = 'ConfigBlockError'
    }
}

export class OperationsError extends Error {
    constructor(msg) {
        super(msg)
        this.name = 'OperationsError'
    }
}

export class TransactionError extends Error {
    constructor(msg) {
        super(msg)
        this.name = 'TransactionError'
    }
}

export class InputError extends Error {
    constructor(msg) {
        super(msg)
        this.name = 'InputError'
    }
}
