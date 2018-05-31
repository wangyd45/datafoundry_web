'use strict';angular.module('console.create_routes', [{    files: [        'views/create_routes/create_routes.css'    ]}])    .controller('CreateRoutesCtrl', ['routesList', '$state', '$scope', 'Service', 'Route', '$stateParams', 'createRoutes', '$rootScope', 'ServiceList', 'toastr', 'GLOBAL',        function (routesList, $state, $scope, Service, Route, $stateParams, createRoutes, $rootScope, ServiceList, toastr, GLOBAL) {            //console.log('-=-=-=service_url', GLOBAL.service_url);            $scope.GlbUrl = '.' + $rootScope.namespace + GLOBAL.service_url;            $scope.routesList = routesList.items;            $scope.serviceList = ServiceList.items;            $scope.HostNameList = ['平台子域名', '自定义域名'];            $scope.hostNameOriName = $scope.HostNameList[0];            $scope.grid = {                freehostname: 1,                doubleSave: true,                repRouteName: true,                serviceCheck: true,                labelCheck: true,                nameCheck: true,                hostnameCheck: false,                pashCheck: true,                toWeightCheck: true,                showNameValue: false            };            $scope.slider = {                value: 50,                options: {                    floor: 0,                    ceil: 100,                    step: 1,                    minLimit: 0,                    maxLimit: 100                }            };            $scope.checkOutHostName = function (val) {                if (val === '平台域名') {                    $scope.grid.freehostname = 1                }                if (val === '自定义域名') {                    $scope.grid.freehostname = 2                }            };            var updatePortOptions = function (service) {                if (!service) {                    return;                }                var ports = _.get(service, 'spec.ports', []);                $scope.unnamedServicePort = ports.length === 1 && !ports[0].name;                if (ports.length && !$scope.unnamedServicePort) {                    $scope.portOptions = _.map(ports, function (portMapping) {                        return {                            targetPort: portMapping.name,                            label: portMapping.port + " \u2192 " +                            portMapping.targetPort + " (" + portMapping.protocol + ")"                        };                    });                } else {                    $scope.portOptions = [];                }            };            var checkActivePort = function (val) {                for (var i = 0; i < $scope.serviceList.length; i++) {                    if (val == $scope.serviceList[i].metadata.name) {                        updatePortOptions($scope.serviceList[i]);                        if ($scope.portOptions.length > 0) {                            $scope.routeDetail.spec.port = $scope.portOptions[0];                        } else {                            delete  $scope.routeDetail.spec.port                        }                    }                }            };            //获取service列表            if ($stateParams.name) {                $scope.routeName = $stateParams.name;                $scope.routeDetail = createRoutes;                if ($scope.routeDetail.spec.host.indexOf($scope.GlbUrl) != -1) {                    console.log($scope.routeDetail.spec.host);                    $scope.routeDetail.spec.host = $scope.routeDetail.spec.host.split($scope.GlbUrl)[0];                    console.log($scope.routeDetail.spec.host)                } else {                    $scope.grid.freehostname = 2                }                $scope.grid.nameCheck = true;                $scope.grid.hostnameCheck = true;                checkActivePort($scope.routeDetail.spec.to.name);                if ($scope.routeDetail.spec.alternateBackends) {                    $scope.alternateType = true;                    if ($scope.routeDetail.spec.alternateBackends.length == 1) {                        $scope.slider.value = $scope.routeDetail.spec.to.weight;                        $scope.initializingSlider = true;                    }                } else {                    $scope.alternateType = false;                }                if ($scope.routeDetail.spec.tls) {                    console.log('$scope.routeDetail.spec.tls', $scope.routeDetail.spec.tls);                    $scope.securityType = true;                    if ($scope.routeDetail.spec.tls.insecureEdgeTerminationPolicy) {                        $scope.insecureListvalue = $scope.routeDetail.spec.tls.insecureEdgeTerminationPolicy;                    } else {                        $scope.insecureListvalue = 'Redirect';                    }                    $scope.tlsListValue = $scope.routeDetail.spec.tls.termination;                    var val = $scope.routeDetail.spec.tls.termination;                    if (val == 'edge' || val == 'reencrypt') {                        $scope.CertificateObjs = {};                        if ($scope.routeDetail.spec.tls.caCertificate) {                            $scope.CertificateObjs.CACertificate = {                                'typeTitle': 'CA 证书',                                typeObjs: {                                    key: 'caCertificate',                                    value: $scope.routeDetail.spec.tls.caCertificate,                                    chooseFile: false                                }                            }                        }                        if ($scope.routeDetail.spec.tls.certificate) {                            $scope.CertificateObjs.Certificate = {                                'typeTitle': '证书',                                typeObjs: {                                    key: 'certificate',                                    value: $scope.routeDetail.spec.tls.certificate,                                    chooseFile: false                                }                            }                        }                        if ($scope.routeDetail.spec.tls.key) {                            $scope.CertificateObjs.PrivateKey = {                                'typeTitle': '密钥',                                typeObjs: {key: 'key', value: $scope.routeDetail.spec.tls.key, chooseFile: false}                            }                        }                        if (val == 'reencrypt') {                            if ($scope.routeDetail.spec.tls.destinationCACertificate) {                                $scope.CertificateObjs.Destination = {                                    'typeTitle': '目标 CA 证书',                                    typeObjs: {                                        key: 'destinationCACertificate',                                        value: $scope.routeDetail.spec.tls.destinationCACertificate,                                        chooseFile: false                                    }                                }                            }                        }                        console.log('$scope.CertificateObjs-=-', $scope.CertificateObjs);                    } else {                        $scope.CertificateObjs = {}                    }                } else {                    $scope.securityType = false;                }                console.log('$scope.routeDetail', $scope.routeDetail);            } else {                if ($scope.serviceList[0]) {                    $scope.securityType = false;                    $scope.labelList = [];                    $scope.alternateType = false;                    $scope.insecureListvalue = 'Redirect';                    $scope.initializingSlider = false;                    $scope.routeDetail = {                        apiVersion: 'v1',                        kind: "Route",                        metadata: {                            labels: {},                            name: ""                        },                        spec: {                            host: "",                            path: "",                            to: {                                kind: 'Service',                                name: $scope.serviceList[0].metadata.name,                                weight: 50                            },                            wildcardPolicy: "None"                        }                    };                    checkActivePort($scope.serviceList[0].metadata.name);                }            }            $scope.tlsList = ["edge", "passthrough", "reencrypt", "none"];            $scope.insecureList = ["Redirect", "None", "Allow"];            $scope.testserviceList = [];            function readSingleFile(e, _this, type) {                console.log('000', e, '111', _this, '222', type);                var thisfilename = _this.value;                if (thisfilename.indexOf('\\')) {                    var arr = thisfilename.split('\\');                    thisfilename = arr[arr.length - 1]                }                var file = e.target.files[0];                //console.log('file', file);                if (!file) {                    return;                }                var reader = new FileReader();                reader.onload = function (e) {                    var content = e.target.result;                    if (type == 'Certificate') {                        $scope.CertificateObjs.Certificate.typeObjs = {                            key: thisfilename,                            value: content,                            chooseFile: true,                            viewFile: false                        };                    } else if (type == 'PrivateKey') {                        $scope.CertificateObjs.PrivateKey.typeObjs = {                            key: thisfilename,                            value: content,                            chooseFile: true,                            viewFile: false                        };                    } else if (type == 'CACertificate') {                        $scope.CertificateObjs.CACertificate.typeObjs = {                            key: thisfilename,                            value: content,                            chooseFile: true,                            viewFile: false                        };                    } else if (type == 'Destination') {                        $scope.CertificateObjs.Destination.typeObjs = {                            key: thisfilename,                            value: content,                            chooseFile: true,                            viewFile: false                        };                    }                    $scope.$apply();                };                reader.readAsText(file);            }            $scope.addCertificate = function (type) {                var _this = document.getElementById(type);                _this.addEventListener('change', function (event) {                    readSingleFile(event, _this, type);                }, false);            };            $scope.viewFileFun = function (type) {                if (type == 'Certificate') {                    $scope.CertificateObjs.Certificate.typeObjs.viewFile = true;                } else if (type == 'PrivateKey') {                    $scope.CertificateObjs.Certificate.typeObjs.viewFile = true;                } else if (type == 'CACertificate') {                    $scope.CertificateObjs.Certificate.typeObjs.viewFile = true;                } else if (type == 'Destination') {                    $scope.CertificateObjs.Certificate.typeObjs.viewFile = true;                }            };            $scope.changeAlternate = function () {                if ($scope.alternateType) {                    $scope.alternateType = false;                    delete $scope.routeDetail.spec.alternateBackends;                } else {                    $scope.alternateType = true;                    $scope.routeDetail.spec.to.weight = 50;                    $scope.routeDetail.spec.alternateBackends = [                        {                            kind: "Service",                            name: $scope.serviceList[0].metadata.name,                            weight: 50                        }                    ]                }            };            $scope.checkPath = function (val) {                var pathreg = /^\/.*$/;                if (val && !pathreg.test(val)) {                    $scope.grid.pashCheck = false;                } else {                    $scope.grid.pashCheck = true;                }            };            $scope.checkName = function (val, type) {                $scope.grid.nameCheck = true;                var nameReg = /^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;                if (type == 'name') {                    if (!val || !nameReg.test(val)) {                        //console.log('1');                        $scope.grid.nameCheck = false;                    } else {                        if (!$scope.routesList.length) {                            $scope.grid.repRouteName = true;                            $scope.grid.nameCheck = true;                        } else {                            for (var i = 0; i < $scope.routesList.length; i++) {                                if (val === $scope.routesList[i].metadata.name) {                                    $scope.grid.repRouteName = false;                                    break;                                } else {                                    $scope.grid.repRouteName = true;                                    $scope.grid.nameCheck = true;                                }                            }                        }                    }                } else {                    if (val || !nameReg.test(val)) {                        $scope.grid.hostnameCheck = false;                    } else {                        $scope.grid.hostnameCheck = true;                    }                }            };            $scope.checkToWeight = function (val) {                if (val < 1 || val > 256) {                    $scope.grid.toWeightCheck = false;                } else {                    $scope.grid.toWeightCheck = true;                }            };            $scope.checkoutSl = function (val, isToServe) {                if (isToServe) {                    checkActivePort(val);                }                $scope.routeDetail.spec.to.name = val;            };            $scope.checkSl = function (idx, val) {                $scope.routeDetail.spec.alternateBackends[idx].name = val;            };            $scope.removeService = function (idx) {                $scope.routeDetail.spec.alternateBackends.splice(idx, 1);                if ($scope.routeDetail.spec.alternateBackends && $scope.routeDetail.spec.alternateBackends.length == 0) {                    $scope.alternateType = false;                    delete $scope.routeDetail.spec.alternateBackends;                }            };            $scope.checkPort = function (port) {                if ($scope.routeDetail.spec.port) {                    $scope.routeDetail.spec.port.targetPort = port.port;                    $scope.routeDetail.spec.port.label = port.label;                }            };            var array_diff = function (a, b) {                for (var i = 0; i < b.length; i++) {                    for (var j = 0; j < a.length; j++) {                        if (a[j].metadata.name == b[i].name) {                            a.splice(j, 1);                            j = j - 1;                        }                    }                }                return a;            };            $scope.addService = function () {                if ($scope.routeDetail.spec.alternateBackends && $scope.routeDetail.spec.alternateBackends.length >= 3) {                    return;                }                var curService = angular.copy($scope.serviceList);                var diffList = array_diff(curService, $scope.routeDetail.spec.alternateBackends);                $scope.routeDetail.spec.alternateBackends.push({                    kind: "Service",                    name: diffList[0].metadata.name,                    weight: 1                })            };            var curCertificateObjs = {                'Certificate': {                    'typeTitle': '证书', typeObjs: {key: '', value: '', chooseFile: false, viewFile: false}                },                'PrivateKey': {                    typeTitle: '密钥', typeObjs: {key: '', value: '', chooseFile: false, viewFile: false}                },                'CACertificate': {                    typeTitle: 'CA 证书', typeObjs: {key: '', value: '', chooseFile: false, viewFile: false}                },                'Destination': {                    typeTitle: '目标 CA 证书', typeObjs: {key: '', value: '', chooseFile: false, viewFile: false}                }            };            $scope.changeSecurity = function () {                if ($scope.securityType) {                    $scope.securityType = false;                    if ($scope.routeDetail.spec.tls) {                        delete $scope.routeDetail.spec.tls;                    }                } else {                    $scope.securityType = true;                    $scope.tlsListValue = 'edge';                    $scope.insecureListvalue = 'Redirect';                    if (curCertificateObjs.Destination) {                        delete curCertificateObjs.Destination                    }                    $scope.CertificateObjs = curCertificateObjs;                    $scope.routeDetail.spec.tls = {};                }            };            $scope.changetls = function (val) {                $scope.tlsListValue = val;                if (val == 'edge') {                    $scope.insecureListvalue = 'Redirect';                    $scope.insecureList = ["Redirect", "None", "Allow"];                    if (curCertificateObjs.Destination) {                        delete curCertificateObjs.Destination                    }                    $scope.CertificateObjs = curCertificateObjs;                } else if (val == 'passthrough' || val == 'none') {                    $scope.insecureListvalue = 'None';                    $scope.CertificateObjs = {}                    $scope.insecureList = ["None", "Redirect"];                } else {                    $scope.insecureListvalue = 'None';                    $scope.insecureList = ["None", "Redirect", "Allow"];                    if (!curCertificateObjs.Destination) {                        curCertificateObjs.Destination = {                            typeTitle: 'Destination CA Certificate', typeObjs: {key: '', value: ''}                        }                    }                    $scope.CertificateObjs = curCertificateObjs                }            };            $scope.changeinsecure = function (val) {                $scope.insecureListvalue = val;                $scope.routeDetail.spec.tls.insecureEdgeTerminationPolicy = val;            };            //删除label;            $scope.rmLabel = function (idx) {                $scope.labelList.splice(idx, 1);            };            //添加label;            $scope.addLabel = function () {                $scope.labelList.push({name: '', value: ''});                $scope.grid.showNameValue = true;            };            //创建Route            $scope.createRoutes = function () {                var labels = {};                angular.forEach($scope.labelList, function (item, i) {                    if (item.name) {                        labels[item.name] = item.value;                    }                });                if ($scope.CertificateObjs) {                    if ($scope.CertificateObjs.Certificate && $scope.CertificateObjs.Certificate.typeObjs.value) {                        $scope.routeDetail.spec.tls.certificate = $scope.CertificateObjs.Certificate.typeObjs.value                    }                    if ($scope.CertificateObjs.PrivateKey && $scope.CertificateObjs.PrivateKey.typeObjs.value) {                        $scope.routeDetail.spec.tls.key = $scope.CertificateObjs.PrivateKey.typeObjs.value                    }                    if ($scope.CertificateObjs.CACertificate && $scope.CertificateObjs.CACertificate.typeObjs.value) {                        $scope.routeDetail.spec.tls.caCertificate = $scope.CertificateObjs.CACertificate.typeObjs.value                    }                    if ($scope.CertificateObjs.Destination && $scope.CertificateObjs.Destination.typeObjs.value) {                        $scope.routeDetail.spec.tls.destinationCACertificate = $scope.CertificateObjs.Destination.typeObjs.value                    }                } else {                    delete $scope.routeDetail.spec.tls;                }                if ($scope.securityType) {                    $scope.routeDetail.spec.tls.termination = $scope.tlsListValue;                }                if ($scope.routeDetail.spec.port && $scope.routeDetail.spec.port.label) {                    delete  $scope.routeDetail.spec.port.label;                }                if ($scope.securityType && $scope.insecureListvalue != 'None') {                    $scope.routeDetail.spec.tls.insecureEdgeTerminationPolicy = $scope.insecureListvalue;                }                $scope.routeDetail.metadata.labels = labels;                $scope.grid.doubleSave = false;                if ($scope.routeDetail.spec.alternateBackends) {                    if ($scope.routeDetail.spec.alternateBackends.length == 1) {                        $scope.routeDetail.spec.to.weight = $scope.slider.value                        $scope.routeDetail.spec.alternateBackends[0].weight = 100 - $scope.slider.value                    }                }                if (!$scope.routeName) {                    if ($scope.grid.freehostname == 1) {                        $scope.routeDetail.spec.host = $scope.routeDetail.spec.host + $scope.GlbUrl;                    }                    Route.create({                        namespace: $rootScope.namespace,                        region: $rootScope.region                    }, $scope.routeDetail, function (res) {                        toastr.success('创建成功', {                            timeOut: 2000,                            closeButton: true                        });                        $state.go('console.routes', {namespace: $rootScope.namespace})                    }, function (res) {                        toastr.error('创建失败，请检查后重试', {                            timeOut: 2000,                            closeButton: true                        });                        $scope.grid.doubleSave = true;                    })                } else {                    if ($scope.grid.freehostname == 1) {                        $scope.routeDetail.spec.host = $scope.routeDetail.spec.host + $scope.GlbUrl;                    }                    //console.log(' $scope.routeDetail', $scope.routeDetail);                    //$scope.routeDetail.spec.host = $scope.routeDetail.spec.host+$scope.GlbUrl;                    Route.put({                        name: $scope.routeName,                        namespace: $rootScope.namespace,                        region: $rootScope.region                    }, $scope.routeDetail, function (res) {                        toastr.success('修改成功', {                            timeOut: 2000,                            closeButton: true                        });                        $state.go('console.routes', {namespace: $rootScope.namespace})                    }, function (res) {                        toastr.error('修改失败，请检查后重试', {                            timeOut: 2000,                            closeButton: true                        });                        $scope.grid.doubleSave = true;                    })                }            };            /////////////////////////////            $scope.$watch('routeDetail.spec.alternateBackends', function (n, o) {                if (n === o) {                    return                } else if (n) {                    for (var i = 0; i < n.length; i++) {                        var curname = '';                        if (i + 1 == n.length) {                            curname = ''                        } else {                            curname = n[i + 1].name;                        }                        if (n[i].weight < 0 || n[i].weight > 256) {                            $scope.grid.serviceCheck = false;                            break;                        } else if (n[i].name == curname) {                            $scope.grid.serviceCheck = false;                            break;                        } else {                            $scope.grid.serviceCheck = true;                        }                    }                }            }, true);            var labelReg = /^[0-9a-zA-Z]+$/;            $scope.$watch('labelList', function (n, o) {                if (n === o) {                    return                } else if (n) {                    for (var i = 0; i < n.length; i++) {                        if (n[i].name) {                            if (!labelReg.test(n[i].name)) {                                $scope.grid.labelCheck = false;                                return;                            } else if (labelReg.test(n[i].name) && n[i].value && !labelReg.test(n[i].value)) {                                $scope.grid.labelCheck = false;                                return;                            } else {                                $scope.grid.labelCheck = true;                            }                        } else if (!n[i].name && n[i].value) {                            $scope.grid.labelCheck = false;                            return;                        } else {                            $scope.grid.labelCheck = true;                        }                    }                }            }, true);            /////////////////            $scope.weightAsPercentage = function (weight, format) {                weight = weight || 0;                var total = parseInt($scope.routeDetail.spec.to.weight)                total += parseInt($scope.routeDetail.spec.alternateBackends[0].weight);                if (!total) {                    return '';                }                var percentage = (weight / total) * 100;                return format ? (Math.round(percentage, 1) + '%') : percentage;            };            $scope.$watch('routeDetail.spec.alternateBackends.length', function (alternateServicesCount) {                if (alternateServicesCount === 0 && _.has($scope, 'routeDetail.spec.to.weight')) {                    delete $scope.routeDetail.spec.to.weight;                }                if (alternateServicesCount === 1) {                    // If all weights are 0, don't use the slider.                    if ($scope.routeDetail.spec.to.weight === 0 && $scope.routeDetail.spec.alternateBackends[0].weight === 0) {                        $scope.controls.hideSlider = true;                        return;                    }                    $scope.initializingSlider = true;                    $scope.grid.rangeSlider = $scope.weightAsPercentage($scope.routeDetail.spec.to.weight);                }            });            $scope.$watch('grid.rangeSlider', function (weight, previous) {                if ($scope.initializingSlider) {                    $scope.initializingSlider = false;                    return;                }                if (weight === previous) {                    return;                }                weight = parseInt(weight, 10);                _.set($scope, 'routeDetail.spec.to.weight', weight);                _.set($scope, 'routeDetail.spec.alternateBackends[0].weight', 100 - weight);            });        }    ]);