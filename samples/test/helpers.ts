const retry = (asyncMethod: Function, counter?: number | undefined) => {
    let retryCounter: number;
    counter ? retryCounter = counter : retryCounter = 0;

    try {
        const res = asyncMethod;
        return res;
    } catch (err) {
        if (retryCounter <= 3) {
            asyncMethod;
            retry(asyncMethod, retryCounter++);
        } else {
            throw err;
        }
    }
}