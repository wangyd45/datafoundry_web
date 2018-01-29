'use strict';angular.module('console.resource_management', [    {        files: [            'components/searchbar/searchbar.js',            'views/resource_persistentVolume/resource_persistentVolume.css'        ]    }])    .controller('configMapCtrl', ['$log', 'Ws', 'DeploymentConfig', 'persistent', '$state', '$rootScope', '$scope', 'configmaps', 'secretskey',        function ($log, Ws, DeploymentConfig, persistent, $state, $rootScope, $scope, configmaps, secretskey) {            $scope.grid = {                page: 1,                size: 10,                txt: ''            };            $scope.$watch('grid.page', function (newVal, oldVal) {                if (newVal != oldVal) {                    refresh(newVal);                }            });            var refresh = function (page) {                $(document.body).animate({                    scrollTop: 0                }, 200);                var skip = (page - 1) * $scope.grid.size;                $scope.configitems = $scope.configdata.slice(skip, skip + $scope.grid.size)||[];            };            $scope.$on('$destroy', function () {                Ws.clear();            });            $scope.loadconfigmaps = function () {                configmaps.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (res) {                    if (res.items && res.items.length > 0) {                        angular.forEach(res.items, function (item, i) {                            res.items[i].sorttime = (new Date(item.metadata.creationTimestamp)).getTime()                        })                        //console.log($scope.items);                        res.items.sort(function (x, y) {                            return x.sorttime > y.sorttime ? -1 : 1;                        });                        if (!res.items) {                            $scope.configdata = [];                        } else {                            $scope.configdata = res.items;                        }                        $scope.copyconfigdata = angular.copy($scope.configdata)                        $scope.grid.total = $scope.configdata.length;                        $scope.grid.page = 1;                        $scope.grid.txt = '';                        refresh(1);                    }                })            }            $scope.newreload=function(){                $scope.loadconfigmaps();            }            $scope.text2='您还没有创建配置卷';            $scope.search = function (event) {                if (true) {                    if (!$scope.grid.txt) {                        $scope.configdata = angular.copy($scope.copyconfigdata)                        refresh(1);                        $scope.grid.total = $scope.configdata.length;                        return;                    }                    $scope.configdata = [];                    var iarr = [];                    var str = $scope.grid.txt;                    str = str.toLocaleLowerCase();                    //console.log('$scope.copydata', $scope.copydata);                    angular.forEach($scope.copyconfigdata, function (item, i) {                        //console.log(item.build);                        var nstr = item.metadata.name;                        nstr = nstr.toLocaleLowerCase();                        if (nstr.indexOf(str) !== -1) {                            iarr.push(item)                        }                        //console.log(repo.instance_data, $scope.grid.txt);                    })                    if(iarr.length===0){                        $scope.isQuery=true;                        $scope.text2='没有查询到相关数据';                    }                    else{                        $scope.text2='您还没有创建配置卷';                    }                    $scope.configdata=angular.copy(iarr);                    refresh(1);                    //console.log('$scope.data', $scope.configdata);                    $scope.grid.total = $scope.configdata.length;                }            };            $scope.loadconfigmaps();        }])