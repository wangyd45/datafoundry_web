'use strict';
angular.module('console.stateful-sets-detail', [{
        files: [
            'views/apps/apps.css',
            'views/apps/stateful-sets-detail/stateful-sets-detail.css',
            'components/deploymentsevent/deploymentsevent.js',
            'components/public_metrics/public_metrics.js'
        ]
    }])
    .controller('Stateful-setsDetailCtrl', ['stateful','podList', 'Pod', '$stateParams', '$scope','delTip','toastr','$rootScope','statefulsets','$state', 'statefulsetsdele',
        function (stateful,podList, Pod, $stateParams, $scope,delTip,toastr,$rootScope,statefulsets,$state, statefulsetsdele) {
            $scope.dcName = $stateParams.name;
            $scope.stateful=angular.copy(stateful);
            $scope.podlist = angular.copy(podList);
            $scope.conname=$scope.stateful.spec.template.spec.containers[0].name;
            $scope.statefuldetail = $scope.stateful;
            var getOwnerReferences = function (apiObject) {
                return _.get(apiObject, 'metadata.ownerReferences');
            };
            var filterForController = function (apiObjects, controller) {
                var controllerUID = _.get(controller, 'metadata.uid');
                return _.filter(apiObjects, function (apiObject) {
                    return _.some(getOwnerReferences(apiObject), {
                        uid: controllerUID,
                        controller: true
                    });
                });
            };
            $scope.statefulPods = filterForController(podList.items, $scope.stateful);
            var poduid = [];
            for (var i = 0; i < $scope.statefulPods.length; i++) {
                poduid.push($scope.statefulPods[i].metadata.uid);
            }

            $scope.poduid = poduid.join('|');
            console.log('newpoduid', $scope.poduid);
            $scope.delete = function(name){
                delTip.open("删除statefulset", name, true).then(function () {
                    statefulsetsdele.delete({ namespace: $scope.namespace,name:name }, function (res) {
                        $state.go('console.stateful-sets',{namespace:$rootScope.namespace});
                        toastr.success('操作成功', {
                            timeOut: 2000,
                            closeButton: true
                        });
                    }, function () {
                        //Confirm.open("删除Pod", "删除" + name + "失败", null, null, true)
                        toastr.error('删除失败,请重试', {
                            timeOut: 2000,
                            closeButton: true
                        });
                    })
                })
            }
        }
    ]);