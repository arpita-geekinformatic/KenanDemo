"use strict";

const success = (res, code, message) => {
  res.status(code).json({
    responseCode: code,
    status: true,
    message: message,
  });
};
const data = (res, item, code, message = "") => {
  res.status(code).json({
    responseCode: code,
    status: true,
    message: message,
    data: item,
  });
};
const dataWithToken = (res, item, token, code, message = "") =>{
  res.status(code).json({
    responseCode: code,
    status: true,
    message: message,
    data: item,
    token: token,
  });
}
const linkData = (res, item, code, link = "") => {
  res.status(code).json({
    status: true,
    data: item,
    link: link,
    responseCode: code,
  });
};
const token = (res, item, code) => {
  res.status(code).json({
    status: true,
    token: item,
    responseCode: code,
  });
};
const failure = (res, code, error) => {
  res.status(code).json({
    responseCode: code,
    status: false,
    message: error.message ? error.message : error,
  });
};

const page = (res, items, total, pageNo, code, type = "") => {
  res.status(code).json({
    is_success: true,
    data: {
      items: items,
      skip: pageNo || 0,
      userType: type,
      total: total || items.length,
    },
    responseCode: code,
  });
};

module.exports = {
  success,
  data,
  dataWithToken,
  token,
  failure,
  page,
  linkData,
};
