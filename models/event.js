let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt-nodejs');

let Event = new Schema({
    name: Schema.Types.String,
    description: Schema.Types.String,
    start_date: { type: Schema.Types.Date},
    end_date: { type: Schema.Types.Date},
    created_at: { type: Schema.Types.Date, default: Date.now },
    modified_at: { type: Schema.Types.Date, default: Date.now }
});

module.exports = mongoose.model('Event', Event);