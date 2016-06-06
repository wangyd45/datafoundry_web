'use strict';

angular.module("console.search", [
    {
        files: ['components/searchbar/searchbar.css']
    }
])

    .directive('cSearch', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/searchbar/searchbar.html',
            scope: {
                search: '='
            },
            controller:['$scope', function ($scope) {
              
              $scope.$watch('txt',function (n,o) {
                console.log(n);
              })
                $scope.doSearch = function(tp, txt){
                    $scope.showTip = false;
                    $scope.search(tp, txt);
                }
            }]
        }
    }]);

