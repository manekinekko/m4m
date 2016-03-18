'use strict';

angular
  .module('m4m.directives')
  .directive('m4mConnectApp', m4mConnectApp);


/**
 * @name m4mConnectApp
 * @desc <m4m-connect-app> Directive
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
    templateUrl: 'src/directives/app-connect/app-connect.html',
    controller: ConnectAppsController,
    controllerAs: 'connectApps',
    bindToController: true
  };

  /**
   * @ngInject
   */
  function ConnectAppsController(Alert, m4mAppsService, StateService, ModalService) {
    var vm = this;
    vm.oauth = oauth;
    vm.getCredApps = getCredApps;
    vm.openFAQ = openFAQ;

    function oauth (provider, hasApi, stateUrl) {

      function successCallback() {
        return m4mAppsService.oauthLogin(provider, stateUrl || vm.stateUrl);
      }

      function errorCallback() {

        vm.errors = {
          provider: m4mAppsService.getReadableProvider(provider)
        };
        vm.alerts = Alert.setAlert('warning', 'ERROR.API_NOT_READY');

      }

      if(hasApi) {
        m4mAppsService.checkProviderStatus(provider).then(successCallback, errorCallback);
      } else {
        return m4mAppsService.oauthLogin(provider, vm.stateUrl);
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
        m4mAppsService.checkProviderStatus(provider).then(successCallback, errorCallback);
      } else {
        StateService.goToState(vm.state, { provider: provider});
      }
    }

    function openFAQ() {

      // return ModalService.showModal({
      //     templateUrl: 'components/modal/modalFaq/modalFaq.html',
      //     controller: 'ModalFaqController',
      //     controllerAs: 'faq'
      //   })
      //   .then(function(modal) {


      //   });
    }
  }

}
