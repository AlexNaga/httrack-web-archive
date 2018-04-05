const del = require('delete');
const path = require('path');
const readdir = require('readdir-enhanced');
const validEmail = require('email-validator');
const validUrl = require('valid-url');

const httrackWrapper = require('../models/httrackWrapper');
const emailModel = require('../models/emailModel');

exports.createArchive = (req, res, next) => {
    let url = req.body.url;
    let email = req.body.email;
    let excludeUrls = req.body.path.replace(/\s+/g, '').split(',');

    if (validUrl.isUri(url) === false) return res.send('Invalid url!');
    if (validUrl.isUri(req.body.subUrl) === false) return res.send('Invalid sub-url!');
    if (req.body.robots > 2 && req.body.robots < 0) res.send('Invalid robots-settings!');
    if (validEmail.validate(email) === false) return res.send('Invalid email!');

    res.render('home');

    let httrackSettings = {
        url: req.body.url, // USER. url to crawl
        siteStructure: 0, // USER. 0 = default site structure.
        robots: req.body.robots, // USER. 0 = ignore all metadata and robots.txt. 1 = check all file types without directories. 2 = check all file types including directories.
        excludeUrls: excludeUrls, // USER. excluding url 
        includeUrls: req.body.subUrl // USER. including url
    }
    httrackWrapper.archive(httrackSettings, (error, response) => {
        if (error) return console.log(error);

        let downloadUrl = process.env.SERVER_DOMAIN + '/' + response.zipArchivePath;

        let emailSettings = {
            email: email,
            subject: 'Your archive is ready ✔',
            message: `<p><b>Your archive of ${url} is complete!</b></p><p><a href="${downloadUrl}">Download .zip</a></p>`
        }
        emailModel.sendMail(emailSettings, (error, response) => {
            if (error) return console.log(error);
            console.log('Message sent: %s', response.messageId);
        });
    });
};

exports.getArchive = (req, res, next) => {
    let id = req.params.id;
    res.status(200).sendFile(path.join(__dirname + '/../../archives/' + id));
};


exports.listArchives = (req, res, next) => {
    let page = req.query.page || 0;
    let itemsPerPage = 10;

    readdir.async.stat('archives')
        .then((files) => {
            res.status(200).json({
                archives: files.sort((a, b) => {
                    // Sort by modification date descending order
                    return b.mtime - a.mtime;
                }).map(archive => {
                    return archive;
                }).slice(page * itemsPerPage, (page + 1) * itemsPerPage) // Take 10
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err
            });
        });
};


exports.deleteArchive = (req, res, next) => {
    let id = req.params.id;

    del.promise(['archives/' + id])
        .then((deleted) => {
            // If file really deleted
            if (deleted.length > 0) {
                deleted = deleted[0].split('archives/')[1]; // Only get file name and not the file path
                console.log('Deleted file:', deleted);
            }

            res.status(200).json({
                deleted: deleted
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err
            });
        });
};