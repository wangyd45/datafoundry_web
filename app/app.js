'use strict';

define([
    'angular',
    'bootstrap',
    'angularBase64',
    'ocLazyLoad',
    'uiBootstrap',
    'router',
    'resource',
    'pub/controller',
    'pub/service',
    'pub/directive',
    'pub/filter',
    'pub/ws',
    'components/version/version',
    'angularMd',
    'angularClipboard',
    'kubernetesUI',
    'highchartsNg',
    'fileUpload',
    'fileUploadShim',
    'angulartics',
    'angularticsgoogleanalytics'
], function (angular) {

    // 声明应用及其依赖
    var myApp = angular.module('myApp', [
        'oc.lazyLoad',
        'ui.bootstrap',
        'myApp.router',     //路由模块
        'myApp.resource',   //资源模块
        'myApp.controller',
        'myApp.service',
        'myApp.directive',
        'myApp.filter',
        'myApp.webSocket',
        'myApp.version',
        'hc.marked',
        'highcharts-ng',
        'ngFileUpload',
        'angulartics',
        'angulartics.google.analytics'
    ]);

    myApp.constant('GLOBAL', {
        size: 10,
        host: '/oapi/v1',
        host_k8s: '/api/v1',
        host_wss: '/ws/oapi/v1',
        host_wss_k8s: '/ws/api/v1',
        login_uri: '/login',
        signin_uri: '/signin',
        host_webhooks: 'https://dev.dataos.io:8443/oapi/v1'
    })
    .constant('AUTH_EVENTS', {
        loginNeeded: 'auth-login-needed',
        loginSuccess: 'auth-login-success',
        httpForbidden: 'auth-http-forbidden'
    })

    .config(['$httpProvider', 'GLOBAL', function ($httpProvider) {
        $httpProvider.interceptors.push([
            '$injector',
            function ($injector) {
                return $injector.get('AuthInterceptor');
            }
        ]);
    }])

    .run(['$rootScope', function ($rootScope) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.transfering = true;
            switch (toState.name) {
                case 'home.index':
                    $rootScope.whereclick = '首页'
                    break;
                case 'home.recharge':
                    $rootScope.whereclick = '价格'

                    break;
                case 'home.introduce':
                    $rootScope.whereclick = '产品'

                    break;
                case 'home.application':
                    $rootScope.whereclick = '应用市场'

                    break;
                case 'home.index_backing_service':
                    $rootScope.whereclick = '服务市场'

                    break;
                default:
                    $rootScope.whereclick = '首页'

            }
        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            //更新header标题
            $rootScope.console.state = toState.name;
            $rootScope.transfering = false;
        });
    }]);

    return myApp;
});
