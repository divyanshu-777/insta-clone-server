module.exports = validation = (schema)=>{
 
    const options={
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
    };

    return function (req,res,next) {
        
        const {error,value}= schema.validate(req.body,options);

        if(error){
            return res.status(422).send({
                error : error,
                status :"422"
            });
        }
        else{
            req.body = value;
            next();
        }
    }
}