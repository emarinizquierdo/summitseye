'use strict';

angular.module('summitseyeApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
