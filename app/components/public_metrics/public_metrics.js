/**
 * Created by sorcerer on 2017/12/29.
 */

angular.module("console.pubmetrics", [])
    .directive('publicMetrics', function () {
    return {
        restrict: 'E',
        templateUrl: 'components/public_metrics/public_metrics.html',
        scope: {
            podname:'=',
            podid:'=',
            conname:'=',
            statefulPods:'='
        },
        controller: ['$scope', 'statefuldetail', '$rootScope','PieChar','DeploymentConfig','Cookie',
            function ($scope, statefuldetail, $rootScope,PieChar,DeploymentConfig,Cookie) {
                //$rootScope.namespace=
                console.log($scope.statefulPods);
                $scope.times = (new Date()).getTime()
                var netChart = function (title, arr) {
                    return {
                        options: {
                            chart: {
                                type: 'spline'

                            },
                            title: {
                                text: name,
                                align: 'left',
                                x: 0,
                                style: {
                                    fontSize: '12px'
                                }
                            },
                            credits: {
                                enabled: false
                            },
                            tooltip: {
                                xDateFormat :  '%H:%M:%S',
                                backgroundColor: '#666',
                                borderWidth: 0,
                                shadow: false,
                                style: {
                                    color: '#fff'
                                }
                            },
                            legend: {
                                enabled: true
                            }
                        },
                        series: arr,
                        xAxis: {
                            // categories: ['12:00','14:00', '16:00', '18:00', '20:00', '22:00', '24:00'],
                            type: 'datetime',
                            gridLineWidth: 1
                        },
                        yAxis: [{
                            //floor:0,
                            //max:30,
                            // gridLineDashStyle: 'ShortDash',
                            title: {
                                text: title,
                                style: {
                                    color: '#bec0c7'
                                }
                            }

                        }],
                        size: {
                            height: 230,
                            width: 950
                        },
                        func: function (chart) {
                            //setup some logic for the chart
                        }
                    };
                };

                    var networkobj = {
                        tags: 'descriptor_name:network/tx_rate|network/rx_rate,type:pod,pod_id:' + $scope.podid,
                        bucketDuration: "120000ms",
                        start: "-60mn"
                    }
                    var cpuandmemoryobj = {
                        tags: "descriptor_name:memory/usage|cpu/usage_rate,type:pod_container,pod_id:" + $scope.podid + ",container_name:" + $scope.conname,
                        bucketDuration: "120000ms",
                        start: "-60mn"
                    }


                var getcpuandmemory = function (cpuandmemoryobj) {
                    PieChar.create(cpuandmemoryobj, function (data) {
                        var CPUmetricsList = [];
                        var MEMmetricsList = [];
                        angular.forEach(data.gauge, function (item, i) {
                            var newcpuData = [];
                            var newmemData = [];
                            var cpudata = [];
                            var memdata = [];
                            var k = i.split('/')[i.split('/').length - 2];
                            var curPodUid = i.split('/')[i.split('/').length - 3];
                            var curPodName=''
                            if ($scope.statefulPods) {
                                for (var i = 0; i < $scope.statefulPods.length; i++) {
                                    if ($scope.statefulPods[i].metadata.uid == curPodUid) {
                                        curPodName = $scope.statefulPods[i].metadata.name;
                                    }
                                }
                            }else {
                                 curPodName = $scope.podname;
                            }
                            if (k == 'cpu') {
                                cpudata = item;
                                angular.forEach(cpudata, function (input, i) {
                                    if (!input.empty) {
                                        newcpuData.push(Math.floor(input.avg / 1000 * 1000) / 1000);
                                    } else {
                                        newcpuData.push(0);
                                    }
                                })
                                var obj = {
                                    name: curPodName,
                                    fillColor: {
                                        linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                                        stops: [
                                            [0, Highcharts.Color('#fff').setOpacity(0.8).get('rgba')],
                                            [1, '#4ca7de']
                                        ]
                                    },
                                    // lineColor: '#4d5266',
                                    fillOpacity: 0.6,
                                    marker: {
                                        enabled: true
                                    },
                                    data: newcpuData,
                                    pointStart: $scope.times/1000 + 3600 * 1000,//当前时间+前一个小时
                                    pointInterval: 2 * 60 * 1000 //时间间隔
                                }
                                CPUmetricsList.push(obj);

                            } else if (k == 'memory') {
                                memdata = item
                                angular.forEach(memdata, function (input, i) {
                                    if (!input.empty) {
                                        newmemData.push(Math.floor(input.avg / (1024 * 1024) * 100) / 100);
                                    } else {
                                        newmemData.push(0);
                                    }

                                });
                                var obj = {
                                    name: curPodName,
                                    fillColor: {
                                        linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                                        stops: [
                                            [0, Highcharts.Color('#fff').setOpacity(0.8).get('rgba')],
                                            [1, '#4ca7de']
                                        ]
                                    },
                                    // lineColor: '#4d5266',
                                    fillOpacity: 0.6,
                                    marker: {
                                        enabled: true
                                    },
                                    yAxis: 0,
                                    data: newmemData,
                                    pointStart: $scope.times/1000 + 3600 * 1000,
                                    pointInterval: 2 * 60 * 1000 //时间间隔
                                }
                                MEMmetricsList.push(obj);
                            }


                        });
                        //console.log(CPUmetricsList, MEMmetricsList);
                        $scope.CpuConfig = netChart('CPU/cores', CPUmetricsList);
                        $scope.MemConfig = netChart('Memory/MiB', MEMmetricsList);

                    })
                }

                var getNetwork = function (networkobj) {
                    PieChar.create(networkobj, function (data) {
                        var TXmetricsList = [];
                        var RXmetricsList = [];
                        angular.forEach(data.gauge, function (item, i) {
                            var testobj = {
                                name: '',
                                fillColor: {
                                    linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                                    stops: [
                                        [0, Highcharts.Color('#fff').setOpacity(0.8).get('rgba')],
                                        [1, '#4ca7de']
                                    ]
                                },
                                // lineColor: '#4d5266',
                                fillOpacity: 0.6,
                                marker: {
                                    enabled: true
                                },
                                data: '',
                                pointStart: $scope.times/1000 + 3600 * 1000,
                                pointInterval: 2 * 60 * 1000 //时间间隔
                            }
                            var networkrx = [];
                            var networktx = [];
                            var newnettxdata = [];
                            var newnetrxdata = [];
                            var k = i.split('/')[i.split('/').length - 1];
                            var curPodUid = i.split('/')[i.split('/').length - 3];
                            if ($scope.statefulPods) {
                                for (var i = 0; i < $scope.statefulPods.length; i++) {
                                    if ($scope.statefulPods[i].metadata.uid == curPodUid) {
                                        curPodName = $scope.statefulPods[i].metadata.name;
                                    }
                                }
                            }else {
                                curPodName = $scope.podname;
                            }
                            if (k == 'tx_rate') {
                                networkrx = item;
                                angular.forEach(networkrx, function (input, i) {
                                    if (!input.empty) {
                                        newnetrxdata.push(Math.floor(input.avg / 1024 * 1000) / 1000)
                                    } else {
                                        newnetrxdata.push(0)
                                    }

                                })
                                testobj.name = curPodName;
                                testobj.data = newnetrxdata;
                                TXmetricsList.push(testobj);
                            } else if (k == 'rx_rate') {
                                networktx = item;
                                angular.forEach(networktx, function (input, i) {
                                    if (!input.empty) {
                                        newnettxdata.push(Math.floor(input.avg / 1024 * 1000) / 1000)
                                    } else {
                                        newnettxdata.push(0)
                                    }
                                })
                                testobj.name = curPodName;
                                testobj.data = newnettxdata;
                                RXmetricsList.push(testobj);
                            }

                        })
                        $scope.TxConfig = netChart('Network (Sent)KB/s', TXmetricsList);
                        $scope.RxConfig = netChart('Network (Received)KB/s', RXmetricsList);
                    })

                }
                getNetwork(networkobj);
                getcpuandmemory(cpuandmemoryobj);
            }]
    };
})