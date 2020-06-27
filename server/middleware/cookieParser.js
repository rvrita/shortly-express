const parseCookies = (req, res, next) => {
  console.log('parseCookies ---------> ', req);
  let cookies = {};
  if (req.headers.cookie) {
    let cookieArr = req.headers.cookie.split(';');
    cookieArr.forEach((cookieString) => {
      let tempArr = cookieString.split('=');
      cookies[tempArr[0].trim()] = tempArr[1];
    });
    req.cookies = cookies;
  }
  console.log('parseCookies end ---------> ', req);
  next();
};

module.exports = parseCookies;