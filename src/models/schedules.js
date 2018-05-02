const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongoosePaginate = require('mongoose-paginate');

const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = mongoose.Schema({
    // 0 = standard, 1 = advanced
    typeOfSetting: { type: Number },
    // advanced settings-string
    advancedSetting: { type: String },
    // 0 = ignore all metadata and robots.txt.
    // 1 = check all file types without directories.
    // 2 = check all file types including directories.
    robots: { type: Number, min: 0, max: 2 },
    // 0 = default site structure.
    structure: { type: Number, min: 0, max: 5 },
    // 0 = none
    // 1 = daily
    // 2 = weekly
    // 3 = monthly
    typeOfSchedule: { type: Number, min: 0, max: 3 },

    url: { type: String },
    includeDomains: { type: String },
    excludePaths: { type: String },
    ownerId: { type: ObjectId },
    shouldNotify: { type: Boolean, default: true },
    email: { type: String },
    isPaused: { type: Boolean, default: false },
});

schema.plugin(timestamp);
schema.plugin(mongoosePaginate);

schema.post('init', (doc) => {
    if (doc.typeOfSchedule === 0) doc.scheduleName = 'Ingen';
    if (doc.typeOfSchedule === 1) doc.scheduleName = 'Dagligen';
    if (doc.typeOfSchedule === 2) doc.scheduleName = 'Veckovis';
    if (doc.typeOfSchedule === 3) doc.scheduleName = 'Månadsvis';
});

module.exports = mongoose.model('Schedules', schema);