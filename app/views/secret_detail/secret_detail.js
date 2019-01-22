'use strict';
angular.module('console.secret_detail', [
    {
        files: []
    }
])
    .controller('secretDetailCtrl', ['Confirm','Toast','by', '$state', '$http', '$scope', '$rootScope', 'listSecret', 'modifySecret', 'deleteSecret', '$stateParams', 'toastr',
        function (Confirm,Toast,by, $state, $http, $scope, $rootScope, listSecret, modifySecret, deleteSecret, $stateParams, toastr) {
            $scope.grid = {
                status: false
            };
            var Base64 = {
                _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                encode: function (e) {
                    var t = "";
                    var n, r, i, s, o, u, a;
                    var f = 0;
                    e = Base64._utf8_encode(e);
                    while (f < e.length) {
                        n = e.charCodeAt(f++);
                        r = e.charCodeAt(f++);
                        i = e.charCodeAt(f++);
                        s = n >> 2;
                        o = (n & 3) << 4 | r >> 4;
                        u = (r & 15) << 2 | i >> 6;
                        a = i & 63;
                        if (isNaN(r)) {
                            u = a = 64
                        } else if (isNaN(i)) {
                            a = 64
                        }
                        t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                    }
                    return t
                },
                decode: function (e) {
                    var t = "";
                    var n, r, i;
                    var s, o, u, a;
                    var f = 0;
                    e = e.replace(/[^A-Za-z0-9+/=]/g, "");
                    while (f < e.length) {
                        s = this._keyStr.indexOf(e.charAt(f++));
                        o = this._keyStr.indexOf(e.charAt(f++));
                        u = this._keyStr.indexOf(e.charAt(f++));
                        a = this._keyStr.indexOf(e.charAt(f++));
                        n = s << 2 | o >> 4;
                        r = (o & 15) << 4 | u >> 2;
                        i = (u & 3) << 6 | a;
                        t = t + String.fromCharCode(n);
                        if (u != 64) {
                            t = t + String.fromCharCode(r)
                        }
                        if (a != 64) {
                            t = t + String.fromCharCode(i)
                        }
                    }
                    t = Base64._utf8_decode(t);
                    return t
                },
                _utf8_encode: function (e) {
                    e = e.replace(/rn/g, "n");
                    var t = "";
                    for (var n = 0; n < e.length; n++) {
                        var r = e.charCodeAt(n);
                        if (r < 128) {
                            t += String.fromCharCode(r)
                        } else if (r > 127 && r < 2048) {
                            t += String.fromCharCode(r >> 6 | 192);
                            t += String.fromCharCode(r & 63 | 128)
                        } else {
                            t += String.fromCharCode(r >> 12 | 224);
                            t += String.fromCharCode(r >> 6 & 63 | 128);
                            t += String.fromCharCode(r & 63 | 128)
                        }
                    }
                    return t
                },
                _utf8_decode: function (e) {
                    var t = "";
                    var n = 0;
                    var c2 = 0;
                    var c1=0;
                    var r =0;
                    var c3 =0;
                    while (n < e.length) {
                        r = e.charCodeAt(n);
                        if (r < 128) {
                            t += String.fromCharCode(r);
                            n++
                        } else if (r > 191 && r < 224) {
                            c2 = e.charCodeAt(n + 1);
                            t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                            n += 2
                        } else {
                            c2 = e.charCodeAt(n + 1);
                            c3 = e.charCodeAt(n + 2);
                            t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                            n += 3
                        }
                    }
                    return t
                }
            };
            //list the detail of current secret
            listSecret.get({namespace: $rootScope.namespace, name: $stateParams.name,region:$rootScope.region}, function (res) {
                $scope.item = res;
                $scope.item.secretarr = [];
                $scope.change = false;
                angular.forEach(res.data, function (res, i) {
                    $scope.item.secretarr.push({key: i, value:Base64.decode(res)});
                });
                //console.log($scope.item.secretarr);
            },function (err) {
                $state.go('console.resource_secret', {namespace:$rootScope.namespace})
            });

            function readSingleFile(e) {
                var thisfilename = this.value;
                //console.log(thisfilename);
                if (thisfilename.indexOf('\\')) {
                    var arr = thisfilename.split('\\');
                    thisfilename = arr[arr.length - 1]
                }
                var file = e.target.files[0];
                if (!file) {
                    return;
                }
                var reader = new FileReader();
                reader.onload = function (e) {
                    var content = e.target.result;
                    // $scope.item.newarr.push({key: thisfilename, value: content,showLog:false});
                    $scope.item.secretarr[$scope.check].value = content;
                    $scope.$apply();
                };
                reader.readAsText(file);
            };

            $scope.AddConfigurationFile = function () {
                $scope.item.secretarr.push({key: '', value: ''});
            };

            $scope.addFile= function (i) {
                $scope.check = i;
                // document.getElementById('file-input').addEventListener('change', readSingleFile, false);
                document.getElementsByClassName('upLoadFile')[$scope.check].addEventListener('change', readSingleFile, false);
            };

            $scope.deleteOriginkv = function (idx) {
                $scope.item.secretarr.splice(idx, 1);
            };

            $scope.clearOriginCode = function (item) {
                $scope.check = item;
                $scope.item.secretarr[$scope.check].value = '';
            };
            function keyerr(arr) {
                console.log('arr,', arr);
                var rex = /^\.?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
                var cancreat = true
                angular.forEach(arr, function (item, i) {
                    if (item.key === '') {
                        cancreat = false;
                        item.err.key.nil = true
                    } else if (!rex.test(item.key)) {
                        cancreat = false;
                        item.err.key.rexed = true
                    } else {
                        angular.forEach(arr, function (initem, k) {
                            if (i !== k) {
                                if (item.key === initem.key) {
                                    cancreat = false;
                                    item.err.key.repeated = true;
                                    initem.err.key.repeated = true;
                                }
                            }
                        })
                    }
                });
                if (cancreat) {
                    return 'cancreat'
                } else {
                    return 'dontcreat'
                }
            }
            $scope.updateSecret = function () {
                $scope.item.data={};
                angular.forEach($scope.item.secretarr, function (item, i) {
                    $scope.item.secretarr[i].err = {
                        key: {
                            nil: false,
                            rexed: false,
                            repeated: false
                        }
                    }

                });
                if (keyerr($scope.item.secretarr) !== 'cancreat') {

                    return
                }

                angular.forEach($scope.item.secretarr, function (item,i) {
                    $scope.item.data[item.key] = Base64.encode(item.value);
                });
                delete $scope.item.secretarr;
                modifySecret.update({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name,
                    region:$rootScope.region
                }, $scope.item, function (res) {
                    //console.log('test the item', res);
                    // Toast.open('保存成功')
                    toastr.success('更新成功', {
                        closeButton: true
                    });
                    $state.go('console.resource_secret', {namespace:$rootScope.namespace})
                })
            };
            $scope.delete = function () {

                Confirm.open("删除密钥卷", "您确定要删除密钥卷吗？", "如果密钥卷已经挂载在容器中，删除此密钥卷，容器启动将异常", "stop").then(function(){

                    deleteSecret.delete({namespace: $rootScope.namespace,region:$rootScope.region,name:$scope.item.metadata.name}, function () {
                        toastr.success('删除成功', {
                            closeButton: true
                        });
                        $state.go('console.resource_secret', {namespace:$rootScope.namespace})
                        // $state.go('console.resource_management', {index: 3})
                    },function (err) {
                        toastr.error('删除失败，请重试', {
                            closeButton: true
                        });
                        Confirm.open("删除密钥卷", "删除密钥卷失败", "密钥卷已经挂载在容器中，您需要先停止服务，卸载密钥卷后，才能删除。", null,true)
                    })


                })
            }
            $scope.editYaml = function () {
                $state.go('console.edit_yaml_file',{namespace: $rootScope.namespace, name: $scope.item.metadata.name,kind: $scope.item.kind});
            };
        }]);