'use strict';angular.module('console.create_routes', [{    files: [        'views/create_file/create_routes/create_routes.css'    ]}])    .controller('CreateRoutesCtrl', ['$scope','Service','Route','$stateParams','createRoutes','$rootScope',        function($scope,Service,Route, $stateParams,createRoutes,$rootScope) {            //获取service列表                if($stateParams.name){                    $scope.routeName = $stateParams.name;                    $scope.routeDetail = createRoutes;                    if($scope.routeDetail.spec.alternateBackends){                        $scope.alternateType = true;                    }else{                        $scope.alternateType = false;                    }                    if($scope.routeDetail.spec.tls){                        $scope.securityType = true;                        if($scope.routeDetail.spec.tls.insecureEdgeTerminationPolicy){                            $scope.insecureListvalue = $scope.routeDetail.spec.tls.insecureEdgeTerminationPolicy;                        }else{                            $scope.insecureListvalue = 'None';                        }                        $scope.tlsListValue = $scope.routeDetail.spec.tls.termination;                        var val = $scope.routeDetail.spec.tls.termination;                        if(val == 'edge' || val == 'reencrypt'){                            $scope.CertificateObjs = {};                            if($scope.routeDetail.spec.tls.caCertificate){                                $scope.CertificateObjs.CACertificate = {                                    'typeTitle':'CA Certificate',typeObjs:{key:'caCertificate', value: $scope.routeDetail.spec.tls.caCertificate}                                }                            }                            if($scope.routeDetail.spec.tls.certificate){                                $scope.CertificateObjs.Certificate = {                                    'typeTitle':'Certificate',typeObjs:{key:'certificate', value: $scope.routeDetail.spec.tls.certificate}                                }                            }                            if($scope.routeDetail.spec.tls.key){                                $scope.CertificateObjs.PrivateKey = {                                    'typeTitle':'Private Key',typeObjs:{key:'key', value: $scope.routeDetail.spec.tls.key}                                }                            }                            if(val == 'reencrypt'){                                if($scope.routeDetail.spec.tls.destinationCACertificate){                                    $scope.CertificateObjs.Destination = {                                        'typeTitle':'Destination CA Certificate',typeObjs:{key:'destinationCACertificate', value: $scope.routeDetail.spec.tls.destinationCACertificate}                                    }                                }                            }                            console.log('$scope.CertificateObjs-=-', $scope.CertificateObjs);                        }else {                            $scope.CertificateObjs = {}                        }                    }else{                        $scope.securityType = false ;                    }                    console.log('$scope.routeDetail',$scope.routeDetail);                }else{                    $scope.securityType = false ;                    $scope.labelList = [];                    $scope.alternateType = false;                    $scope.insecureListvalue = 'None';                    $scope.routeDetail = {                        apiVersion:'v1',                        kind:"Route",                        metadata:{                            labels:{},                            name:"",                        },                        spec:{                            host:"",                            path:"",                            to:{                                kind:'Service',                                name:"",                                weight:"1"                            },                            wildcardPolicy:"None"                        },                    }                }               Service.get({ namespace: $scope.namespace }, function(res) {                   $scope.serviceList = res.items;                   if(!$scope.routeDetail.spec.to.name){                       $scope.routeDetail.spec.to.name = $scope.serviceList[0].metadata.name;                   }               });                $scope.tlsList = ["edge","passthrough","reencrypt"];                $scope.insecureList = ["None","Allow","Redirect"];                $scope.testserviceList = [];               function readSingleFile(e,_this,type) {                   var thisfilename = _this.value;                   if (thisfilename.indexOf('\\')) {                       var arr = thisfilename.split('\\');                       thisfilename = arr[arr.length - 1]                   }                   var file = e.target.files[0];                   console.log('file', file);                   if (!file) {                       return;                   }                   var reader = new FileReader();                   reader.onload = function (e) {                       var content = e.target.result;                       if(type == 'Certificate'){                           $scope.CertificateObjs.Certificate.typeObjs = {key: thisfilename, value: content};                       }else if(type == 'PrivateKey'){                           $scope.CertificateObjs.PrivateKey.typeObjs = {key: thisfilename, value: content};                       }else if(type == 'CACertificate'){                           $scope.CertificateObjs.CACertificate.typeObjs = {key: thisfilename, value: content};                       }else if(type == 'Destination'){                           $scope.CertificateObjs.Destination.typeObjs = {key: thisfilename, value: content};                       }                       $scope.$apply();                   };                   reader.readAsText(file);               };                $scope.addCertificate = function (type) {                   var _this = document.getElementById(type);                    _this.addEventListener('change', function(event){readSingleFile(event,_this,type)}, false);                }                $scope.changeAlternate = function(){                    if($scope.alternateType){                        $scope.alternateType = false;                        delete $scope.routeDetail.spec.alternateBackends;                    }else{                        $scope.alternateType = true;                        $scope.routeDetail.spec.alternateBackends = [                            {                                kind:"Service",                                name:"",                                weight:""                            }                        ]                    }                }                $scope.checkoutSl = function(val){                    $scope.routeDetail.spec.to.name = val;                }                $scope.checkSl = function(idx,val){                    $scope.routeDetail.spec.alternateBackends[idx].name = val;                }                $scope.removeService = function(idx){                    $scope.routeDetail.spec.alternateBackends.splice(idx, 1);                    if($scope.routeDetail.spec.alternateBackends && $scope.routeDetail.spec.alternateBackends.length == 0){                        $scope.alternateType = false;                        delete $scope.routeDetail.spec.alternateBackends;                    }                }                $scope.addService = function(){                    $scope.routeDetail.spec.alternateBackends.push({                        kind:"Service",                        name:"",                        weight:""                    })                }                var curCertificateObjs = {                    'Certificate':{                        'typeTitle':'Certificate',typeObjs:{key:'', value: ''}                    },                    'PrivateKey':{                        typeTitle:'Private Key',typeObjs:{key:'', value: ''}                    },                    'CACertificate':{                        typeTitle:'CA Certificate',typeObjs:{key:'', value: ''}                    },                    'Destination':{                        typeTitle:'Destination CA Certificate',typeObjs:{key:'', value: ''}                    }                }                $scope.changeSecurity = function(){                    if($scope.securityType){                        $scope.securityType = false;                        if($scope.routeDetail.spec.tls){                            delete $scope.routeDetail.spec.tls;                        }                    }else{                        $scope.securityType = true;                        $scope.tlsListValue = 'edge';                        if(curCertificateObjs.Destination){                            delete curCertificateObjs.Destination                        }                        $scope.CertificateObjs = curCertificateObjs;                        $scope.routeDetail.spec.tls = {};                    }                }                $scope.changetls = function(val){                    $scope.tlsListValue = val;                    if(val == 'edge'){                        if(curCertificateObjs.Destination){                            delete curCertificateObjs.Destination                        }                        $scope.CertificateObjs = curCertificateObjs;                    }else if(val == 'passthrough'){                        $scope.CertificateObjs = {}                    }else {                        if(!curCertificateObjs.Destination){                            curCertificateObjs.Destination = {                                typeTitle:'Destination CA Certificate',typeObjs:{key:'', value: ''}                            }                        }                        $scope.CertificateObjs = curCertificateObjs                    }                }                $scope.changeinsecure = function(val){                    $scope.insecureListvalue = val;                    $scope.routeDetail.spec.tls.insecureEdgeTerminationPolicy = val;                }                //删除label;                $scope.rmLabel = function(idx){                    $scope.labelList.splice(idx, 1);                }                //添加label;                $scope.addLabel = function(){                    $scope.labelList.push({name:'',value:''});                }                //创建Route                $scope.createRoutes = function(){                    var labels = {};                    angular.forEach($scope.labelList, function (item, i) {                        if(item.name && item.value){                            labels[item.name] = item.value;                        }                    })                    console.log('$scope.CertificateObjs-=-',$scope.CertificateObjs)                    if($scope.CertificateObjs){                        if($scope.CertificateObjs.Certificate && $scope.CertificateObjs.Certificate.typeObjs.value){                            $scope.routeDetail.spec.tls.certificate = $scope.CertificateObjs.Certificate.typeObjs.value                        }                        if($scope.CertificateObjs.PrivateKey && $scope.CertificateObjs.PrivateKey.typeObjs.value){                            $scope.routeDetail.spec.tls.key = $scope.CertificateObjs.PrivateKey.typeObjs.value                        }                        if($scope.CertificateObjs.CACertificate && $scope.CertificateObjs.CACertificate.typeObjs.value){                            $scope.routeDetail.spec.tls.caCertificate = $scope.CertificateObjs.CACertificate.typeObjs.value                        }                        if($scope.CertificateObjs.Destination && $scope.CertificateObjs.Destination.typeObjs.value){                            $scope.routeDetail.spec.tls.destinationCACertificate = $scope.CertificateObjs.Destination.typeObjs.value                        }                    }else{                        delete $scope.routeDetail.spec.tls;                    }                    if($scope.securityType){                        $scope.routeDetail.spec.tls.termination = $scope.tlsListValue;                    }                    if($scope.securityType && $scope.insecureListvalue!='None' ){                        $scope.routeDetail.spec.tls.insecureEdgeTerminationPolicy = $scope.insecureListvalue;                    }                    $scope.routeDetail.metadata.labels = labels;                    console.log('$scope.routeDetail=-=-',$scope.routeDetail);                    if(!$scope.routeName){                        Route.create({                            namespace: $rootScope.namespace,                            region: $rootScope.region                        }, $scope.routeDetail, function (res) {                            console.log("build instantiate success",res);                        }, function (res) {                        })                    }else{                        Route.put({                            name:$scope.routeName,                            namespace: $rootScope.namespace,                            region: $rootScope.region                        }, $scope.routeDetail, function (res) {                            console.log("build instantiate success",res);                        }, function (res) {                        })                    }                }        }    ]);