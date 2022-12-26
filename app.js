const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const usersRoute = require('./api/routes/users');
const groupsRoute = require('./api/routes/groups');
const messagesRoute = require('./api/routes/messages');
const analyticsRoute = require('./api/routes/analytics');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/users', usersRoute);
app.use('/groups', groupsRoute);
app.use('/messages', messagesRoute);
app.use('/analytics', analyticsRoute);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;