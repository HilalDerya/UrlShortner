const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const Users = require('./models/user')
const app = express()

mongoose.connect('mongodb://localhost/urlShortener', {
    useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))

let user;

app.get('/', async (req, res) => {
    const shortUrls = await ShortUrl.find().sort({ createdDate: -1 }).limit(1)
    res.render('index', { shortUrls: shortUrls, loggedIn: app.settings.loggedIn })
})

app.get('/jsgrid', async (req, res) => {
    const sort = { clicks: -1 }
    const shortUrls = await ShortUrl.find().sort(sort)
    res.render('jsgrid', { shortUrls: shortUrls })
})

app.get('/signup', async (req, res) => {
    res.render('signup')
})

app.get('/signin', async (req, res) => {
    res.render('signin', { error: "" })
})

app.get('/chart', async (req, res) => {
    res.render('chart')
})

app.get('/index', async (req, res) => {
    res.render('index')
})

app.get('/KVKK', async (req, res) => {
    res.render('KVKK')
})

app.get('/flot', async (req, res) => {
    res.render('flot')
})

app.get('/forbidden', async (req, res) => {
    res.render('forbidden')
})

app.get('/homepage', async (req, res) => {
    if (user != null) {
        const shortUrls = await ShortUrl.find().sort({ _id: -1 }).limit(1)
        res.render('homepage', { shortUrls: shortUrls })
    } else res.render('signin', { error: "You have to sign in to use our service" })
})

app.get('/idx', async (req, res) => {
    const sort = { clicks: -1 }
    const shortUrls = await ShortUrl.find().sort(sort)
    if (user != null) {
        if(user.admin) {
        const shortUrls = await ShortUrl.find().sort({ _id: -1 }).limit(1)
        res.render('idx', { shortUrls: shortUrls })
        } else res.redirect('/forbidden') //else res.sendStatus(403)
    } else res.render('signin', { error: "The email is not registered" })
})

app.get('/json-list', async (req, res) => {
    const shortUrls = await ShortUrl.find().sort({ clicks: -1 })
    res.json(shortUrls)
})

app.get('/user-list', async (req, res) => {
    const users = await Users.find()
    res.json(users)
})

function timestamp(time) {
    let t = new Date();
    let x = new Date();
    t.setHours(time.substr(0, 2));
    t.setMinutes(time.substr(3));
    if (t.valueOf() < x.valueOf()) t.setDate(t.getDate() + 1); //prevents from creating already expired links
    return t.getTime();
}

app.post('/shortUrls', async (req, res) => {
    if (user != null) {
        if (req.body.customName != null)
            await ShortUrl.create({ email: user.email, full: req.body.fullUrl, name: req.body.customName, expireTime: timestamp(req.body.expireTime) })
        else
            await ShortUrl.create({ email: user.email, full: req.body.fullUrl, expireTime: timestamp(req.body.expireTime) })
        user.linksCreated++
        user.save()
    } else return res.sendStatus(400)
    res.redirect('/homepage')
})

app.post('/register', async (req, res) => {
    await Users.create({ userName: req.body.name, email: req.body.email, password: req.body.password, admin: false })
    res.redirect('/')
})

app.post('/login', async (req, res) => {
    // check email/password and login
    let email = req.body.email;
    let password = req.body.password;
    user = await Users.findOne({ email: email })
    if (user != null) {
        if (user.password == password) {
            app.set("loggedIn", true);
            res.redirect('/');
        }//login
        else res.render('signin', { error: "The password is wrong" });//wrong password
    } else res.render('signin', { error: "The email is not registered" });//email not registered
})

/*app.post('/shortUrls', async (req,res)=>{
    await ShortUrl.create({full:req.body.fullUrl})
    res.redirect('/')
})*/

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null) return res.sendStatus(404)
    if (shortUrl.expireTime < Date.now()) res.render('expired', { url: shortUrl })// url expired
    else {
        res.redirect(shortUrl.full)
        shortUrl.clicks++
        shortUrl.save()
    }
})

app.listen(/*process.env.PUBLIC_PORT*/3000, () => {
    console.log('Server started')
})