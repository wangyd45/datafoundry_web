angular.module("console.search",[{files:["components/searchbar/searchbar.css"]}]).directive("cSearch",[function(){return{restrict:"EA",replace:!0,templateUrl:"components/searchbar/searchbar.html",scope:{search:"="},controller:["$scope",function(e){e.doSearch=function(t,n){e.showTip=!1,e.search(t,n)}}]}}]);