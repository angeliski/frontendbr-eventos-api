const firebase = require('firebase');

module.exports = ({ config, db }) => {
    console.info('Init Middleware Login module');

    const login = (accessToken) => {
        const credential =
            firebase
                .auth
                .GithubAuthProvider
                .credential(accessToken);

        return firebase
            .auth()
            .signInWithCredential(credential);
    }

    const process = (accessToken, resolve, reject) => {
        if (accessToken) {
            login(accessToken)
                .then(resolve)
                .catch(reject);
        } else {
            reject({
                status: 401,
                message: "header Authorization is required"
            });
        }
    }

    const authentication = (req, res, next) => {
        const accessToken = req.get('Authorization');
        const reject = (error) => {
            res
                .status(401)
                .json(error);
        }

        const resolve = (user) => {
            req.authentication = { user: user };
            next();
        }

        process(accessToken, resolve, reject);
    }

    const admin = (req, res, next) => {
        const accessToken = req.get('Authorization');
        const reject = (error) => {
            res
                .status(401)
                .json(error);
        }

        const resolve = (user) => {
            db
                .listAdmins()
                .then((admins) => {
                    
                    if (admins.indexOf(user.email) > -1) {
                        req.authentication = { user: user };
                        next();
                    } else {
                        console.log('reject!')
                        reject({
                            status: 401,
                            message: "is necessary been admin"
                        })
                    }
                })


        }

        process(accessToken, resolve, reject);
    }

    return {
        authentication,
        admin
    }
}