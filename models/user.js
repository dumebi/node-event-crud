let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt-nodejs');
let randomstring = require("randomstring");

let User = new Schema({
    fname: Schema.Types.String,
    lname: Schema.Types.String,
    email: { type: Schema.Types.String},
    phone: { type: Schema.Types.String},
    gender: Schema.Types.String,
    security_token: { type: Schema.Types.String },
    password: { type: Schema.Types.String },
    verification: Schema.Types.Number, // 0 => NO, 1 => YES
    is_activated: { type: Schema.Types.String, default: 0 },
    is_admin: { type: Schema.Types.String, default: 0 },
    created_at: { type: Schema.Types.Date, default: Date.now },
    modified_at: { type: Schema.Types.Date, default: Date.now }
});

User.methods.encrypt = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

User.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

User.methods.generateToken = function () {
    let token = randomstring.generate({
        length: 15,
        charset: 'numeric'
    });
    return bcrypt.hashSync(token, bcrypt.genSaltSync(5), null);
};

module.exports = mongoose.model('User', User);