exports.failAction = (error, statusCode) => {
  return { statusCode, data: null, error };
};

exports.successAction = (data, message, statusCode) => {
  return { statusCode, data, message };
};
