const Users = require('./model/User');
const Transaction = require('./model/Transaction');
const Bank = require('./model/Bank');
const fetch = require('node-fetch');
require('dotenv').config();

exports.RequestBodyIsValidJson = (err, req, res, next) => {
    // body-parser will set this to 400 if the json is in error
    if (err.status === 400)
        return res.status(err.status).send('Malformed JSON');
    return next(err); // if it's not a 400, let the default error handling do it.
}

exports.RequestHeadersHaveCorrectContentType = (req, res, next) => {
    // Catch invalid Content-Types
    var RE_CONTYPE = /^application\/(?:x-www-form-urlencoded|json)(?:[\s;]|$)/i;
    if (req.method !== 'GET' && !RE_CONTYPE.test(req.headers['content-type'])) {
        res.setStatus = 406
        return res.send('Content-Type is not application/json');
    }
    next();
}

exports.validateToken = async (req, res, next) => {
    if (typeof req.headers.authorization === 'undefined'
        || req.headers.authorization.split(' ')[0] !== 'Bearer'
        || typeof req.headers.authorization.split(' ')[1] === 'undefined') {
        return res.status(401).json({ error: 'Missing token' });
    }
    const sessionId = req.headers.authorization.split(' ')[1]

    // A function to find a session from the database
    const session = await Sessions.findOne({ _id: sessionId });
    if (!session) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    const user = await Users.findOne({ _id: session.userId });
    if (!user) {
        return res.status(401).json({ error: 'Unknown user' });
    }
    req.headers.authenticatedUserId = user._id
    req.headers.sessionId = sessionId
    next();
}
exports.processTransactions = async () => {
    const pendingTransactions = await Transaction.find({ status: 'pending' });
    pendingTransactions.forEach(async transaction => {
        console.log(transaction);
        const bankTo = await Bank.findOne({
            bankPrefix: transaction.accountTo.split(0, 3)
        })
        if (!bankTo) {
            exports.refreshBanks()
        }
    });


}
exports.refreshBanks = async () => {
    await Bank.deleteMany()

    const banks = await fetch(`${process.env.CENTRAL_BANK_URL}/banks`, {
        headers: { 'api-key': process.env.CENTRAL_BANK_API_KEY },
    })

        .then(res => res.json())
        try {
        banks.forEach( async bank => Bank.create(bank))
    } catch (err) {
    console.log(err.message);
    }
}
