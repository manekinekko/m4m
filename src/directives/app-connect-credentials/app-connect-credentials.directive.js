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
