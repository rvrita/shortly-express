const parseCookies = (req, res, next) => {
  let cookies = {};
  if (req.headers.cookie) {
    let cookieArr = req.headers.cookie.split(';');
    cookieArr.forEach((cookieString) => {
      let tempArr = cookieString.split('=');
      cookies[tempArr[0].trim()] = tempArr[1];
    });
    req.cookies = cookies;
  }
  next();
};

module.exports = parseCookies;