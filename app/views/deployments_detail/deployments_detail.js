'use strict';
angular.module('console.deployments.detail', [
        'kubernetesUI',
        {
            files: [
                'views/deployments_detail/deployments_detail.css',
                'components/datepick/datepick.js',
                'components/checkbox/checkbox.js'
            ]
        }
    ])
    .controller('DeploymentsDetailCtrl', ['Ws', '$scope', 'DeploymentConfig', '$rootScope', 'horizontalpodautoscalers', '$stateParams', 'Event', 'mydc', 'mytag',
        function (Ws, $scope, DeploymentConfig, $rootScope, horizontalpodautoscalers, $stateParams, Event, mydc, mytag) {
            $scope.dc = angular.copy(mydc)
            $scope.mytag = angular.copy(mytag)
            $scope.envs = [];
            $scope.grid = {}
            $scope.quota = {}
            $scope.imagedockermap = {}
            $scope.imagemap = {}
            var makeimagemap = function () {
                angular.forEach($scope.mytag.items, function (tag, i) {
                    $scope.imagedockermap[tag.image.dockerImageReference] = {
                        image: tag.metadata.name.split(':')[0],
                        tag: tag.metadata.name.split(':')[1],
                    }
                })
                angular.forEach($scope.imagedockermap, function (image, i) {
                    if (!$scope.imagemap[image.image]) {
                        $scope.imagemap[image.image]=[];
                    }
                    $scope.imagemap[image.image].push({
                        tag: image.tag,
                        dockerImageReference: i
                    })
                })
            }
            makeimagemap()
            var updatedcput = function (dc) {
                DeploymentConfig.put({
                    namespace: $rootScope.namespace,
                    name: dc.metadata.name,
                    region: $rootScope.region
                }, dc, function (res) {
                    $scope.dc = angular.copy(res)
                }, function (res) {

                });
            }
            $scope.updateDc = function () {

                DeploymentConfig.get({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name,
                    region: $rootScope.region
                }, function (datadc) {

                    updatedcput(datadc)

                })

            };
        }])
    .directive('deploymentsEvent', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/deployments_detail/tpl/event.html',
            scope: false,
            controller: ['$scope', 'Ws', 'Event', '$rootScope', function ($scope, Ws, Event, $rootScope) {

                function watchevent(resourceVersion) {
                    Ws.watch({
                        api: 'k8s',
                        resourceVersion: resourceVersion,
                        namespace: $rootScope.namespace,
                        type: 'events',
                        name: ''
                    }, function (res) {
                        var data = JSON.parse(res.data);
                        updateEvent(data);
                    }, function () {
                        //$log.info("webSocket startRC");
                    }, function () {

                    });
                }

                var updateEvent = function (data) {
                    if (data.type == "ADDED") {

                        if (data.object.involvedObject.name.split('-')[0] == $scope.dc.metadata.name) {
                            data.object.mysort = -(new Date(data.object.metadata.creationTimestamp)).getTime()
                            $scope.eventsws.items.push(data.object);

                            //$scope.eventsws.items=sortevent($scope.eventsws.items)
                            //console.log(data.object.involvedObject.name.split('-')[0] == $scope.dc.metadata.name);
                            $scope.$apply()
                        }

                    } else if (data.type == "MODIFIED") {

                        if ($scope.dc && data.object.involvedObject.name.split('-')[0] == $scope.dc.metadata.name) {
                            data.object.mysort = -(new Date(data.object.metadata.creationTimestamp)).getTime()
                            $scope.eventsws.items.push(data.object);
                            $scope.$apply()
                        }

                    }
                    //console.log($scope.eventsws);
                }
                var loadeventws = function () {
                    Event.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (res) {
                        //console.log('event',res);
                        if (!$scope.eventsws) {
                            $scope.eventsws = []
                            var arr = []
                            angular.forEach(res.items, function (event, i) {
                                if (event.involvedObject.kind !== 'BackingServiceInstance') {
                                    if ($scope.dc && event.involvedObject.name.split('-')[0] == $scope.dc.metadata.name && event.involvedObject.name.split('-')[2] != 'build') {
                                        arr.push(event)

                                    }
                                }

                            })
                            angular.forEach(arr, function (item, i) {
                                arr[i].mysort = -(new Date(item.metadata.creationTimestamp)).getTime()
                            })
                            arr.sort(function (x, y) {
                                return x.mysort > y.mysort ? -1 : 1;
                            });
                            $scope.eventsws.items = arr;

                        }


                        $scope.resource = res.metadata.resourceVersion;
                        watchevent(res.metadata.resourceVersion);
                    }, function (res) {
                        //todo 错误处理
                        // $log.info("loadEvents err", res)
                    });

                };
                loadeventws()
            }],
        };
    })
    .directive('deploymentsEnv', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/deployments_detail/tpl/env.html',
            scope: false,
            controller: ['$scope', function ($scope) {
                var inEnvs = function (name) {
                    for (var i = 0; i < $scope.envs.length; i++) {
                        if ($scope.envs[i].name == name) {
                            return true;
                        }
                    }
                    return false;
                };
                var getEnvs = function (containers) {
                    for (var i = 0; i < containers.length; i++) {
                        var envs = containers[i].env || [];
                        for (var j = 0; j < envs.length; j++) {
                            if (!inEnvs(envs[j].name)) {
                                $scope.envs.push(envs[j]);
                            }
                        }
                    }
                };
                getEnvs($scope.dc.spec.template.spec.containers);
                $scope.addEnv = function () {
                    $scope.envs.push({name: '', value: ''});
                }
                $scope.delEnv = function (idx) {
                    $scope.envs.splice(idx, 1);
                };
            }],
        };
    })
    .directive('deploymentsConfig', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/deployments_detail/tpl/config.html',
            scope: false,
            controller: ['$scope', 'horizontalpodautoscalers', '$rootScope', 'GLOBAL', 'ImageStreamTag', 'ImageStream',
                function ($scope, horizontalpodautoscalers, $rootScope, GLOBAL, ImageStreamTag, ImageStream) {
                    var gethor = function (name) {
                        horizontalpodautoscalers.get({namespace: $rootScope.namespace, name: name}, function (hor) {
                            $scope.quota.rubustCheck = true;
                            $scope.horiz = hor;
                        })
                    }
                    $scope.survey = function (idx) {
                        if ($scope.dc.spec.template.spec.containers[idx].doset) {
                            $scope.dc.spec.template.spec.containers[idx].doset = false;
                            delete  $scope.dc.spec.template.spec.containers[idx].readinessProbe;
                        } else {
                            $scope.dc.spec.template.spec.containers[idx].doset = true;
                            $scope.dc.spec.template.spec.containers[idx].dosetcon = "HTTP";
                            $scope.dc.spec.template.spec.containers[idx].readinessProbe = {
                                "httpGet": {
                                    "path": "",
                                    "port": "",
                                    "scheme": "HTTP"
                                },
                                "initialDelaySeconds": "",
                                "timeoutSeconds": "",
                                "periodSeconds": 10,
                                "successThreshold": 1,
                                "failureThreshold": 3
                            }
                        }
                    }
                    $scope.selectimage = function (i,item,con) {
                        console.log(i,item);
                        con.annotate.image = i
                        con.annotate.tag = item[0].tag
                        con.annotate.tags = item;
                    }
                    $scope.selecttag = function (idx, con) {
                        //console.log(con.annotate.tags[idx]);
                        con.annotate.tag = con.annotate.tags[idx].tag;
                        con.image=con.annotate.tags[idx].dockerImageReference;
                        //con.image=
                    }

                    angular.forEach($scope.dc.spec.template.spec.containers, function (con, i) {
                        if (con.image.indexOf(GLOBAL.internal_registry) === 0) {
                            con.display = true;
                            con.annotate = {
                                image: $scope.imagedockermap[con.image].image,
                                tag: $scope.imagedockermap[con.image].tag,
                                images: angular.copy($scope.imagemap),
                                tags: $scope.imagemap[$scope.imagedockermap[con.image].image]
                            }
                        } else {
                            con.display = false;
                        }
                        if (con.readinessProbe) {
                            con.doset = true;
                            if (con.readinessProbe.httpGet) {
                                con.dosetcon = 'HTTP'
                            } else if (con.readinessProbe.tcpSocket) {
                                con.dosetcon = 'TCP'
                            } else if (con.readinessProbe.exec) {
                                var copyexec = angular.copy(con.readinessProbe.exec.command)
                                angular.forEach(copyexec, function (exec, k) {
                                    con.readinessProbe.exec.command[k] = {key: exec};
                                })
                                con.dosetcon = '命令'

                            }
                        }
                    })

                    angular.forEach($scope.dc.spec.triggers, function (trigger) {
                        if (trigger.type == 'ConfigChange') {
                            $scope.grid.configChange = true;
                        }
                    });

                    gethor($scope.dc.metadata.name);
                }],
        };
    })
    .directive('deploymentsHistory', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/deployments_detail/tpl/history.html',
            scope: false,
            controller: ['$scope', 'ReplicationController', '$rootScope', 'Ws', 'Sort',
                function ($scope, ReplicationController, $rootScope, Ws, Sort) {
                    var serviceState = function () {
                        if ($scope.dc.spec.replicas == 0) {
                            return 'ready'; //未启动
                        }
                        if ($scope.dc.status.replicas == 0) {
                            return 'ready'; //未启动
                        }
                        if ($scope.dc.status.replicas == 0) {
                            return 'abnormal';  //异常
                        }
                        if ($scope.dc.status.replicas == $scope.dc.spec.replicas) {
                            return 'normal';    //正常
                        }
                        return 'warning';   //告警
                    };

                    var loadRcs = function (name) {
                        //console.log(name);
                        var labelSelector = 'openshift.io/deployment-config.name=' + name;
                        ReplicationController.get({
                            namespace: $rootScope.namespace,
                            labelSelector: labelSelector,
                            region: $rootScope.region
                        }, function (res) {
                            //$log.info("replicationControllers", res);
                            res.items = Sort.sort(res.items, -1);
                            for (var i = 0; i < res.items.length; i++) {
                                res.items[i].dc = JSON.parse(res.items[i].metadata.annotations['openshift.io/encoded-deployment-config']);
                                if (res.items[i].metadata.name == $scope.dc.metadata.name + '-' + $scope.dc.status.latestVersion) {
                                    //$scope.dc.status.replicas = res.items[i].status.replicas;
                                    $scope.dc.status.phase = res.items[i].metadata.annotations['openshift.io/deployment.phase'];
                                }
                                if (res.items[i].metadata.annotations['openshift.io/deployment.cancelled'] == 'true') {
                                    res.items[i].metadata.annotations['openshift.io/deployment.phase'] = 'Cancelled';
                                }
                            }
                            $scope.rcs = angular.copy(res);
                            //console.log('$scope.rcs', $scope.rcs);
                            $scope.dc.state = serviceState();

                            $scope.resourceVersion = res.metadata.resourceVersion;


                            watchRcs(res.metadata.resourceVersion);
                        }, function (res) {
                            //todo 错误处理
                        });
                    };
                    var watchRcs = function (resourceVersion) {
                        Ws.watch({
                            api: 'k8s',
                            resourceVersion: resourceVersion,
                            namespace: $rootScope.namespace,
                            type: 'replicationcontrollers',
                            name: ''
                        }, function (res) {
                            var data = JSON.parse(res.data);
                            updateRcs(data);
                        }, function () {
                            //$log.info("webSocket startRC");
                        }, function () {
                            //$log.info("webSocket stopRC");
                            var key = Ws.key($rootScope.namespace, 'replicationcontrollers', '');
                            if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                                return;
                            }
                        });
                    };
                    //执行log
                    var updateRcs = function (data) {

                        if (data.type == 'ADDED') {

                            if ($scope.rcs.items.length > 0) {
                                $scope.rcs.items.unshift(data.object);
                            } else {
                                $scope.rcs.items = [data.object];
                            }
                        } else if (data.type == "MODIFIED") {

                            $scope.baocuname = data.object.metadata.name;

                            if (data.object.spec.selector.deploymentconfig === $scope.dc.metadata.name) {
                                $scope.dc.spec.replicas = data.object.spec.replicas;
                                $scope.dc.status.replicas = data.object.status.replicas;
                                $scope.$apply();
                            }
                            angular.forEach($scope.rcs.items, function (item, i) {
                                if (item.metadata.name == data.object.metadata.name) {
                                    $scope.rcs.items[i] = data.object;
                                    $scope.$apply();
                                }
                            });
                        }

                    };
                    loadRcs($scope.dc.metadata.name);
                }],
        };
    })

