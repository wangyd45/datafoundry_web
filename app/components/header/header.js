'use strict';

angular.module("console.header", [{
    files: ['components/header/header.css']
}])

    .directive('cHeader', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/header/header.html',
            controller: ['allTenants','GLOBAL', '$timeout', '$log', 'Project', 'account', 'regions', 'Toast', 'Addmodal', '$http', '$location', 'orgList', '$rootScope', '$scope', '$window', '$state', 'Cookie', '$stateParams',
                function (allTenants,GLOBAL, $timeout, $log, Project, account, regions, Toast, Addmodal, $http, $location, orgList, $rootScope, $scope, $window, $state, Cookie, $stateParams) {
                    allTenants.query({name: "admin"}, function(data){
                        createTree(data);
                        console.log('createTree(data)',$scope.tenantsTree);

                    }, function(res) {
                        //todo 错误处理
                    });
                    function createTree(trees) {
                        $scope.tenantsTree = [];
                        $scope.treemap = {};
                        angular.forEach(trees, function(item) {
                            $scope.treemap[item.id] = item;
                            $scope.treemap[item.id].children = [];
                        });
                        angular.forEach(trees, function(item) {
                            if (item.parentId) {
                                if ($scope.treemap[item.parentId]) {
                                    $scope.treemap[item.parentId].children.push(item);
                                } else {
                                    delete $scope.treemap[item.id].parentId;
                                    $scope.tenantsTree.push($scope.treemap[item.id]);
                                }
                            } else {
                                $scope.tenantsTree.push($scope.treemap[item.id]);
                            }
                        });
                        let cinf = function(father) {
                            angular.forEach(father.children, function(child) {
                                cinf(child);
                                angular.forEach(child.bsis, function(bsi) {
                                    father.bsis.push(bsi);
                                });
                            });
                        };
                        angular.forEach($scope.tenantsTree, function(tree) {
                            cinf(tree);
                        });
                        $scope.selected = $scope.tenantsTree[0];

                    }

                    ///////分区
                    if (navigator.userAgent.indexOf("Firefox") > 0) {
                        $('#testjt').unbind('DOMMouseScroll');
                        $('#testjt').bind('DOMMouseScroll', function (e) {
                            if (e.detail > 0) {
                                document.getElementById('testjt').scrollBy(0, 40);
                            } else {
                                document.getElementById('testjt').scrollBy(0, -40);
                            }
                        })
                    }
                    //$scope.curregion = $rootScope.region;
                    //console.log('$rootScope.user',$rootScope.user);
                    //console.log('$rootScope.namespace',$rootScope.namespace);
                    //if ($rootScope.user.metadata.name) {
                    //
                    //}
                    //$scope.checkregion = function (res, id) {
                    //    $scope.curregion = res;
                    //    $rootScope.namespace=$rootScope.user.metadata.name
                    //    Cookie.set('namespace', $rootScope.namespace, 10 * 365 * 24 * 3600 * 1000);
                    //    $rootScope.region = id
                    //    Cookie.set('region', id, 10 * 365 * 24 * 3600 * 1000);
                    $scope.nolohout = false;
                    if (GLOBAL.sso_switch === 'true') {
                        $scope.nolohout = true;
                    }
                    //   // console.log($state.current.name);
                    //    if ($state.current.name === 'console.dashboard') {
                    //        $state.reload();
                    //    } else {
                    //        $state.go("console.dashboard", { namespace: $rootScope.namespace });
                    //    }
                    //    //$state.reload();
                    //}
                    $scope.$watch('namespace', function (n, o) {
                        if (n === o) {
                            return
                        }
                        if (n !== "") {
                            if (n === $rootScope.user.metadata.name) {
                                $scope.orgimage = false;
                            } else {
                                $scope.orgimage = true;
                            }
                            loadProject()
                        }

                    })
                    $scope.$watch('changedisplayname', function (n, o) {
                        if (n === o) {
                            return
                        }
                        //console.log($rootScope.changedisplayname);

                        //if (n === $rootScope.user.metadata.name) {
                        //    $scope.orgimage = false;
                        //} else {
                        //    $scope.orgimage = true;
                        //}
                        loadProject()

                    })
                    var loadProject = function () {
                        //$log.info("load project");
                        Project.get({ region: $rootScope.region }, function (data) {

                            angular.forEach(data.items, function (item, i) {
                                //console.log('$rootScope.namespace', $rootScope.namespace);
                                if (item.metadata.name === $rootScope.namespace) {

                                    $scope.projectname = item.metadata.annotations['openshift.io/display-name'] === '' || !item.metadata.annotations['openshift.io/display-name'] ? item.metadata.name : item.metadata.annotations['openshift.io/display-name'];
                                    //console.log('item', item);
                                }
                            })

                            angular.forEach(data.items, function (item, i) {


                                //console.log($rootScope.user.metadata.name);
                                data.items[i].sortname = item.metadata.annotations['openshift.io/display-name'] || item.metadata.name;


                            })
                            data.items.sort(function (x, y) {
                                return x.sortname > y.sortname ? 1 : -1;
                            });
                            angular.forEach(data.items, function (project, i) {

                                if (/^[\u4e00-\u9fa5]/i.test(project.metadata.annotations['openshift.io/display-name'])) {
                                    //console.log(project.metadata.annotations['openshift.io/display-name']);
                                    //data.items.push(project);
                                    data.items.unshift(project);

                                    data.items.splice(i + 1, 1);
                                }
                            });

                            $rootScope.projects = data.items;
                        }, function (res) {
                            $log.info("find project err", res);
                        });
                    };

                    loadProject()

                    //regions.query({}, function (data) {
                    //    //console.log('regions', data);
                    //    $scope.regions = data;
                    //    $scope.copyregions = angular.copy(data);
                    //    angular.forEach(data, function (region, i) {
                    //        if (region.identification === $rootScope.region) {
                    //            $scope.curregion = region.region_describe;
                    //        }
                    //
                    //    })
                    //})

                    $scope.$watch('curregion', function (n, o) {
                        if (n === o) {
                            return
                        }
                        //$scope.regionlist=$scope.copyregionlist;
                        var arr = angular.copy($scope.copyregions)
                        if ($scope.regions) {
                            //console.log($scope.regionlist,$scope.copyregionlist);
                            angular.forEach($scope.copyregions, function (item, i) {
                                if (item.region_describe === n) {
                                    //console.log(item.region_describe, $scope.regionlist);
                                    arr.splice(i, 1);

                                }
                            })
                            $scope.regions = arr;
                        }
                    })
                    //$scope.regionlist = [
                    //    {regionname : '一区一区'},
                    //    {regionname : '二区二区'}
                    //]


                    //if ($state.params.useorg) {
                    //    $http({
                    //        url: '/lapi/orgs/' + $state.params.useorg,
                    //        method: 'GET'
                    //    }).success(function (data, header, config, status, orgid) {
                    //        //alert(data.name)
                    //        $scope.checked = data.name;
                    //    }).error(function (data, header, config, status) {
                    //    });
                    //
                    //}

                    //$scope.checked = '';

                    //if($rootScope.delOrgs){
                    //    $http({
                    //        url:'/lapi/orgs/'+$state.params.useorg,
                    //        method:'GET'
                    //    }).success(function(data,header,config,status,orgid){
                    //        $scope.checked = data.name;
                    //    }).error(function(data,header,config,status){
                    //    });
                    //}

                    //$scope.$watch('delOrgs', function (n, o) {
                    //    if (n == o) {
                    //        return;
                    //    }
                    //    if (n) {
                    //        //alert()
                    //        $scope.checked = $rootScope.user.metadata.name;
                    //        $http({
                    //            url: '/lapi/orgs',
                    //            method: 'GET'
                    //        }).success(function (data, header, config, status, orgid) {
                    //            $scope.userorgs = data.orgnazitions;
                    //            $rootScope.delOrgs = false;
                    //        }).error(function (data, header, config, status) {
                    //        });
                    //    } else {
                    //        //$rootScope.isorg = false;
                    //    }
                    //})
                    //$scope.$watch('$state.params.useorg', function (n, o) {
                    //    if (n == o) {
                    //        return;
                    //    }
                    //    if ($state.params.useorg) {
                    //        //$rootScope.isorg = true;
                    //        $scope.neworgid = $state.params.useorg
                    //    } else {
                    //        //$rootScope.isorg = false;
                    //    }
                    //})
                    //$rootScope.isorg = false;
                    //$scope.$watch('namespace', function (n, o) {
                    //    //console.log('new', n);
                    //    if (n == o) {
                    //        return
                    //    }
                    //    if (n.indexOf('org') == -1) {
                    //        $rootScope.isorg = false;
                    //        $http({
                    //            url: '/lapi/inbox_stat',
                    //            method: 'GET',
                    //        }).success(function (res) {
                    //            //console.log("test the inbox stat", res);
                    //            if (res.data == null) {
                    //                res.data = {};
                    //            }
                    //            if (res.data.sitenotify || res.data.accountms || res.data.alert) {
                    //                $scope.isshow = true;
                    //            } else {
                    //                $scope.isshow = false;
                    //            }
                    //            ;
                    //        }).error(function (data) {
                    //            //console.log("Couldn't get inbox message", data)
                    //        });
                    //        $scope.timer = setInterval(function () {
                    //            $http({
                    //                url: '/lapi/inbox_stat',
                    //                method: 'GET',
                    //            }).success(function (res) {
                    //                //console.log("test the inbox stat", res);
                    //                if (res.data == null) {
                    //                    res.data = {};
                    //                }
                    //                if (res.data.sitenotify || res.data.accountms || res.data.alert) {
                    //                    $scope.isshow = true;
                    //                } else {
                    //                    $scope.isshow = false;
                    //                }
                    //                ;
                    //            }).error(function (data) {
                    //                //console.log("Couldn't get inbox message", data)
                    //            });
                    //        }, 1000000)
                    //    } else {
                    //        clearInterval($scope.timer);
                    //        $rootScope.isorg = true;
                    //    }
                    //
                    //
                    //});
                    //$scope.$on('$destroy', function () {
                    //    clearInterval($scope.timer);
                    //});


                    //account.get({
                    //    namespace: $rootScope.namespace,
                    //    region: $rootScope.region,
                    //    status: "consuming"
                    //}, function (data) {
                    //    //console.log('套餐', data);
                    //    //$rootScope.payment=data;
                    //    if (data.purchased) {
                    $scope.cancreatorg = true
                    //跳转dashboard
                    //    } else {
                    //        $scope.cancreatorg = false
                    //        //跳转购买套餐
                    //    }
                    //})

                    $scope.createOrg = function () {
                        Addmodal.open('创建组织', '组织名称', '', '', 'org').then(function (res) {
                            //orgList.get({}, function (org) {
                            // console.log(org);
                            //console.log(1);

                            Toast.open('创建成功')
                            $timeout(function () {
                                loadProject()
                            }, 2000)

                            //    $scope.userorgs = org.orgnazitions;
                            //})
                        })

                    }

                    $scope.back = function () {
                        //console.log($state);
                        //if ($state.current.name == "console.image_detail") {
                        //    $state.go('console.image', { index: 1 })
                        //} else if ($state.current.name == "console.image_Public") {
                        //    $state.go('console.image', { index: 3 })
                        //} else if ($state.current.name == "console.image_regstry") {
                        //    $state.go('console.image', { index: 2 })
                        //} else {
                        $window.history.back();
                        //}
                    };

                    // console.log($location.url().split('/')[2])
                    //if ($location.url().split('/')[2] === 'org') {
                    //    $http({
                    //        url: '/lapi/orgs/' + $location.url().split('/')[3],
                    //        method: 'GET'
                    //    }).success(function (data) {
                    //        // console.log('112',data.name)
                    //        $scope.checked = data.name
                    //    })
                    //} else if ($rootScope.huancun && $rootScope.huancun.name) {
                    //    $scope.checked = $rootScope.huancun.name;
                    //    $rootScope.huancun.name = false
                    //} else if (!$scope.checked) {
                    //    $scope.checked = $rootScope.namespace;
                    //}

                    $scope.backindex = function () {
                        $rootScope.whereclick = '首页';
                        //$state.go('login')
                    }

                    $scope.gotomy = function () {
                        //$scope.checked = $rootScope.user.metadata.name;
                        $rootScope.namespace = $rootScope.user.metadata.name;
                        Cookie.set('namespace', $rootScope.user.metadata.name, 10 * 365 * 24 * 3600 * 1000);
                    }

                    //$scope.goto = function (ind) {
                    //    $scope.checked = $scope.userorgs[ind].name;
                    //    $rootScope.namespace = $scope.userorgs[ind].id;
                    //    $scope.neworgid = $scope.userorgs[ind].id
                    //    //console.log('路由',$state);
                    //    if ($state.current.name == 'console.apply_instance' || $state.current.name == 'console.build_create_new' || $state.current.name == 'console.service_create') {
                    //        return
                    //    } else if ($state.current.url.indexOf(':') !== -1 && $state.current.name !== 'console.dashboard') {
                    //        //$location.url('/'+)
                    //        //console.log($state.current.url.split('/')[1]);
                    //        $location.url('/console/' + $state.current.url.split('/')[1])
                    //    } else if ($state.current.name == 'console.dashboard') {
                    //        //console.log($rootScope.namespace);
                    //        $state.reload();
                    //    }
                    //    //console.log('路由',$state);
                    //
                    //}

                    //orgList.get({}, function (org) {
                    //    // console.log(org);
                    //    $scope.userorgs = org.orgnazitions;
                    //});
                    //图片预加载
                    var images = new Array()

                    function preload() {
                        for (var i = 0; i < arguments.length; i++) {
                            images[i] = new Image()
                            images[i].src = arguments[i]
                        }
                    };

                    preload(
                        "components/sidebar/img/build-active.png",
                        "components/sidebar/img/dashboard-active.png",
                        "components/sidebar/img/deployment-active.png",
                        "components/sidebar/img/make-active.png",
                        "components/sidebar/img/repository-active.png",
                        "components/sidebar/img/resource-active.png",
                        "components/sidebar/img/service-active.png",
                        //"pub/img/myimageh.png",
                        //"pub/img/registimageh.png",
                        //"pub/img/imagecenterh.png",
                        "pub/img/myimage.png",
                        "pub/img/registimage.png",
                        "pub/img/imagecenter.png"
                    );

                    $scope.hasBack = function () {

                        if ($state.current.name == "console.private-image"  || $state.current.name == "console.repository-image" || $state.current.name == "console.resource_secret" || $state.current.name == "console.resource_configMap" || $state.current.name == "console.resource_persistentVolume" || $state.current.name == "console.stateful-sets" || $state.current.name == "console.routes" || $state.current.name == "console.services" || $state.current.name == "console.pods" || $state.current.name == "console.deployments" || $state.current.name == "console.noplan" || $state.current.name == "console.Integration" || $state.current.name == "console.build" || $state.current.name == "console.image" || $state.current.name == "console.service" || $state.current.name == "console.backing_service" || $state.current.name == "console.dashboard" || $state.current.name == "console.user" || $state.current.name == "console.notification" || $state.current.name == "console.resource_management" || $state.current.name == "console.pipeline") {

                            return false
                        }
                        return true;
                    };

                    //$scope.$watch("orgStatus", function (n, old) {
                    //    // console.log("%%%%%%", n, old);
                    //    if (n) {
                    //        orgList.get({}, function (org) {
                    //            $scope.userorgs = org.orgnazitions;
                    //            //alert(11)
                    //            $scope.checked = $rootScope.namespace;
                    //
                    //            $rootScope.orgStatus = false;
                    //
                    //        })
                    //    }
                    //})

                    //$scope.$watch('checked', function (n, o) {
                    //    if (n == o) {
                    //        return
                    //    }
                    //    console.log('checked', n);
                    //})
                    //console.log('$rootScope',$rootScope);
                    $rootScope.huancun = {}

                    $scope.logout = function () {
                        Cookie.clear('df_access_token');
                        Cookie.clear('namespace');
                        Cookie.clear('region');
                        $rootScope.region = '';
                        $scope.checked = '';
                        $rootScope.user = null;
                        $rootScope.namespace = "";
                        //clearInterval($scope.timer);
                        $state.go('login');

                    };
                    $scope.change = false;

                    $scope.setNamespace = function (namespace) {
                        //console.log(namespace);
                        $rootScope.activeNode = $rootScope.dataForTheTree[0];
                        $rootScope.namespace = namespace;
                        Cookie.set('namespace', namespace, 10 * 365 * 24 * 3600 * 1000);
                        //$state.reload();
                        //$scope.change=true;
                        //$scope.checked = namespace;
                        //$rootScope.huancun.name = namespace;
                        //console.log('$scope.checked', $scope.checked);
                        //if (namespace) {
                        //    $state.go('console.org', {
                        //        useorg: namespace
                        //    });
                        //} else {
                        //console.log('$state.current.name', $state.current.name);
                        if ($state.current.name === 'console.dashboard') {
                            //$state.reload();
                            $state.go("console.dashboard", { namespace: $rootScope.namespace })
                        } else {
                            $state.go("console.dashboard", { namespace: $rootScope.namespace });
                        }
                        //$state.go("console.dashboard", { namespace: $rootScope.namespace });
                        //}
                    }

                    // setting timer
                    $scope.checkInbox = function () {
                        $scope.isshow = false;
                    }
                }
            ]
        }
    }])

    // 面包屑设置
    .filter('stateNameFilter', [function () {
        return function (state) {
            switch (state) {
                case "console.build_detail":
                    return "代码构建"
                case "console.build_create":
                    return "代码构建"
                case "console.image_detail":
                    return "镜像仓库"
                case "console.service_create":
                    return "部署镜像"
                case "console.primage_detail":
                    return "镜像仓库"
                case "console.deploymentconfig_detail":
                    return "部署镜像"
                case "console.pods_detail":
                    return "容器状态"
                case "console.service_details":
                    return "服务地址"
                case "console.route_detail":
                    return "域名管理"
                case "console.create_routes":
                    return "域名管理"
                case "console.stateful-sets-detail":
                    return "有状态集"
                case "console.constantly_persistentVolume":
                    return "存储卷"
                case "console.create_constantly_persistentVolume":
                    return "存储卷"
                case "console.config_configMap":
                    return "配置卷"
                case "console.create_config_configMap":
                    return "配置卷"
                case "console.secret_secret":
                    return "密钥卷"
                case "console.create_secret":
                    return "密钥卷"
                case "console.pipeline_detail":
                    return "流水线"
                case "console.create_pipeline":
                    return "流水线"
                case "console.rc":
                    return "部署镜像"
                case "console.quick_deploy":
                    return "部署镜像"
                case "console.uploadimage":
                    return "镜像仓库";
            }
        };

    }])


    .filter('stateTitleFilter', [function () {
        return function (state) {
            switch (state) {
                case "console.deployments":
                    return "镜像部署"
                case "console.pipelinetag_detail":
                    return "流水线详情"
                case "console.pipeline_detail":
                    return "流水线详情"
                case "console.pipeline":
                    return "流水线"
                case "console.dashboard":
                    return "仪表盘"
                case "console.build":
                    return "代码构建";
                case "console.build_create":
                    return "新建构建";
                case "console.build_detail":
                    return "构建详情";
                case "console.image":
                    return "镜像仓库";
                case "console.image_detail":
                    return "镜像详情";
                case "console.image_Public":
                    return "镜像详情";
                case "console.image_regstry":
                    return "镜像详情";
                case "console.import_from_file":
                    return "导入yaml";
                case "console.rc":
                    return "rc详情";
                case "console.primage_detail":
                    return "镜像详情";
                case "console.service_detail":
                    return "服务详情";
                case "console.service_create":
                    return "新建服务";
                case "console.quick_deploy":
                    return "快速部署";
                case "console.create_pipeline":
                    return "新建流水线";
                case "console.backing_service":
                    return "后端服务";
                case "console.backing_service_detail":
                    return "后端服务详情";
                case "console.apply_instance":
                    return "新建后端服务实例";
                case "console.user":
                    return "用户中心";
                case "console.org":
                    return "用户中心";
                case "console.notification":
                    return "消息中心";
                case "console.resource_management":
                    return "资源管理";
                case "console.create_constantly_persistentVolume":
                    return "新建存储卷";
                case "console.create_config_configMap":
                    return "新建配置卷";
                case "console.create_secret":
                    return "新建密钥卷";
                case "console.config_configMap":
                    return "配置卷详情";
                case "console.secret_secret":
                    return "密钥卷详情";
                case "console.constantly_persistentVolume":
                    return "存储卷详情";
                case "console.create_saas":
                    return "新建服务实例";
                case "console.pay":
                    return "充值";
                case "console.plan":
                    return "套餐";
                case "console.Integration":
                    return "数据集成";
                case "console.Integration_detail":
                    return "数据详情";
                case "console.Integration_dlist":
                    return "数据预览";
                case "console.dataseverdetail":
                    return "创建服务实例";
                case "console.stateful-sets-detail":
                    return "有状态集详情";
                case "console.stateful-sets":
                    return "有状态集";
                case "console.create_routes":
                    return "域名路由设置";
                case "console.routes":
                    return "域名路由";
                case "console.route_detail":
                    return "域名路由详情";
                case "console.deploymentconfig_detail":
                    return "镜像部署详情";
                case "console.deployment_detail":
                    return "镜像部署详情";
                case "console.pods":
                    return "容器组";
                case "console.pods_detail":
                    return "容器组详情";
                case "console.services":
                    return "服务端口";
                case "console.service_details":
                    return "服务端口详情";
                case "console.resource_persistentVolume":
                    return "存储卷";
                case "console.resource_configMap":
                    return "配置卷";
                case "console.resource_secret":
                    return "密钥卷";
                case "console.uploadimage":
                    return "上传镜像";
            }
        };

    }]);