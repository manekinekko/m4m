'use strict';

describe('m4mAppsService', function () {

  var _AppsService;
  var $httpBackend;
  beforeEach(module('ngResource'));
  beforeEach(module('m4m.services'));
  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend');
    _AppsService = $injector.get('AppsService');
  }));

  describe('getReadableProvider', function() {
    it('should display the provider with first letter capitalized', function() {
      expect(_AppsService.getReadableProvider('strava')).toBe('Strava');
      expect(_AppsService.getReadableProvider('nike')).toBe('Nike+');
      expect(_AppsService.getReadableProvider('mapmyrun')).not.toBe('mapmyrun');
    });
  });


});
