'use strict';

angular.module('console.image_detail', [
        'base64',
        {
            files: ['components/searchbar/searchbar.js']
        }
    ])
    .controller('ImageDetailCtrl', ['$scope', '$log', 'ImageStreamTag', '$stateParams', function ($scope, $log, ImageStreamTag, $stateParams) {
        $log.info('ImageDetailCtrl');

        var loadImageDetail = function(){
            //传imagename的参数
            ImageStreamTag.get({name: $stateParams["name"]}, function(data){
                $log.info('data',data);
                $scope.data = data;

                var gitUrl = data.image.dockerImageMetadata.Config.Labels['io.openshift.build.source-location'];
                var ref = data.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref'];

                var matches = gitUrl.match(/^https:\/\/github.com\/([^/]+)\/(.+)\.git$/);
                console.log('matches', matches);
                if(matches){
                    loadReadme(matches[1], matches[2], ref);
                }
            }, function(res){
                //todo 错误处理
            });
        };

        loadImageDetail();

        var loadReadme = function(owner, repo, ref) {
            var url = 'https://raw.githubusercontent.com/'+ owner +'/'+ repo +'/'+ ref +'/README.md';
            $.get(url, function(data){
                $scope.readme = data;
                $scope.$apply();
            });
        };
    }]);