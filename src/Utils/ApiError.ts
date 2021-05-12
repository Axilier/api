/** @format */

export default class ApiError extends Error {
    constructor(public message: string, public code: number) {
        super(message);
    }
}
