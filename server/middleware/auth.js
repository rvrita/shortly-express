const { Users, Sessions } = require('../models');
const Promise = require('bluebird');
const cookieParser = require('./cookieParser');

module.exports.createSession = (req, res, next) => {
  // console.log("req auth ------> ", req);
  // var sessionObj = {};
  // req.session = {
  //   hash: ''
  // };
  // console.log("req auth session ------> ", req);
  // models.Sessions.create()
  //   .then(result =>
  //     models.Sessions.get({ id: result.insertId }))
  //   .then(anotherResult => {
  //     // console.log('+++++++++++++++',anotherResult);
  //     req.session = {
  //       hash: anotherResult.hash
  //     };
  //     res.cookie('shortlyid', anotherResult.hash);
  //     next();
  //   });


  console.log('in createsession', req);
  // we check the cookies
  if (!req.cookies.hasOwnProperty('shortlyid')) {
    // console.log('first if',req);
    Sessions.create()  // insert into session id, hash, userId
      .then(result => { return Sessions.get({ id: result.insertId }); }) // get from session table record for given userId
      .then(sessionTableResults => {
        console.log('+++++++++++++++', sessionTableResults);
        req.session = {
          hash: sessionTableResults.hash,
          // username: userTableResults.username,
          // userId: userTableResults.id
        };
        res.cookie('shortlyid', sessionTableResults.hash);
        // console.log('++++++++ res',res);
        // console.log('++++++++ req',req);
        next();

        //
        // });
      });
  } else {
    console.log('ELSE'); // use update

    req.session = {
      hash: req.cookies.shortlyid
    };
    if (Sessions.isLoggedIn(req.session)) {
      // req.cookies.shortlyid
      next();
    } else {
      res.redirect('/login');
      next();
    }
  }
  // if it's empty
  // create session
  // set cookies using express
  // else
  // we check if the shortlyid hash is the same as in the database
  // call next
  // else
  // redirect to login

};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/








// incoming req has no cookie -> generate hash, store it in sessions
// has a cookie -> check if it's valid -> if yes call next (?)
// has a cookie -> check if it's not valid -> return go to login