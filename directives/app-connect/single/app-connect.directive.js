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
