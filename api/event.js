let express = require('express');
let router = express.Router();
let Event = require('../models/event');
let request = require('request');
let cors = require("cors");
let Promise = require('bluebird');
let moment = require('moment');
router.use(cors());
let utils = require("../utils/utils");

/**
 * @method PUT /api/event/edit
 * @description Edits an event
 * @param {String} _id the event_id
 * @param {Object} update this object will contain the rest params
 */
router.put('/edit', utils.isUser, (r, s, n) => {
    if (r.body._id == null || r.body.update == null)
        return s.status(500).json({ status: "failed", err: "the required parameters were not supplied" });
    Event.update({ _id: r.body._id }, r.body.update, { "new": true})
        .then(event => {
            return s.status(201).json({ status: 'success', data: event });
        });
});

/**
 * @method DELETE /api/event/delete
 * @description Deletes an event
 * @param {String} _id the event_id
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
router.post('/delete', utils.isAdmin, (r, s, n) => {
    if (r.body._id == null)
        return s.status(500).json({ status: "failed", err: "the required parameters were not supplied" });
    Event.remove({ _id: r.body._id })
        .then(event => {
            return s.status(204).json({ status: 'success', data: {} });
        })
        .catch(err => {
            return s.status(500).json({ status: 'failed', err: 'Event doesn\'t exist' });
        });

});


/**
 * @method POST /api/events/
 * @description Gets all the events based on the options in the query
 * @param {String} name the event name (optional)
 * @param {String} start_date the event start_date (optional)
 * @param {String} end_date the event end_date (optional)
 * @returns {Object}
 * ```
 * {
    "status": "success",
    "data": [
        {
            "_id": "596f3cac5cf87fff6b3d2dc2",
            "name": "my event",
            "__v": 0,
            "start_date": "2/2/2018",
            "end_date": "12/2/2018",
            "created_at": "2017-07-19T11:04:12.382Z",
            "date_of_birth": "2017-07-19T11:04:12.382Z"
        },
        {
            "_id": "596f3cac5cf87fff6b3d2dc2",
            "name": "my event",
            "__v": 0,
            "start_date": "2/2/2018",
            "end_date": "12/2/2018",
            "created_at": "2017-07-19T11:04:12.382Z",
            "date_of_birth": "2017-07-19T11:04:12.382Z"
        },
        {
            "_id": "596f3cac5cf87fff6b3d2dc2",
            "name": "my event",
            "__v": 0,
            "start_date": "2/2/2018",
            "end_date": "12/2/2018",
            "created_at": "2017-07-19T11:04:12.382Z",
            "date_of_birth": "2017-07-19T11:04:12.382Z"
        }
    ]
}
 * ```
 */
router.post('/', utils.isAdmin, (r, s, n) => {
    let details = r.body;
    if(details.start_date){
        details.start_date = moment(details.start_date, "DD-MM-YYYY");
    }
    if(details.end_date){
        details.end_date = moment(details.end_date, "DD-MM-YYYY");
    }
    Event.find(r.body).sort({ created_at: "descending" })
        .then(events => {
            return s.status(200).json({ status: 'success', data: events });
        })
        .catch(err => {
            return s.status(500).json({ status: 'failed', err: err });
        });
});

/**
 * @method POST /api/get/
 * @description Gets one event
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
router.get('/:id', utils.isUser, (r, s, n) => {
    if (r.params._id == null) return s.status(500).json({ status: 'failed', err: "the event id wasn't supplied" });
    Event.findById(r.body._id)
        .then(user => {
            return s.status(200).json({ status: 'success', data: user });
        })
        .catch(err => {
            return s.status(500).json({ status: 'failed', err: err });
        });
});


/**
 * @method GET /api/event/count
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
    Event.count()
        .then(result => {
            return s.status(200).json({ status: 'success', data: result });
        })
        .catch(err => {
            return s.status(500).json({ status: 'failed', err: err });
        });
});

/**
 * @method POST /api/event/create
 * @description Creates an event.
 * @param {String} name
 * @param {String} description
 * @param {String} start_date
 * @param {String} end_date
 * @example
 * {
	"name":"event"
}
 * @returns {Object}
 * ```
 * {
    "status": "success",
    "data": {

    }
}

 or

 {
     "status": "failed",
     "err": "an object describing the error"
 }
 * ```
 */
router.post('/create', utils.isUser, (r, s, n) => {
    if (r.body.name == null || r.body.description == null || r.body.start_date == null || r.body.end_date == null)
        return s.status(500).json({ status: "failed", err: "Some details were not supplied" });
    let newEvent = new Event({
        name:r.body.name,
        description:r.body.description,
        start_date:moment(r.body.start_date, "DD-MM-YYYY"),
        end_date:moment(r.body.end_date, "DD-MM-YYYY")
    });
    newEvent.save().then(event => {
        return s.status(200).json({ status: 'success', data: event });
    }).catch(err => {
            return s.status(500).json({ status: 'failed', err: err });
        });
});

module.exports = router;