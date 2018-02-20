let express = require('express');
let router = express.Router();
let User = require('../models/user');
let request = require('request');
let cors = require("cors");
let Promise = require('bluebird');
router.use(cors());
let utils = require("../utils/utils");


/**
 * @method PUT /api/user/update
 * @description Updates the user profile
 * @param {String} _id the user_id
 * @param {Object} update this object will contain the rest params
 */
router.put('/update', (r, s, n) => {
    if (r.body._id == null || r.body.update == null)
        return s.status(500).json({ status: "failed", err: "the required parameters were not supplied" });
    User.update({ _id: r.body._id }, r.body.update, { "new": true})
        .then(user => {
            return s.status(201).json({ status: 'success', data: user });
    });
});

/**
 * @method DELETE /api/user/delete
 * @description Deletes the user profile
 * @param {String} _id the user_id
 * @example
 * {
	"_id" : "596f3cac5cf87fff6b3d2dc2",
}
 * @returns {Object}
 * ```
 * {
    "status": "success",
    "data": {}
}
 * ```
 */
router.post('/delete', utils.isAdmin,  (r, s, n) => {
    if (r.body._id == null)
        return s.status(500).json({ status: "failed", err: "the required parameters were not supplied" });
    User.remove({ _id: r.body._id })
        .then(user => {
            return s.status(204).json({ status: 'success', data: {} });
        })
        .catch(err => {
            return s.status(500).json({ status: 'failed', err: 'User doesn\'t exist' });
        });

});


/**
 * @method POST /api/user/
 * @description Gets all the users based on the options in the query
 * @param {String} name the user's name (optional)
 * @param {String} phone_number the user's phone number (optional)
 * @param {String} email the user's email (optional)
 * @param {String} gender the user's gender (optional)
 * @returns {Object}
 * ```
 * {
    "status": "success",
    "data": [
        {
            "_id": "596f3cac5cf87fff6b3d2dc2",
            "phone_number": "0000000000",
            "__v": 0,
            "security_token": "$2a$05$87DKa0jJz1PdBud5mQQvlu2D4CoTB3MTLCMLVFMDfk15OcKoEYGPC",
            "modified_at": "2017-07-19T11:04:12.382Z",
            "created_at": "2017-07-19T11:04:12.382Z",
            "is_admin": false,
            "date_of_birth": "2017-07-19T11:04:12.382Z"
        },
        {
            "_id": "59709e832e341744b22b9443",
            "phone_number": "1111111111",
            "__v": 0,
            "security_token": "$2a$05$9uTJNtqt31BbbY6M.Yt9Bu8rAs0oT0zFIXEa7f0wvVi2Xh69NNc1e",
            "modified_at": "2017-07-20T12:13:55.477Z",
            "created_at": "2017-07-20T12:13:55.477Z",
            "is_admin": false,
            "date_of_birth": "2017-07-20T12:13:55.476Z"
        },
        {
            "_id": "597133ad2e341744b22b9444",
            "phone_number": "00000000000",
            "__v": 0,
            "security_token": "$2a$05$xEh7dZ.yt3Sw0YehJzkRkOyi/K1rvDviHJwmCPOBIJMgKy9g2ThFm",
            "modified_at": "2017-07-20T22:50:21.595Z",
            "created_at": "2017-07-20T22:50:21.595Z",
            "is_admin": false,
            "date_of_birth": "2017-07-20T22:50:21.595Z"
        }
    ]
}
 * ```
 */
router.post('/all', utils.isAdmin, (r, s, n) => {
    User.find(r.body).sort({ created_at: "descending" })
        .then(users => {
            return s.json({ status: 'success', data: users });
        })
        .catch(err => {
            return s.json({ status: 'failed', err: err });
        });
});

/**
 * @method POST /api/user/
 * @description Gets one user, at least one option should be specified
 * @param {String} _id the user id
 * @returns {Object}
 * ```
 * {
    "status": "success",
    "data":
        {
            "_id": "596f3cac5cf87fff6b3d2dc2",
            "phone_number": "0000000000",
            "__v": 0,
            "security_token": "$2a$05$87DKa0jJz1PdBud5mQQvlu2D4CoTB3MTLCMLVFMDfk15OcKoEYGPC",
            "modified_at": "2017-07-19T11:04:12.382Z",
            "created_at": "2017-07-19T11:04:12.382Z",
            "is_admin": false,
            "date_of_birth": "2017-07-19T11:04:12.382Z"
        }
}
 * ```
 */
router.get('/:id', utils.isAdmin,  (r, s, n) => {
    if (r.params.id == null) return s.json({ status: 'failed', err: "the user id wasn't supplied" });
    User.findById(r.params.id)
        .then(user => {
            return s.status(200).json({ status: 'success', data: user });
        })
        .catch(err => {
            return s.status(500).json({ status: 'failed', err: err });
        });
});


/**
 * @method GET /api/user/count
 * @description Gets users count
 * @returns {Object}
 * ```
 * {
    "status": "success",
    "data": 3
}
 * ```
 */
router.get('/count', utils.isAdmin, (r, s, n) => {
    User.count()
        .then(result => {
            return s.status(200).json({ status: 'success', data: result });
        })
        .catch(err => {
            return s.status(500).json({ status: 'failed', err: err });
        });
});

/**
 * @method POST /api/user/sign-up
 * @description Finds a user with the given email, if the users isn't present it creates a profile for that user.
 * @param {String} email
 * @example
 * {
	"email":"rtukpe@gmail.com"
}
 * @returns {Object}
 * ```
 * {
    "status": "success",
    "data": {
        "_id": "596e6328c0390c7b9a1d2371",
        "phone_number": "0000000000",
        "__v": 0,
        "security_token": "$2a$05$vEOkBAq7XxbSYxIPfxpMkOKjas7koOkBJog7t31jWi43vo6hxQPK2",
        "modified_at": "2017-07-18T19:36:08.246Z",
        "created_at": "2017-07-18T19:36:08.246Z",
        "is_admin": false,
        "date_of_birth": "2017-07-18T19:36:08.246Z"
    }
}

 or

 {
     "status": "failed",
     "err": "an object describing the error"
 }
 * ```
 */
router.post('/sign-up', (r, s, n) => {
    if (r.body.email == null || r.body.fname == null || r.body.lname == null)
        return s.status(500).json({ status: "failed", err: "Some details were not supplied" });
    User.findOne({ email: r.body.email })
        .then(user => {
            if (user != null) { return s.status(500).json({ status: 'failed', data: user }); }
            else {
                let details = r.body;

                let newUser = new User(details);
                newUser.security_token = newUser.generateToken();
                newUser
                    .save().then(user => {
                    return s.status(200).json({ status: 'success', data: user });
                });

            }
        }).catch(err => {
        console.log(err);
        return s.status(500).json({ status: 'failed', err: err });
    });

});

/**
 * @method POST /api/user/admin-sign-up
 * @description Finds a user with the given email, if the users isn't present it creates a profile for that user.
 * @param {String} email
 * @example
 * {
	"email":"rtukpe@gmail.com"
}
 * @returns {Object}
 * ```
 * {
    "status": "success",
    "data": {
        "_id": "596e6328c0390c7b9a1d2371",
        "phone_number": "0000000000",
        "__v": 0,
        "security_token": "$2a$05$vEOkBAq7XxbSYxIPfxpMkOKjas7koOkBJog7t31jWi43vo6hxQPK2",
        "modified_at": "2017-07-18T19:36:08.246Z",
        "created_at": "2017-07-18T19:36:08.246Z",
        "is_admin": false,
        "date_of_birth": "2017-07-18T19:36:08.246Z"
    }
}

 or

 {
     "status": "failed",
     "err": "an object describing the error"
 }
 * ```
 */
router.post('/admin-sign-up', (r, s, n) => {
    if (r.body.email == null || r.body.fname == null || r.body.lname == null)
        return s.status(500).json({ status: "failed", err: "Some details were not supplied" });
    User.findOne({ email: r.body.email })
        .then(user => {
            if (user != null) { return s.status(500).json({ status: 'failed', data: user }); }
            else {
                let details = r.body;

                let newUser = new User(details);
                newUser.security_token = newUser.generateToken();
                newUser.is_admin = 1;
                newUser
                    .save().then(user => {
                    return s.status(200).json({ status: 'success', data: user });
                });

            }
        }).catch(err => {
        console.log(err);
        return s.status(500).json({ status: 'failed', err: err });
    });
});

/**
 * @method POST /api/user/login
 * @description Finds a user with the given email, if the users isn't present it creates a profile for that user.
 * @param {String} email
 * @example
 * {
	"email":"rtukpe@gmail.com",
	"password":"valentine"
}
 * @returns {Object}
 * ```
 * {
    "status": "success",
    "data": {
        "_id": "596e6328c0390c7b9a1d2371",
        "phone_number": "0000000000",
        "__v": 0,
        "security_token": "$2a$05$vEOkBAq7XxbSYxIPfxpMkOKjas7koOkBJog7t31jWi43vo6hxQPK2",
        "modified_at": "2017-07-18T19:36:08.246Z",
        "created_at": "2017-07-18T19:36:08.246Z",
        "is_admin": false,
        "date_of_birth": "2017-07-18T19:36:08.246Z"
    }
}

 or

 {
     "status": "failed",
     "err": "an object describing the error"
 }
 * ```
 */
router.post('/login', (r, s, n) => {
    if (r.body.email == null || r.body.password == null)
        return s.status(500).json({ status: "failed", err: "Some details were not supplied" });
    let newUser = new User;
    User.findOne({ email: r.body.email })
        .then(user => {
            if (!user) {return s.status(500).json({ status: 'failed', data: "User not found here" });}
            else {
                if (!user.validatePassword(r.body.password)) {
                    return s.status(500).json({ status: 'failed', data: "Wrong password" });
                }
                return s.status(200).json({ status: 'success', data: user });
            }
        }).catch(err => {
        return s.status(500).json({ status: 'failed', err: "User not found" });
    });
});

module.exports = router;