'use strict';

angular
  .module('m4m.services', []);

'use strict';

angular
  .module('m4m.directives', []);

'use strict';

angular
  .module('m4m', ['m4m.directives', 'm4m.services']);

'use strict';

angular
  .module('m4m.services')
  .service('m4mAppsService', AppsService);

/**
 * @ngInject
 */
function AppsService($resource, $q, $window, LocalStorageService) {

  var uri = $window.location.origin + '/auth/running-heroes/provider/';

  var resource = $resource('/auth/running-heroes/:controller/:provider/:action', {},
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


'use strict';

angular
  .module('m4m.directives')
  .directive('m4mConnectAppsCredentials', m4mConnectAppsCredentials);

/**
 * @name m4mConnectAppsCredentials
 * @desc <m4m-connect-apps-credentials> Directive
 * @type {Function}
 */
function m4mConnectAppsCredentials() {

  return {
    restrict: 'EA',
    scope: {
      provider: '=',
      urlParent: '@'
    },
    templateUrl: 'components/applications/connect/credentials/app-connect-credentials.html',
    controller: ConnectAppsCredentialsController,
    controllerAs: 'connectAppsCredentials',
    bindToController: true
  };

  /**
   * @ngInject
   */
  function ConnectAppsCredentialsController($translate, $window, AppsService, Alert, Helper, Form, AUTH_EVENTS) {

    var vm = this;

    vm.readableProvider = AppsService.getReadableProvider(vm.provider);
    vm.app = {
      provider: vm.provider,
      credentials: {}
    };
    vm.appForm = {};
    vm.submit = submit;
    vm.closeAlert = Alert.closeAlert;

    function loginSuccess(){
      if(vm.provider === 'polar') {
        vm.disableForm = false;
        vm.alerts = Alert.setAlert('info', 'ERROR.POLARNEEDAUTHORIZATION');

        $window.scrollTo(0,0);

      } else {
        Helper.broadcast(AUTH_EVENTS.appsLoginSuccess);
      }

    }

    function loginError(err){

      vm.disableForm = false;

      if (err.data.error) {

        Form.setValidity(vm.appForm, 'email', 'm4m-server', false);
        Form.setValidity(vm.appForm, 'password', 'm4m-server', false);

        vm.errors = {
          provider: err.data.vars.provider,
          email: err.data.vars.email
        };
        vm.alerts = Alert.setAlert('warning', 'ERROR.' + err.data.error.toUpperCase());

        $window.scrollTo(0,0);

      }

    }

    function submit(form) {
      vm.appForm = form;
      vm.disableForm = true;

      if (form.$valid) {
        if (vm.app.provider === 'polar') {
          vm.app.credentials.password = 'polar';
        }
        AppsService.credentialsLogin(vm.app).then(loginSuccess, loginError);
      } else {
        vm.disableForm = false;
      }

    }

  }

}

'use strict';

angular
  .module('m4m.directives')
  .directive('m4mConnectApp', m4mConnectApp);


/**
 * @name m4mConnectApp
 * @desc <m4m-connect-apps> Directive
 * @type {Function}
 */
function m4mConnectApp() {

  return {
    restrict: 'EA',
    scope: {
      apps: '=',
      state: '@',
      stateUrl: '@'
    },
    templateUrl: 'components/applications/connect/all/app-connect-all.html',
    controller: ConnectAppsController,
    controllerAs: 'connectApps',
    bindToController: true
  };

  /**
   * @ngInject
   */
  function ConnectAppsController(Alert, AppsService, StateService, ModalService) {
    var vm = this;
    vm.oauth = oauth;
    vm.getCredApps = getCredApps;
    vm.openFAQ = openFAQ;

    function oauth (provider, hasApi, stateUrl) {

      function successCallback() {
        return AppsService.oauthLogin(provider, stateUrl || vm.stateUrl);
      }

      function errorCallback() {

        vm.errors = {
          provider: AppsService.getReadableProvider(provider)
        };
        vm.alerts = Alert.setAlert('warning', 'ERROR.API_NOT_READY');

      }

      if(hasApi) {
        AppsService.checkProviderStatus(provider).then(successCallback, errorCallback);
      } else {
        return AppsService.oauthLogin(provider, vm.stateUrl);
      }
    }

    function getCredApps (provider, hasApi) {

      function successCallback(){
        return oauth(provider, false, vm.stateUrl);
      }

      function errorCallback() {
        StateService.goToState(vm.state, { provider: provider});
      }

      if(hasApi) {
        AppsService.checkProviderStatus(provider).then(successCallback, errorCallback);
      } else {
        StateService.goToState(vm.state, { provider: provider});
      }
    }

    function openFAQ() {
      return ModalService.showModal({
          templateUrl: 'components/modal/modalFaq/modalFaq.html',
          controller: 'ModalFaqController',
          controllerAs: 'faq'
        })
        .then(function(modal) {


          }
        );
    }
  }

}