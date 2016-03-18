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
    templateUrl: 'src/directives/app-connect-credentials/app-connect-credentials.html',
    controller: ConnectAppsCredentialsController,
    controllerAs: 'connectAppsCredentials',
    bindToController: true
  };

  /**
   * @ngInject
   */
  function ConnectAppsCredentialsController($translate, $window, m4mAppsService, Alert, Helper, Form, AUTH_EVENTS) {

    var vm = this;

    vm.readableProvider = m4mAppsService.getReadableProvider(vm.provider);
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
        m4mAppsService.credentialsLogin(vm.app).then(loginSuccess, loginError);
      } else {
        vm.disableForm = false;
      }

    }

  }

}
