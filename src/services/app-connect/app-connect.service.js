'use strict';

angular
  .module('m4m')
  .service('m4mAppsService', ['$resource', '$q', '$window', 'LocalStorageService', m4mAppsService]);

/**
 * @ngInject
 */
function m4mAppsService($resource, $q, $window, LocalStorageService) {

  var uri = $window.location.origin + '/auth/provider/';

  var resource = $resource('/auth/:controller/:provider/:action', {},
    {
      get: {
        method: 'GET',
        params: {
          controller: 'apps'
        }
      },
      login: {
        method: 'POST',
        params: {
          controller: 'provider'
        }
      },
      getStatus: {
        method: 'GET',
        params: {
          controller: 'provider',
          action: 'status'
        }
      }
    });

  return {
    credentialsLogin: credentialsLogin,
    oauthLogin: oauthLogin,
    refreshApp: refreshApp,
    getReadableProvider: getReadableProvider,
    checkProviderStatus: checkProviderStatus
  };

  function credentialsLogin(app) {

    var deferredObject = $q.defer();

    resource.login({provider:app.provider}, app.credentials).$promise.then(loginSuccess).catch(loginError);

    function loginSuccess(response) {
      deferredObject.resolve(response);
    }

    function loginError(error) {
      deferredObject.reject(error);
    }

    return deferredObject.promise;

  }

  function oauthLogin(provider, state) {
    var finalUri = provider + '?access_token=' + LocalStorageService.getItem('token', true) + '&state=' + encodeURIComponent(state);
    return $window.location.assign(uri + finalUri);
  }

  function refreshApp(provider) {

    var deferredObject = $q.defer();

    resource.get({provider:provider}).$promise.then(getSuccess).catch(getError);

    function getSuccess(response) {
      deferredObject.resolve(response);
    }

    function getError(error) {
      deferredObject.reject(error);
    }

    return deferredObject.promise;

  }

  function getReadableProvider(provider) {
    var readableProvider;
    switch (provider) {
      case 'nike':
        readableProvider = 'Nike+';
        break;
      default:
        readableProvider = provider;
    }
    return readableProvider.charAt(0).toUpperCase() + readableProvider.substr(1);
  }

  function checkProviderStatus(provider) {

    var deferredObject = $q.defer();

    resource.getStatus({provider:provider}).$promise.then(getStatusSuccess).catch(getStatusError);

    function getStatusSuccess() {
      deferredObject.resolve();
    }

    function getStatusError() {
      deferredObject.reject();
    }

    return deferredObject.promise;

  }
}

