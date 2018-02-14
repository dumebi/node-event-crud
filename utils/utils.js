let User = require('../models/user');
exports.isUser = function (r, s, n) {
    const token = r.headers.authorization.replace("Bearer ", "");
    if (token == null)
        return s.status(401).json({ status: "failed", err: "You're not authorized" });
    User.findOne({ security_token: token})
        .then(user => {
            if (user != null) {
                return n();
            }
            else {
                return s.status(500).json({ status: 'failed', data: "User not found" });
            }
        }).catch(err => {
        return s.status(500).json({ status: 'failed', err: "User not found" });
    });
}

exports.isAdmin = function (r, s, n) {
    const token = r.headers.authorization.replace("Bearer ", "");
    if (token == null)
        return s.status(401).json({ status: "failed", err: "You're not authorized" });
    User.findOne({ security_token: token})
        .then(user => {
            if (user != null && user.is_admin == 1) {
                return n();
            }
            else if(user != null && user.is_admin != 1){
                return s.status(401).json({ status: "failed", err: "You're not authorized" });
            }
            else {
                return s.status(500).json({ status: 'failed', data: "User not found" });
            }
        }).catch(err => {
        return s.status(500).json({ status: 'failed', err: "User not found" });
    });
}