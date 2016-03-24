angular.module("console.build",[{files:["components/searchbar/searchbar.js","views/build/build.css"]}]).controller("BuildCtrl",["$scope","$log","$state","$stateParams","BuildConfig","Build","GLOBAL","Sort",function($scope,$log,$state,$stateParams,BuildConfig,Build,GLOBAL,Sort){$scope.grid={page:1,size:GLOBAL.size,txt:""},$scope.$watch("grid.page",function(e,t){e!=t&&refresh(e)});var refresh=function(e){var t=(e-1)*$scope.grid.size;$scope.items=$scope.data.items.slice(t,t+$scope.grid.size)};$scope.search=function(key,txt){if(txt=="")return;$scope.items=[],txt=txt.replace(/\//g,"\\/");var reg=eval("/"+txt+"/");angular.forEach($scope.data.items,function(e){key=="all"?(reg.test(e.metadata.name)||reg.test(e.spec.source.git.uri))&&$scope.items.push(e):key=="metadata.name"&&reg.test(e.metadata.name)&&$scope.items.push(e)}),$scope.grid.total=$scope.items.length};var loadBuildConfigs=function(){BuildConfig.get(function(e){$log.info("buildConfigs",e),e.items=Sort.sort(e.items,-1),$scope.data=e,$scope.grid.total=e.items.length,refresh(1),loadBuilds($scope.data.items)},function(e){})},loadBuilds=function(e){Build.get(function(e){$log.info("builds",e),fillBuildConfigs(e.items)})},fillBuildConfigs=function(e){var t={};for(var n=0;n<e.length;n++){if(!e[n].metadata.labels)continue;var r=e[n].metadata.labels.buildconfig;if(!t[r]){t[r]=e[n];continue}var i=(new Date(e[n].metadata.creationTimestamp)).getTime();(new Date(t[r].metadata.creationTimestamp)).getTime()<i&&(t[r]=e[n])}angular.forEach($scope.data.items,function(e){var n=e.metadata.name;if(!t[n])return;e.status.phase=t[n].status.phase,e.status.startTimestamp=t[n].metadata.creationTimestamp,e.status.duration=t[n].status.duration})};loadBuildConfigs(),$scope.refresh=function(){loadBuildConfigs()},$scope.startBuild=function(e){var t=$scope.items[e].metadata.name,n={metadata:{name:t}};BuildConfig.instantiate.create({name:t},n,function(){$log.info("build instantiate success"),$state.go("console.build_detail",{name:t})},function(e){})},$scope.stopBuild=function(){$log.info("stop build")}}]);