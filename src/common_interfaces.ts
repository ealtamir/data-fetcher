

interface ErrorPayload {
    errorMsg: string;
    errorCode: number;
}

type DefaultCallback = (errors: any, results: any) => void

export {
    ErrorPayload,
    DefaultCallback
}