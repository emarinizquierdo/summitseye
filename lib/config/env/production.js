'use strict';

var connection_string = (process.env.OPENSHIFT_MONGODB_DB_URL) ? process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME : null;

console.log("este es el connection_string: %s", connection_string);

module.exports = {
  env: 'production',
  mongo: {
    uri: connection_string
  }
};