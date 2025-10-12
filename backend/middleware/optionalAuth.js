import jwt from 'jsonwebtoken';

const optionalAuth = async(req, res, next) => {
    const {token} = req.cookies;

    if(!token){
        // No token provided, continue as guest user
        req.user = { id: null };
        return next();
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)

        if(tokenDecode.id){
            req.user = { id: tokenDecode.id };
        }
        else{
            // Invalid token, continue as guest user
            req.user = { id: null };
        }

        next();
    } catch (error) {
        // Token verification failed, continue as guest user
        req.user = { id: null };
        next();
    }
}

export default optionalAuth;
