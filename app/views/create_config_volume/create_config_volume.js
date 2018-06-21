'use strict';
angular.module('console.create_config_configMap', [
    {
        files: []
    }
]).controller('createfigvolumeCtrl', ['$state', '$rootScope', '$scope', 'configmaps', 'toastr', function ($state, $rootScope, $scope, configmaps, toastr) {
    $scope.volume = {
        "kind": "ConfigMap",
        "apiVersion": "v1",
        "metadata": {
            "name": ""
        },
        "data": {},
        "configitems": []
    };
    $scope.grid = {
        configpost: false,
        keychongfu: false,
        keybuhefa: false,
        keynull: false,
        lableKey:false
    };
    //排序
    var by = function (name) {
        return function (o, p) {
            var a, b;
            if (typeof o === "object" && typeof p === "object" && o && p) {
                a = o[name];
                b = p[name];
                if (a === b) {
                    return 0;
                }
                if (typeof a === typeof b) {
                    return a < b ? -1 : 1;
                }
                return typeof a < typeof b ? -1 : 1;
            } else {
                throw ("error");
            }
        }
    };
    //readFile
    function readSingleFile(e) {
        var thisfilename = this.value;
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
            $scope.volume.configitems[$scope.check].value = content;
            $scope.volume.configitems[$scope.check].isClearCode = true;
            $scope.$apply();
        };
        reader.readAsText(file);

    };
    //delete key value
    $scope.deletekv = function (idx) {
        $scope.volume.configitems.splice(idx, 1);
    };
    // $scope.$watch('volume', function (n, o) {
    //     if (n == o) {
    //         return
    //     }
    //     //console.log(n);
    //     $scope.grid.keychongfu = false;
    //     $scope.grid.keynull = false;
    //     $scope.grid.keybuhefa = false;
    //     if (n.metadata.name && n.configitems) {
    //
    //         var arr = n.configitems;
    //         // arr.sort(by("key"));
    //
    //         if (arr && arr.length > 0) {
    //             var kong = false;
    //             // var r =/^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;
    //             var r = /^\.?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
    //             angular.forEach(arr, function (item, i) {
    //
    //                 if (!item.key || !item.value) {
    //                     $scope.grid.keynull = true;
    //                     kong = true;
    //                 } else {
    //                     if (arr[i] && arr[i + 1]) {
    //                         if (arr[i].key == arr[i + 1].key) {
    //                             $scope.grid.keychongfu = true;
    //                             kong = true;
    //                         }
    //                     }
    //                     if (!r.test(arr[i].key)) {
    //                         $scope.grid.keybuhefa = true;
    //                         kong = true;
    //                     }
    //                 }
    //             });
    //             if (!kong) {
    //                 // alert("111")
    //                 $scope.grid.configpost = true
    //             } else {
    //                 // alert("222")
    //                 $scope.grid.configpost = false
    //             }
    //         } else {
    //             // alert("333");
    //             $scope.grid.configpost = false
    //         }
    //     } else {
    //         $scope.grid.configpost = false
    //     }
    // }, true);

    //添加配置文件
    $scope.AddConfigurationFile = function () {
        $scope.grid.lableKey = true;
        $scope.volume.configitems.push({key: '', value: '', isClearCode: false});
    };
    // clear code
    $scope.clearCode = function (index) {
        $scope.volume.configitems[index].value = '';
        $scope.volume.configitems[index].isClearCode = false;
    };
    // add file
    $scope.addFile = function (i) {
        $scope.check = i;
        // console.log('addFile',i,$scope.check);
        // document.getElementById('file-input').addEventListener('change', readSingleFile, false);
        document.getElementsByClassName('upLoadFile')[$scope.check].addEventListener('change', readSingleFile, false);
    };

    /////手动配置
    configmaps.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (res) {
        $scope.cfmnamearr = res.items;
    });
    $scope.namerr = {
        nil: false,
        rexed: false,
        repeated: false
    };
    // $scope.nameblur = function () {
    //     if (!$scope.volume.metadata.name) {
    //         $scope.namerr.nil = true
    //     } else {
    //         $scope.namerr.nil = false
    //     }
    // };
    $scope.namefocus = function () {
        $scope.namerr.nil = false
    };

    $scope.$watch('volume.metadata.name', function (n, o) {
        if (n === o) {
            return;
        }
        $scope.namerr = {
            nil: false,
            rexed: false,
            repeated: false
        };
    });

    $scope.cearteconfig = function () {
        var rex = /^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;
        if ($scope.volume.metadata.name === '') {
            $scope.namerr.nil = true;
            return
        } else if (!rex.test($scope.volume.metadata.name)) {
            $scope.namerr.rexed = true;
            return
        } else {
            for (var i = 0; i < $scope.cfmnamearr.length; i++) {
                if ($scope.volume.metadata.name === $scope.cfmnamearr[i].metadata.name) {
                    $scope.namerr.repeated = true;
                    return
                }
            }
        }
        $scope.loaded = true;
        var arr = $scope.volume.configitems;
        angular.forEach(arr, function (item, i) {
            $scope.volume.data[item.key] = item.value;
        });

        delete $scope.volume.configitems;
        configmaps.create({namespace: $rootScope.namespace, region: $rootScope.region}, $scope.volume, function (res) {
            //console.log('createconfig----', res);
            $scope.loaded = false;
            toastr.success('创建成功', {
                closeButton: true
            });
            $state.go('console.resource_configMap', {namespace: $rootScope.namespace});
            //$state.go('console.build_detail', {name: name, from: 'create'})
        }, function (res) {
            toastr.error('创建失败，请重试', {
                closeButton: true
            });
            $state.go('console.create_config_configMap', {namespace: $rootScope.namespace});
        })
    }
}]);