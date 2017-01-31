// http://stackoverflow.com/a/9802006/2993478
module.exports = function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        // res.render('404', { url: req.url }); // TODO: Engine
        res.send('<h1>Not found</h1>');
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
};