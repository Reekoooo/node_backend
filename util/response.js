class Response{
    status = s=>{
        this.st = s;
        return this;
    }

    json = j=>j.data
}

module.exports = Response;