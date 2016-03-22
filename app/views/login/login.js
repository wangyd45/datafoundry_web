'use strict';

angular.module('login', [
    'base64',
    {
        files: ['../bower_components/angular-base64/angular-base64.min.js']
    }
])
    .controller('LoginCtrl', ['$scope', 'AuthService', function($scope, AuthService){
        $scope.credentials = {
            username: 'admin',
            password: 'Ouhl9eHv83yuyhdifJwpk4XXIkrbG1YwI'
        };
        $scope.login = function(){
            AuthService.login($scope.credentials);
        }
    }])
    .service('AuthService', ['$http', '$base64', 'AUTH_CFG', function($http, $base64, AUTH_CFG){
        this.login = function(credentials) {
            console.log("login");
            var req = {
                method: 'POST',
                url: 'https://lab.asiainfodata.com:8443/oauth/authorize?response_type=token&client_id=' + AUTH_CFG.oauth_client_id,
                headers: {
                    'X-CSRF-Token': 1,
                    'Authorization': 'Basic ' + $base64.encode(credentials.username + ':' + credentials.password)
                }
            };

            $http(req).success(function(data, status, headers, config){
            }).error(function(data, status, headers, config){
                console.log("fail", headers(), config)
            });
        };
    }]);