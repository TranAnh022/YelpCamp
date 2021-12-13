class ExpressError extends Error{
    constructor(MessageChannel,statusCode){
        super();
        this.message =message;
        this.statusCode= statusCode;
    }
}

module.exports =ExpressError;