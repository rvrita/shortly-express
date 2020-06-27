const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const cookieParser = require('./middleware/cookieParser');
const { Users, Sessions, Links, Clicks } = require('./models');
// const {Users} = models;
const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());
app.use(Auth.createSession());
// app.use(app.router);



app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return Links.getUrlTitle(url);
      })
      .then(title => {
        return Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });

  });

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/signup', (req, res, next) => {
  // get username and password from request
  var username = req.body.username;
  // console.log("username", username)
  var password = req.body.password;
  // console.log("password", password)
  let userName = { username };
  // session and userid - update
  Users.create({ username, password })
    .then(() => {
      // take the hash from the req
      // update the session w the hash and add the userid to hash
      res.redirect('/');
    })
    .catch(() => {
      res.redirect('/signup');
    });
});

app.post('/login', (req, res, next) => {
  // get username and password from request
  var username = req.body.username;
  var password = req.body.password;
  // check DB for both username and password





  Users.get({ username: username })// Nick, password1
    .then(userData => { // username salt passw.hash id
      if (userData === undefined) {
        // console.log('in no user', user);
        console.log('no userData line 114');
        res.redirect('/login');
      } else {
        // validate password for user that was found in DB
        if (Users.compare(password, userData.password, userData.salt)) {
          console.log('right name/passw, line 119', userData);
          console.log('right name/passw', req.session);
          // var hash = req.session.hash;
          // Sessions.update({ hash }, { userId: userData.id }).then(() => {
          //   res.redirect('/');
          //   console.log('right name/passw, line 123');
          // });
          res.redirect('/');

        } else {
          console.log('login fails, line 126');
          res.redirect('/login');
        }
      }
    })
    .catch(() => {
      // console.log('in catch');
      res.redirect('/login');
    });
});
/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
