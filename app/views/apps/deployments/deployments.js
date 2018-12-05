'use strict';
angular.module('console.deployments', [{
    files: [
        'components/searchbar/searchbar.js',
        'views/apps/apps.css'
    ]
}])
    .controller('DeploymentsCtrl', ['Sort', '$log', '$rootScope', '$scope', 'replicas', 'mydcs', '$filter', 'mydeployment', 'ReplicaSet', 'Ws',
        function (Sort, $log, $rootScope, $scope, replicas, mydcs, $filter, mydeployment, ReplicaSet, Ws) {
            $scope.text = "您还没有部署镜像";
            $scope.begin_blank = true;
            //$scope.text = "No deployments have been added to project " + $scope.namespace + ".";
            $scope.grid = {
                page: 1,
                size: 10,
                txt: ''
            };
            $scope.gridTwo = {
                page: 1,
                size: 10,
                txt: ''
            };
            $scope.gridThree = {
                page: 1,
                size: 10,
                txt: ''
            };
            $scope.gridFour = {
                page: 1,
                size: 10,
                txt: ''
            };

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal);
                }
            });
            var refresh = function (page) {
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                var skip = (page - 1) * $scope.grid.size;
                $scope.deploymentOneItem = $scope.items.slice(skip, skip + $scope.grid.size) || [];
            };

            $scope.dc = angular.copy(mydcs);
            $scope.dc.items = Sort.sort(mydcs.items, -1)
            $scope.replicas = angular.copy(replicas);

            $scope.deployment = angular.copy(mydeployment);
            //console.log('$scope.deployment.items', $scope.deployment.items);
            $scope.deployment.items = Sort.sort(mydeployment.items, -1)
            //console.log('$scope.deployment.items', $scope.deployment.items);

            $scope.replicasets = angular.copy(ReplicaSet);
            $scope.otherreplicas = [];
            $scope.otherreplicasets = [];

            angular.forEach($scope.dc.items, function (item, i) {
                angular.forEach($scope.replicas.items, function (rc, j) {
                    //console.log('item', item.metadata.name);
                    if (rc.spec.selector.deploymentconfig === item.metadata.name) {
                        rc.hasdc = true
                    }
                })
            })

            angular.forEach($scope.replicas.items, function (rc, j) {
                if (!rc.hasdc) {
                    $scope.otherreplicas.push(rc);
                }
            })

            angular.forEach($scope.replicasets.items, function (rs, j) {
                //console.log('rs', rs);
                //if ($scope.deployment.length<1) {
                angular.forEach($scope.deployment.items, function (item, i) {
                    //console.log('rs.metadata.ownerReferences[0].name', rs.metadata.ownerReferences[0].name, item.metadata.name);
                    if (rs.metadata.ownerReferences && rs.metadata.ownerReferences[0] && rs.metadata.ownerReferences[0].kind === 'Deployment' && rs.metadata.ownerReferences[0].name === item.metadata.name) {
                        rs.hasdc = true
                    }
                })
                //}else{
                //    $scope.otherreplicasets.push(rs)
                //}

            })
            angular.forEach($scope.replicasets.items, function (rs, j) {
                if (!rs.hasdc) {
                    $scope.otherreplicasets.push(rs);
                }
            })
            console.log($scope.otherreplicasets);
            $scope.items = addrc($scope.dc.items);
            $scope.mydeploylist = addrs($scope.deployment.items);
            // console.log('$scope.replicas', $scope.mydeploylist);
            $scope.deploymentOne = angular.copy($scope.items);
            $scope.grid.total = $scope.items.length;
            $scope.grid.page = 1;
            $scope.grid.txt = '';
            refresh(1);


            $scope.deploymentTwo = angular.copy($scope.mydeploylist);
            $scope.gridTwo.total = $scope.mydeploylist.length;
            $scope.gridTwo.page = 1;
            refreshTwo(1);
            //console.log('$scope.otherreplicas', $scope.otherreplicas);
            $scope.otherreplicascopy = angular.copy($scope.otherreplicas);
            $scope.gridThree.total = $scope.otherreplicas.length;
            $scope.gridThree.page = 1;
            gridThree(1)
            $scope.otherreplicasetscopy = angular.copy($scope.otherreplicasets);
            $scope.gridFour.total = $scope.otherreplicas.length;
            $scope.gridFour.page = 1;
            gridFour(1)
            Wsapi($scope.mydeploylist, mydeployment.metadata.resourceVersion, 'extensions', 'deployments', function (items) {
                $scope.mydeploylist = addrs(items);
                //$scope.grid.total = $scope.items.length;
                refreshTwo(1);
            })
            Wsapi(ReplicaSet.items, ReplicaSet.metadata.resourceVersion, 'extensions', 'replicasets', function (items) {
                ;
                refreshTwo(1);
            })
            Wsapi($scope.items, mydcs.metadata.resourceVersion, false, 'deploymentconfigs', function (items) {
                $scope.items = addrc(items, $scope.replicas.items);
                $scope.grid.total = $scope.items.length;
                refresh(1);
            })
            Wsapi(replicas.items, mydcs.metadata.resourceVersion, 'k8s', 'replicationcontrollers', function (items) {
                $scope.replicas.items = angular.copy(items)
                $scope.items = addrc($scope.items, items);
                $scope.grid.total = $scope.items.length;
                refresh(1);
            })
            function Wsapi(items, resourceVersion, api, type, callback) {
                watchapi(items, resourceVersion, api, type, callback)
            }

            function watchapi(items, resourceVersion, api, type, callback) {
                var sendobj = {
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: type
                }
                if (api) {
                    sendobj.api = api
                }

                Ws.watch(sendobj, function (res) {
                    var data = JSON.parse(res.data);
                    updateapi(items, data, callback);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");
                });
            };
            function updateapi(items, data, callback) {
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    return;
                } else if (data.type == 'ADDED') {
                    items.unshift(data.object)
                } else if (data.type == "MODIFIED") {
                    // console.log('items', items);
                    angular.forEach(items, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            items[i] = data.object;
                        }
                    })
                } else if (data.type == "DELETED") {
                    angular.forEach(items, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            items.splice(i, 1)

                        }
                    })
                }
                callback(items)
                $scope.$apply();
            }

            $scope.$watch('gridTwo.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refreshTwo(newVal);
                }
            });
            $scope.$watch('gridThree.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    gridThree(newVal);
                }
            });
            $scope.$watch('gridFour.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    gridFour(newVal);
                }
            });
            function refreshTwo(page) {
                var skip = (page - 1) * $scope.gridTwo.size;
                $scope.deploymentTwoItem = $scope.mydeploylist.slice(skip, skip + $scope.gridTwo.size) || [];
            };
            function gridThree(page) {
                var skip = (page - 1) * $scope.gridThree.size;
                $scope.otherreplicasItem = $scope.otherreplicas.slice(skip, skip + $scope.gridThree.size) || [];
            };
            function gridFour(page) {
                var skip = (page - 1) * $scope.gridFour.size;
                $scope.otherreplicasetsItem = $scope.otherreplicasets.slice(skip, skip + $scope.gridFour.size) || [];
            };

            function checkArr(arr) {
                var iarr = [];
                var str = $scope.grid.txt;
                str = str.toLocaleLowerCase();
                angular.forEach(arr, function (item, i) {
                    var nstr = item.metadata.name;
                    nstr = nstr.toLocaleLowerCase();
                    if (nstr.indexOf(str) !== -1) {
                        iarr.push(item)
                    }
                })
                $scope.isQuery = false;
                if (iarr.length === 0) {
                    $scope.isQuery = true;
                    $scope.begin_blank = false;
                    $scope.text = '没有查询到符合条件的数据';
                    // console.log($scope.items.length);
                }
                else {
                    $scope.text = '您还没有任何部署镜像数据，现在就创建一个吧';
                }
                return iarr;
            }

            $scope.search = function (event) {
                $scope.grid.page = 1;
                $scope.gridTwo.page = 1;
                $scope.gridThree.page = 1;
                $scope.gridFour.page = 1;
                if (!$scope.grid.txt) {
                    $scope.items = angular.copy($scope.deploymentOne);
                    $scope.mydeploylist = angular.copy($scope.deploymentTwo);
                    $scope.otherreplicas = angular.copy($scope.otherreplicascopy);
                    $scope.otherreplicasets = angular.copy($scope.otherreplicasetscopy);
                    refresh(1);
                    refreshTwo(1);
                    gridThree(1);
                    gridFour(1);
                    $scope.grid.total = $scope.items.length;
                    $scope.gridTwo.total = $scope.mydeploylist.length;
                    $scope.gridThree.total = $scope.otherreplicas.length;
                    $scope.gridFour.total = $scope.otherreplicasets.length;
                    return;
                }
                $scope.items = [];
                $scope.mydeploylist = [];
                $scope.otherreplicas = [];
                $scope.otherreplicasets = [];
                $scope.items = angular.copy(checkArr($scope.deploymentOne));
                $scope.mydeploylist = angular.copy(checkArr($scope.deploymentTwo));
                $scope.otherreplicas = angular.copy(checkArr($scope.otherreplicascopy));
                $scope.otherreplicasets = angular.copy(checkArr($scope.otherreplicasetscopy));
                refresh(1);
                refreshTwo(1);
                gridThree(1);
                gridFour(1);
                $scope.grid.total = $scope.items.length;
                $scope.gridTwo.total = $scope.mydeploylist.length;
                $scope.gridThree.total = $scope.otherreplicas.length;
                $scope.gridFour.total = $scope.otherreplicasets.length;

            };


            function addrc(dc, rcitems) {
                var replicasitems = [];
                if (rcitems) {
                    replicasitems = angular.copy(rcitems);
                } else {
                    replicasitems = $scope.replicas.items;
                }
                if (dc) {
                    angular.forEach(dc, function (item, i) {
                        angular.forEach(replicasitems, function (replica) {
                            //console.log(replica);
                            if (item.metadata.name + '-' + item.status.latestVersion === replica.metadata.name) {

                                item.rc = replica || {};
                                item.rc.kind = "ReplicationController"
                            }
                        })
                    })
                    return angular.copy(dc);

                }
            }

            function addrs(dc) {
                if (dc) {
                    angular.forEach(dc, function (item, i) {
                        angular.forEach(ReplicaSet.items, function (replics) {
                            if (item.metadata.annotations && replics.metadata.annotations){
                                if (item.metadata.annotations['deployment.kubernetes.io/revision'] === replics.metadata.annotations['deployment.kubernetes.io/revision']) {
                                    item.rs = replics || {}
                                }
                            }
                        })
                    })
                    // console.log('dc', dc);
                    return angular.copy(dc);

                }
            }
        }
    ]);