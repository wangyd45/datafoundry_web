'use strict';angular.module('console.create_routes', [{    files: [        'views/create_file/create_routes/create_routes.css'    ]}])    .controller('CreateRoutesCtrl', ['routesList','$state','$scope','Service','Route','$stateParams','createRoutes','$rootScope','ServiceList',        function(routesList,$state,$scope,Service,Route, $stateParams,createRoutes,$rootScope,ServiceList) {                console.log('-=-=-=',routesList);                $scope.routesList = routesList.items;                $scope.serviceList = ServiceList.items;                $scope.grid = {                    doubleSave:true,                    repRouteName:true,                    serviceCheck : true,                    labelCheck : true,                    nameCheck : false,                    hostnameCheck : false,                    pashCheck : true,                    toWeightCheck : true,                }                var updatePortOptions = function(service) {                    if (!service) {                        return;                    }                    var ports = _.get(service, 'spec.ports', []);                    $scope.unnamedServicePort = ports.length === 1 && !ports[0].name;                    if (ports.length && !$scope.unnamedServicePort) {                        $scope.portOptions = _.map(ports, function(portMapping) {                            return {                                targetPort: portMapping.name,                                label: portMapping.port + " \u2192 " +                                portMapping.targetPort + " (" + portMapping.protocol + ")"                            };                        });                    } else {                        $scope.portOptions = [];                    }                };                var checkActivePort = function(val){                    for(var i = 0 ; i < $scope.serviceList.length; i++){                        if(val == $scope.serviceList[i].metadata.name){                            updatePortOptions($scope.serviceList[i]);                            if($scope.portOptions.length>0){                                $scope.routeDetail.spec.port = $scope.portOptions[0];                            }else{                                delete  $scope.routeDetail.spec.port                            }                        }                    }                }            //获取service列表                if($stateParams.name){                    $scope.routeName = $stateParams.name;                    $scope.routeDetail = createRoutes;                    $scope.grid.nameCheck = true;                    $scope.grid.hostnameCheck = true;                    checkActivePort($scope.routeDetail.spec.to.name);                    if($scope.routeDetail.spec.alternateBackends){                        $scope.alternateType = true;                        if($scope.routeDetail.spec.alternateBackends.length == 1){                            $scope.initializingSlider = true;                        }                    }else{                        $scope.alternateType = false;                    }                    if($scope.routeDetail.spec.tls){                        $scope.securityType = true;                        if($scope.routeDetail.spec.tls.insecureEdgeTerminationPolicy){                            $scope.insecureListvalue = $scope.routeDetail.spec.tls.insecureEdgeTerminationPolicy;                        }else{                            $scope.insecureListvalue = 'None';                        }                        $scope.tlsListValue = $scope.routeDetail.spec.tls.termination;                        var val = $scope.routeDetail.spec.tls.termination;                        if(val == 'edge' || val == 'reencrypt'){                            $scope.CertificateObjs = {};                            if($scope.routeDetail.spec.tls.caCertificate){                                $scope.CertificateObjs.CACertificate = {                                    'typeTitle':'CA Certificate',typeObjs:{key:'caCertificate', value: $scope.routeDetail.spec.tls.caCertificate}                                }                            }                            if($scope.routeDetail.spec.tls.certificate){                                $scope.CertificateObjs.Certificate = {                                    'typeTitle':'Certificate',typeObjs:{key:'certificate', value: $scope.routeDetail.spec.tls.certificate}                                }                            }                            if($scope.routeDetail.spec.tls.key){                                $scope.CertificateObjs.PrivateKey = {                                    'typeTitle':'Private Key',typeObjs:{key:'key', value: $scope.routeDetail.spec.tls.key}                                }                            }                            if(val == 'reencrypt'){                                if($scope.routeDetail.spec.tls.destinationCACertificate){                                    $scope.CertificateObjs.Destination = {                                        'typeTitle':'Destination CA Certificate',typeObjs:{key:'destinationCACertificate', value: $scope.routeDetail.spec.tls.destinationCACertificate}                                    }                                }                            }                            console.log('$scope.CertificateObjs-=-', $scope.CertificateObjs);                        }else {                            $scope.CertificateObjs = {}                        }                    }else{                        $scope.securityType = false ;                    }                    console.log('$scope.routeDetail',$scope.routeDetail);                }else{                    $scope.securityType = false ;                    $scope.labelList = [];                    $scope.alternateType = false;                    $scope.insecureListvalue = 'None';                    $scope.initializingSlider = false;                    $scope.routeDetail = {                        apiVersion:'v1',                        kind:"Route",                        metadata:{                            labels:{},                            name:"",                        },                        spec:{                            host:"",                            path:"",                            to:{                                kind:'Service',                                name:$scope.serviceList[0].metadata.name,                                weight:50                            },                            wildcardPolicy:"None"                        },                    }                    checkActivePort($scope.serviceList[0].metadata.name);                }                $scope.tlsList = ["edge","passthrough","reencrypt"];                $scope.insecureList = ["None","Allow","Redirect"];                $scope.testserviceList = [];               function readSingleFile(e,_this,type) {                   var thisfilename = _this.value;                   if (thisfilename.indexOf('\\')) {                       var arr = thisfilename.split('\\');                       thisfilename = arr[arr.length - 1]                   }                   var file = e.target.files[0];                   console.log('file', file);                   if (!file) {                       return;                   }                   var reader = new FileReader();                   reader.onload = function (e) {                       var content = e.target.result;                       if(type == 'Certificate'){                           $scope.CertificateObjs.Certificate.typeObjs = {key: thisfilename, value: content};                       }else if(type == 'PrivateKey'){                           $scope.CertificateObjs.PrivateKey.typeObjs = {key: thisfilename, value: content};                       }else if(type == 'CACertificate'){                           $scope.CertificateObjs.CACertificate.typeObjs = {key: thisfilename, value: content};                       }else if(type == 'Destination'){                           $scope.CertificateObjs.Destination.typeObjs = {key: thisfilename, value: content};                       }                       $scope.$apply();                   };                   reader.readAsText(file);               };                $scope.addCertificate = function (type) {                   var _this = document.getElementById(type);                    _this.addEventListener('change', function(event){readSingleFile(event,_this,type)}, false);                }                $scope.changeAlternate = function(){                    if($scope.alternateType){                        $scope.alternateType = false;                        delete $scope.routeDetail.spec.alternateBackends;                    }else{                        $scope.alternateType = true;                        $scope.routeDetail.spec.to.weight = 50;                        $scope.routeDetail.spec.alternateBackends = [                            {                                kind:"Service",                                name:$scope.serviceList[0].metadata.name,                                weight:50                            }                        ]                    }                }                $scope.checkPath = function(val){                    var pathreg = /^\/.*$/;                    if(val && !pathreg.test(val)){                        $scope.grid.pashCheck = false;                    }else{                        $scope.grid.pashCheck = true;                    }                }                $scope.checkName = function(val,type){                    var nameReg =  /^[0-9a-z]+$/;                    if(type == 'name'){                        if(!val || !nameReg.test(val)){                            $scope.grid.nameCheck = false;                        }else {                            for (var i = 0; i < $scope.routesList.length; i++) {                                if (val === $scope.routesList[i].metadata.name) {                                    $scope.grid.repRouteName = false;                                    break;                                } else {                                    $scope.grid.repRouteName = true;                                    $scope.grid.nameCheck = true;                                }                            }                        }                    }else{                        if(val || !nameReg.test(val)){                            $scope.grid.hostnameCheck = false;                        }else{                            $scope.grid.hostnameCheck = true;                        }                    }                }                $scope.checkToWeight = function(val){                    if(val<1 || val>256){                        $scope.grid.toWeightCheck = false;                    }else{                        $scope.grid.toWeightCheck = true;                    }                }                $scope.checkoutSl = function(val,isToServe){                    if(isToServe){                        checkActivePort(val);                    }                    $scope.routeDetail.spec.to.name = val;                }                $scope.checkSl = function(idx,val){                    $scope.routeDetail.spec.alternateBackends[idx].name = val;                }                $scope.removeService = function(idx){                    $scope.routeDetail.spec.alternateBackends.splice(idx, 1);                    if($scope.routeDetail.spec.alternateBackends && $scope.routeDetail.spec.alternateBackends.length == 0){                        $scope.alternateType = false;                        delete $scope.routeDetail.spec.alternateBackends;                    }                }                $scope.checkPort = function(port){                    if($scope.routeDetail.spec.port){                        $scope.routeDetail.spec.port.targetPort = port.port;                        $scope.routeDetail.spec.port.label = port.label;                    }                }                var array_diff = function (a, b) {                    for(var i=0;i<b.length;i++)                    {                        for(var j=0;j<a.length;j++)                        {                            if(a[j].metadata.name==b[i].name){                                a.splice(j,1);                                j=j-1;                            }                        }                    }                    return a;                }                $scope.addService = function(){                    if($scope.routeDetail.spec.alternateBackends && $scope.routeDetail.spec.alternateBackends.length>=3){                        return;                    }                    var curService = angular.copy($scope.serviceList);                    var diffList = array_diff(curService,$scope.routeDetail.spec.alternateBackends);                    $scope.routeDetail.spec.alternateBackends.push({                        kind:"Service",                        name:diffList[0].metadata.name,                        weight:1                    })                }                var curCertificateObjs = {                    'Certificate':{                        'typeTitle':'Certificate',typeObjs:{key:'', value: ''}                    },                    'PrivateKey':{                        typeTitle:'Private Key',typeObjs:{key:'', value: ''}                    },                    'CACertificate':{                        typeTitle:'CA Certificate',typeObjs:{key:'', value: ''}                    },                    'Destination':{                        typeTitle:'Destination CA Certificate',typeObjs:{key:'', value: ''}                    }                }                $scope.changeSecurity = function(){                    if($scope.securityType){                        $scope.securityType = false;                        if($scope.routeDetail.spec.tls){                            delete $scope.routeDetail.spec.tls;                        }                    }else{                        $scope.securityType = true;                        $scope.tlsListValue = 'edge';                        if(curCertificateObjs.Destination){                            delete curCertificateObjs.Destination                        }                        $scope.CertificateObjs = curCertificateObjs;                        $scope.routeDetail.spec.tls = {};                    }                }                $scope.changetls = function(val){                    $scope.tlsListValue = val;                    if(val == 'edge'){                        $scope.insecureList = ["None","Allow","Redirect"];                        if(curCertificateObjs.Destination){                            delete curCertificateObjs.Destination                        }                        $scope.CertificateObjs = curCertificateObjs;                    }else if(val == 'passthrough'){                        $scope.CertificateObjs = {}                        $scope.insecureList = ["None","Redirect"];                    }else {                        $scope.insecureList = ["None","Allow","Redirect"];                        if(!curCertificateObjs.Destination){                            curCertificateObjs.Destination = {                                typeTitle:'Destination CA Certificate',typeObjs:{key:'', value: ''}                            }                        }                        $scope.CertificateObjs = curCertificateObjs                    }                }                $scope.changeinsecure = function(val){                    $scope.insecureListvalue = val;                    $scope.routeDetail.spec.tls.insecureEdgeTerminationPolicy = val;                }                //删除label;                $scope.rmLabel = function(idx){                    $scope.labelList.splice(idx, 1);                }                //添加label;                $scope.addLabel = function(){                    $scope.labelList.push({name:'',value:''});                }                //创建Route                $scope.createRoutes = function(){                    var labels = {};                    angular.forEach($scope.labelList, function (item, i) {                        if(item.name){                            labels[item.name] = item.value;                        }                    })                    if($scope.CertificateObjs){                        if($scope.CertificateObjs.Certificate && $scope.CertificateObjs.Certificate.typeObjs.value){                            $scope.routeDetail.spec.tls.certificate = $scope.CertificateObjs.Certificate.typeObjs.value                        }                        if($scope.CertificateObjs.PrivateKey && $scope.CertificateObjs.PrivateKey.typeObjs.value){                            $scope.routeDetail.spec.tls.key = $scope.CertificateObjs.PrivateKey.typeObjs.value                        }                        if($scope.CertificateObjs.CACertificate && $scope.CertificateObjs.CACertificate.typeObjs.value){                            $scope.routeDetail.spec.tls.caCertificate = $scope.CertificateObjs.CACertificate.typeObjs.value                        }                        if($scope.CertificateObjs.Destination && $scope.CertificateObjs.Destination.typeObjs.value){                            $scope.routeDetail.spec.tls.destinationCACertificate = $scope.CertificateObjs.Destination.typeObjs.value                        }                    }else{                        delete $scope.routeDetail.spec.tls;                    }                    if($scope.securityType){                        $scope.routeDetail.spec.tls.termination = $scope.tlsListValue;                    }                    if($scope.routeDetail.spec.port && $scope.routeDetail.spec.port.label){                        delete  $scope.routeDetail.spec.port.label;                    }                    if($scope.securityType && $scope.insecureListvalue!='None' ){                        $scope.routeDetail.spec.tls.insecureEdgeTerminationPolicy = $scope.insecureListvalue;                    }                    $scope.routeDetail.metadata.labels = labels;                    $scope.grid.doubleSave = false;                    if(!$scope.routeName){                        Route.create({                            namespace: $rootScope.namespace,                            region: $rootScope.region                        }, $scope.routeDetail, function (res) {                            $state.go('console.routes')                        }, function (res) {                            $scope.grid.doubleSave = true;                        })                    }else{                        console.log(' $scope.routeDetail', $scope.routeDetail);                        Route.put({                            name:$scope.routeName,                            namespace: $rootScope.namespace,                            region: $rootScope.region                        }, $scope.routeDetail, function (res) {                            $state.go('console.routes')                        }, function (res) {                            $scope.grid.doubleSave = true;                        })                    }                }                /////////////////////////////                $scope.$watch('routeDetail.spec.alternateBackends', function(n,o) {                    if (n === o) {                        return                    }else if(n){                        for(var i=0 ; i< n.length;i++){                            var curname = '';                            if(i+1 == n.length){                                curname = ''                            }else{                                curname = n[i+1].name;                            }                            if(n[i].weight<0 || n[i].weight>256){                                $scope.grid.serviceCheck = false;                                break;                            }else if(n[i].name == curname){                                $scope.grid.serviceCheck = false;                                break;                            }else{                                $scope.grid.serviceCheck = true;                            }                        }                    }                },true);            var labelReg =  /^[0-9a-zA-Z]+$/;                $scope.$watch('labelList', function(n,o) {                    if (n === o) {                        return                    }else if(n){                       for(var i = 0; i < n.length; i++){                           if(n[i].name){                               if(!labelReg.test(n[i].name)){                                   $scope.grid.labelCheck = false;                                   return;                               }else if(labelReg.test(n[i].name) && n[i].value && !labelReg.test(n[i].value)){                                   $scope.grid.labelCheck = false;                                   return;                               }else{                                   $scope.grid.labelCheck = true;                               }                           }else if(!n[i].name && n[i].value){                               $scope.grid.labelCheck = false;                               return;                           }else{                               $scope.grid.labelCheck = true;                           }                       }                    }                },true);                /////////////////            $scope.weightAsPercentage = function(weight, format) {                weight = weight || 0;                var total = parseInt($scope.routeDetail.spec.to.weight)                    total += parseInt($scope.routeDetail.spec.alternateBackends[0].weight);                if (!total) {                    return '';                }                var percentage = (weight / total) * 100;                return format ? (Math.round(percentage, 1) + '%') : percentage;            };            $scope.$watch('routeDetail.spec.alternateBackends.length', function(alternateServicesCount) {                if (alternateServicesCount === 0 && _.has($scope, 'routeDetail.spec.to.weight')) {                    delete $scope.routeDetail.spec.to.weight;                }                if (alternateServicesCount === 1) {                    // If all weights are 0, don't use the slider.                    if ($scope.routeDetail.spec.to.weight === 0 && $scope.routeDetail.spec.alternateBackends[0].weight === 0) {                        $scope.controls.hideSlider = true;                        return;                    }                    $scope.initializingSlider = true;                    $scope.grid.rangeSlider = $scope.weightAsPercentage($scope.routeDetail.spec.to.weight);                }            });            $scope.$watch('grid.rangeSlider', function(weight, previous) {                if ($scope.initializingSlider) {                    $scope.initializingSlider = false;                    return;                }                if (weight === previous) {                    return;                }                weight = parseInt(weight, 10);                _.set($scope, 'routeDetail.spec.to.weight', weight);                _.set($scope, 'routeDetail.spec.alternateBackends[0].weight', 100 - weight);            });        }    ]);