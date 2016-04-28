'use strict';
angular.module('console.backing_service',[
    {
        files: [
            'views/backing_service/backing_service.css',
            'components/bscard/bscard.js'
        ]
    }
])
.controller('BackingServiceCtrl',['$log','$rootScope','$scope','BackingService','BackingServiceInstance','ServiceSelect','BackingServiceInstanceBd',function ($log,$rootScope,$scope,BackingService,BackingServiceInstance,ServiceSelect,BackingServiceInstanceBd){
    $scope.status = {};
    $scope.grid = {
        serviceCat: 'all',
        vendor: 'all'
    };
    var loadBs = function(){
        BackingService.get({namespace:'openshift'},function(data){
            $log.info('loadBs',data);
            $scope.items = data.items;
            $scope.data = data.items;
        })
    }
    loadBs();
    var loadBsi = function () {
        BackingServiceInstance.get({namespace: $rootScope.namespace}, function(res){
            $log.info("backingServiceInstance", res);
            $scope.bsi = res;

        }, function(res){
            //todo 错误处理
            $log.info("loadBsi err", res);
        });
    };
    loadBsi();
    $scope.delBing = function(idx){
        $log.info('delBing$scope.bsi',$scope.bsi.items[idx]);
        for(var i = 0 ;i < $scope.bsi.items[idx].spec.binding.length;i++){
            if($scope.bsi.items[idx].spec.binding[i].checked == true){
                var bindObj = {
                    metadata: {
                        name: $scope.bsi.items[idx].metadata.name
                    },
                    resourceName : $scope.bsi.items[idx].spec.binding[i].bind_deploymentconfig,
                    bindResourceVersion : '',
                    bindKind : 'DeploymentConfig'
                };
                var j = i;
                BackingServiceInstanceBd.put({namespace: $rootScope.namespace,name : $scope.bsi.items[idx].metadata.name},bindObj, function(res){
                    alert(j)
                    $scope.bsi.items[idx].spec.binding.splice(j,1);
                    console.log(res+'OK');
                }, function(res){
                    $log.info(curbsi);
                    //todo 错误处理
                    $log.info("err", res);
                });

            }
        }

    };

    $scope.bindModal = function(){
        ServiceSelect.open().then(function(res){
            $log.info("bind modal", res);
        });
    };
}])
.service('ServiceSelect', ['$uibModal', function($uibModal){
    this.open = function () {
        return $uibModal.open({
            templateUrl: 'views/backing_service/service_select.html',
            size: 'default modal-foo',
            controller: ['$rootScope', '$scope', '$uibModalInstance', 'data', function($rootScope, $scope, $uibModalInstance, data) {
                $scope.data = data;
                $scope.items = data.items;
                $scope.cancel = function() {
                    $uibModalInstance.dismiss();
                };
                $scope.ok = function() {
                    var items = [];
                    for (var i = 0; i < $scope.data.items.length; i++) {
                        if ($scope.data.items[i].checked) {
                            items.push($scope.data.items[i]);
                        }
                    }
                    $uibModalInstance.close(items);
                };

                $scope.$watch('txt', function(newVal, oldVal){
                   if (newVal != oldVal) {
                       $scope.search(newVal);
                   }
                });

                $scope.search = function (txt) {
                    if(!txt){
                        $scope.items = $scope.data.items;
                    }else{
                        $scope.items = [];
                        txt = txt.replace(/\//g, '\\/');
                        var reg = eval('/' + txt + '/');
                        angular.forEach($scope.data.items, function(item) {
                            if (reg.test(item.metadata.name)) {
                                $scope.items.push(item);
                            }
                        })
                    }
                };
            }],
            resolve: {
                data: ['$rootScope', 'Service', function ($rootScope, Service) {
                    return Service.get({namespace: $rootScope.namespace}).$promise;
                }]
            }
        }).result;
    }
}]);