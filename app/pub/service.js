'use strict';

define(['angular'], function (angular) {
  return angular.module('myApp.service', ['angular-clipboard', 'base64'])
      .service('Confirm', ['$uibModal', function ($uibModal) {
        this.open = function (title, txt, tip, tp, iscf) {
          return $uibModal.open({
            templateUrl: 'pub/tpl/confirm.html',
            size: 'default',
            controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
              $scope.title = title;
              $scope.txt = txt;
              $scope.tip = tip;
              $scope.tp = tp;
              $scope.iscf = iscf;
              $scope.ok = function () {
                $uibModalInstance.close(true);
              };
              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              };
            }]
          }).result;
        };
      }])
      .service('Addmodal', ['$uibModal', function ($uibModal) {
        this.open = function (title, txt, tip,orgId,isaddpeople) {
          return $uibModal.open({
            templateUrl: 'pub/tpl/addmodal.html',
            size: 'default',
            controller: ['$scope', '$uibModalInstance','loadOrg','$http', function ($scope, $uibModalInstance,loadOrg,$http) {
              $scope.title = title;
              $scope.txt = txt;
              $scope.tip = tip;
              $scope.orgName = null;
              $scope.ok = function () {
                if(isaddpeople == 'people'){
                  $http.put('/lapi/orgs/'+orgId+'/invite', {
                    member_name: $scope.orgName,
                    privileged: false
                  }).success(function(item){
                    $uibModalInstance.close(item);
                  }).error(function(res){
                    $scope.tip = res;
                  })
                }else if(isaddpeople == 'org'){
                  $http.post('/lapi/orgs', {
                   name : $scope.orgName
                  }).success(function(item){
                    $uibModalInstance.close(item);
                  }).error(function(res){
                    $scope.tip = res;
                  })
                }else{
                  $uibModalInstance.close( $scope.orgName);
                }

              };
              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              };
            }]
          }).result;
        };
      }])
      .service('Alert', ['$uibModal', function ($uibModal) {
        this.open = function (title, txt, err, regist, active) {
          return $uibModal.open({
            templateUrl: 'pub/tpl/alert.html',
            size: 'default',
            controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
              $scope.title = title;
              $scope.txt = txt;
              $scope.err = err;
              $scope.classify = regist;
              $scope.activation = active;
              $scope.ok = function () {
                $uibModalInstance.close();
              };
              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              };
            }]
          }).result;
        };
      }])
      .service('Toast', ['$uibModal', function ($uibModal) {
        this.open = function (txt, timeout) {
          return $uibModal.open({
            template: '<p>{{txt}}</p>',
            size: 'toast',
            controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
              $scope.txt = txt;
              timeout = timeout || 1500;
              setTimeout(function () {
                $uibModalInstance.dismiss();
              }, timeout);
            }]
          }).result;
        }
      }])
      .service('ModalPullImage', ['$rootScope', '$uibModal', 'clipboard', function ($rootScope, $uibModal, clipboard) {
        this.open = function (name, yuorself) {
          return $uibModal.open({
            templateUrl: 'pub/tpl/modal_pull_image.html',
            size: 'default',
            controller: ['$scope', '$uibModalInstance', '$log', function ($scope, $uibModalInstance, $log) {
              console.log(name)
              if (!yuorself) {
                $scope.name = name.split('/')[1] ? name.split(':')[0] + ':' + name.split(':')[1].split('/')[1] : name;

              } else {
                $scope.name = name;
              }
              $scope.cmd = 'docker pull registry.dataos.io/' + $scope.name;
              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              };
              $scope.success = function () {
                $log.info('Copied!');
                $uibModalInstance.close(true);
              };
              $scope.fail = function (err) {
                $scope.tip = '该浏览器不支持复制,请手动选中输入框中内容,通过Ctrl+c复制';
                $log.error('Error!', err);
              };
            }]
          }).result;
        };
      }])
      .service('ImageSelect', ['$uibModal', function ($uibModal) {
        this.open = function () {
          return $uibModal.open({
            templateUrl: 'pub/tpl/modal_choose_image.html',
            size: 'default modal-lg',
            controller: ['$rootScope', '$scope', '$uibModalInstance', 'images', 'ImageStreamTag','ImageStream','$http','platformlist' ,function ($rootScope, $scope, $uibModalInstance, images, ImageStreamTag,ImageStream,$http,platformlist) {
              console.log('images', images);
              $scope.grid = {
                cat: 0,
                image: null,
                version_x: null,
                version_y: null
              };
              $scope.test = {
                'items':[]
              };
              $scope.$watch('imageName', function (newVal, oldVal) {
                if (newVal != oldVal) {
                  newVal = newVal.replace(/\\/g);
                  if ($scope.grid.cat == 0) {
                    angular.forEach($scope.images.items, function (image) {
                      image.hide = !(new RegExp(newVal)).test(image.metadata.name);
                    });
                  }else{
                    angular.forEach($scope.images.items, function (image) {
                      image.hide = !(new RegExp(newVal)).test(image.name);
                    });
                  }
                }
              });
              $scope.$watch('imageVersion', function (newVal, oldVal) {
                if (newVal != oldVal) {
                  newVal = newVal.replace(/\\/g);
                  if($scope.grid.cat == 0) {
                    angular.forEach($scope.imageTags, function (item, i) {
                      item.hide = !(new RegExp(newVal)).test(item.tag);
                    });
                  }else{
                    angular.forEach($scope.imageTags,function(item, i){
                      item.hide = !(new RegExp(newVal)).test(item.tag);
                    });
                  }

                }
              });

              $scope.images = images;
              $scope.selectCat = function (idx) {
                $scope.imageTags = {};
                $scope.images = {};
                $scope.grid.image = null;
                console.log("1223",idx);
                $scope.grid.cat = idx;
                if(idx == 0 ){
                  ImageStream.get({namespace: $rootScope.namespace},function(res){
                    $scope.images = res;
                  })
                }else if(idx == 1){
                  $http.get('/registry/api/projects', {
                    params: {is_public: 1}
                  }).success(function (data) {
                    for(var i = 0 ; i < data.length; i++){
                      $http.get('/registry/api/repositories', {params: {project_id:data[i].project_id}})
                          .success(function (res) {
                            if(res){
                              for(var j = 0 ; j < res.length; j++ ){
                                var str = {
                                  'name' : res[j]
                                }
                                $scope.test.items.push(str);
                              }
                              $scope.images = $scope.test ;
                            }
                          })
                    }

                  })
                }
              };
              $scope.selectImage = function (idx) {
                $scope.grid.version_x = null;
                $scope.grid.version_y = null;
                if($scope.grid.cat == 0){
                  $scope.grid.image = idx;
                  var image = $scope.images.items[idx];
                  angular.forEach(image.status.tags, function (item) {
                    if(image.metadata.name){
                      ImageStreamTag.get({
                        namespace: $rootScope.namespace,
                        name: image.metadata.name + ':' + item.tag
                      }, function (res) {
                        item.ist = res;
                      }, function (res) {
                        console.log("get image stream tag err", res);
                      });
                    }
                  });
                  console.log("get image stream tag err", image.status.tags);
                  $scope.imageTags = image.status.tags;
                  console.log('test tag.items', $scope.imageTags)
                }else if($scope.grid.cat == 1){
                  $scope.grid.image = idx;
                  platformlist.query({id:$scope.test.items[idx].name},function (data){
                    $scope.test.items[idx].status = {};
                    $scope.test.items[idx].status.tags = [];
                    for(var i = 0 ; i < data.length; i++){
                      var test2 = {
                        'tag' : data[i],
                        'items' : data,
                        'ist' : {
                          'imagesname' :$scope.test.items[idx].name+'/'+data[i],
                          'ispublicimage' : true
                        }
                      };
                      $scope.test.items[idx].status.tags.push(test2)
                    }
                    $scope.imageTags = $scope.test.items[idx].status.tags;
                  })
                }
              };

              $scope.selectVersion = function (x, y) {
                $scope.grid.version_x = x;
                $scope.grid.version_y = y;
              };

              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              };
              $scope.ok = function () {
                console.log("===", $scope.imageTags);
                $uibModalInstance.close($scope.imageTags[$scope.grid.version_x].ist);
              };
            }],
            resolve: {
              images: ['$rootScope', 'ImageStream', function ($rootScope, ImageStream) {
                return ImageStream.get({namespace: $rootScope.namespace}).$promise;
              }]
            }
          }).result;
        }
      }])
      .service('ModalLogin', ['$rootScope','$uibModal', function ($rootScope,$uibModal) {
        this.open = function () {
          return $uibModal.open({
            templateUrl: 'views/login/login.html',
            size: 'default',
            controller: ['$scope', 'AuthService', '$uibModalInstance', 'ModalRegist', 
              function ($scope, AuthService, $uibModalInstance, ModalRegist) {
              // $rootScope.credentials = {};
              // $scope.login = function () {
              //   AuthService.login($rootScope.credentials);
              //   $uibModalInstance.close();
              // };
              // $scope.regist = function () {
              //   $uibModalInstance.close();
              //   ModalRegist.open();
              // };
              // $scope.cancel = function () {
              //   $uibModalInstance.dismiss();
              // };
            }]
          }).result;
        }
      }])
      //registration
      .service('ModalRegist', ['$uibModal', function ($uibModal) {
        this.open = function () {
          return $uibModal.open({
            templateUrl: 'views/login/regist.html',
            size: 'default',
            controller: ['$scope', 'AuthService', '$uibModalInstance', 'registration', 
              function ($scope, AuthService, $uibModalInstance, registration) {
              $scope.credentials = {};
              $scope.regist = function () {
                //注册相关代码...
                registration.regist({username: $scope.credentials.username, password: $scope.credentials.password, email: $scope.credentials.email}, function(data){
                })
                $uibModalInstance.close();
              };
              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              };
            }]
          }).result;
        }
      }])

      .service('ModalPwd', ['$uibModal', function ($uibModal) {
        this.open = function () {
          return $uibModal.open({
            templateUrl: 'views/user/pwd.html',
            size: 'default',
            controller: ['$scope','$rootScope','$uibModalInstance', function ($scope,$rootScope,$uibModalInstance) {
              $scope.credentials={}
              console.log($rootScope)
              $scope.ok = function () {
                var possword = {
                  oldpwd:$scope.credentials.oldpwd,
                  pwd:$scope.credentials.pwd
                }
                $uibModalInstance.close(possword);
              };
              
              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              };
            }]
          }).result;
        };
      }])
      .service('Sort', [function () {
        this.sort = function (items, reverse) {
          if (!reverse || reverse == 0) {
            reverse = 1;
          }
          items.sort(function (a, b) {
            if (!a.metadata) {
              return 0;
            }
            return reverse * ((new Date(a.metadata.creationTimestamp)).getTime() - (new Date(b.metadata.creationTimestamp)).getTime());
          });
          return items;
        };
      }])
      .service('UUID', [function () {
        var S4 = function () {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        this.guid = function () {
          return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        };
      }])
      .service('Cookie', [function () {
        this.set = function (key, val, expires) {
          var date = new Date();
          date.setTime(date.getTime() + expires);
          document.cookie = key + "=" + val + "; expires=" + date.toUTCString();
        };
        this.get = function (key) {
          var reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
          var arr = document.cookie.match(reg);
          if (arr) {
            return (arr[2]);
          }
          return null
        };
        this.clear = function (key) {
          this.set(key, "", -1);
        };
      }])
      .service('ServiceSelect', ['$uibModal', function ($uibModal) {
        this.open = function (c) {
          return $uibModal.open({
            templateUrl: 'views/backing_service/service_select.html',
            size: 'default modal-foo',
            controller: ['$log', '$rootScope', '$scope', '$uibModalInstance', 'data', function ($log, $rootScope, $scope, $uibModalInstance, data) {
              var curdata = angular.copy(data);
              for (var j = 0; j < data.items.length; j++) {
                for (var i = 0; i < c.length; i++) {
                  if (data.items[j].metadata.name == c[i].bind_deploymentconfig) {
                    curdata.items.splice(j, 1);
                  }
                }
              }
              $log.info('curdatacurdata', curdata);
              $scope.data = curdata;
              $scope.items = curdata.items;
              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              };
              $scope.ok = function () {
                var items = [];
                for (var i = 0; i < $scope.data.items.length; i++) {
                  if ($scope.data.items[i].checked) {
                    items.push($scope.data.items[i]);
                  }
                }
                $uibModalInstance.close(items);
              };

              $scope.$watch('txt', function (newVal, oldVal) {
                if (newVal != oldVal) {
                  $scope.search(newVal);
                }
              });
            
              $scope.search = function (txt) {
                if (!txt) {
                  $scope.items = $scope.data.items;
                } else {
                  $scope.items = [];
                  txt = txt.replace(/\//g, '\\/');
                  var reg = eval('/' + txt + '/');
                  angular.forEach($scope.data.items, function (item) {
                    if (reg.test(item.metadata.name)) {
                      $scope.items.push(item);
                    }
                  })
                }
              };
            }],
            resolve: {
              data: ['$rootScope', 'DeploymentConfig', function ($rootScope, DeploymentConfig) {
                return DeploymentConfig.get({namespace: $rootScope.namespace}).$promise;
              }]
            }
          }).result;
        }
      }])
      .service('MetricsService', [function () {
        var midTime = function (point) {
          return point.start + (point.end - point.start) / 2;
        };

        var millicoresUsed = function (point, lastValue) {
          if (!lastValue || !point.value) {
            return null;
          }

          if (lastValue > point.value) {
            return null;
          }

          var timeInMillis = point.end - point.start;
          var usageInMillis = (point.value - lastValue) / 1000000;
          return (usageInMillis / timeInMillis) * 1000;
        };

        this.normalize = function (data, metric) {
          var lastValue;
          angular.forEach(data, function (point) {
            var value;

            if (!point.timestamp) {
              point.timestamp = midTime(point);
            }

            if (!point.value || point.value === "NaN") {
              var avg = point.avg;
              point.value = (avg && avg !== "NaN") ? avg : null;
            }

            if (metric === 'CPU') {
              value = point.value;
              point.value = millicoresUsed(point, lastValue);
              lastValue = value;
            }
          });

          data.shift();
          return data;
        };
      }])
      .service('ImageService', [function () {
        this.tag = function (container) {
          var foo = container.image.replace(/(.*\/)/, '');
          foo = foo.split(':');
          if (foo.length > 1) {
            return foo[1];
          }
          return '';
        };

      }])
      .service('AuthService', ['orgList','$rootScope', '$http', '$base64', 'Cookie', '$state', '$log', 'Project', 'GLOBAL', 'Alert', 'User',
        function (orgList,$rootScope, $http, $base64, Cookie, $state, $log, Project, GLOBAL, Alert, User) {
        this.login = function (credentials) {
          console.log("login");
          localStorage.setItem('Auth',$base64.encode(credentials.username + ':' + credentials.password))

          $rootScope.loding = true;

          var req = {
            method: 'GET',
            url: GLOBAL.login_uri,
            headers: {
              'Authorization': 'Basic ' + $base64.encode(credentials.username + ':' + credentials.password)
            }
          };
          localStorage.setItem('Auth',$base64.encode(credentials.username + ':' + credentials.password))

          var loadProject = function (name) {
            // $log.info("load project");
            Project.get(function (data) {
              console.log("load project success", data);
              for (var i = 0; i < data.items.length; i++) {
                if (data.items[i].metadata.name == name) {
                  $rootScope.namespace = name;
                  return;
                }
              }
              $log.info("can't find project");
            }, function (res) {
              $log.info("find project err", res);
            });
          };

          $http(req).success(function (data) {

            $rootScope.loding = false;

            console.log(data);

            Cookie.set('df_access_token', data.access_token, 10 * 365 * 24 * 3600 * 1000);

            loadProject(credentials.username);

            User.get({name: '~'}, function (res) {
              $rootScope.user = res;
              $state.go('console.dashboard');
            });

          }).error(function (data) {
            if (data.code == 401) {
              $rootScope.user=false;
              $rootScope.loding = false;
            }
            $rootScope.loding = false;
            Alert.open('错误', '用户名或密码不正确');
          });
        };
      }])
      .factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', 'Cookie', function ($rootScope, $q, AUTH_EVENTS, Cookie) {
        var CODE_MAPPING = {
          401: AUTH_EVENTS.loginNeeded,
          403: AUTH_EVENTS.httpForbidden,
          419: AUTH_EVENTS.loginNeeded,
          440: AUTH_EVENTS.loginNeeded
        };
        return {
          request: function (config) {
            if (/login/.test(config.url)) {
              return config;
            }
            var token = Cookie.get('df_access_token');
            if (config.headers && token) {
              config.headers["Authorization"] = "Bearer " + token;
            }

            if (/hawkular/.test(config.url)) {
              config.headers["Hawkular-Tenant"] = $rootScope.namespace;
            }
            if (/registry/.test(config.url)) {
              var Auth = localStorage.getItem("Auth")
              config.headers["Authorization"] = "Basic " + Auth;
            }
            if(config.method == 'PATCH'){
              config.headers["Content-Type"] = "application/merge-patch+json";
            }

            $rootScope.loading = true;
            return config
          },
          requestError: function (rejection) {
            $rootScope.loading = false;
            return $q.reject(rejection);
          },
          response: function (res) {
            $rootScope.loading = false;
            return res;
          },
          responseError: function (response) {
            $rootScope.loading = false;
            var val = CODE_MAPPING[response.status];
            if (val) {
              $rootScope.$broadcast(val, response);
            }
            return $q.reject(response);
          }
        };
      }]);
});
