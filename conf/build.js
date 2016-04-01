{
    appDir: "../app",
    baseUrl: "./",
    dir: "../dist",
    optimize: "uglify",
    optimizeCss: "standard",
    removeCombined: true,
    modules: [
    {
        name: 'app'
    }
],
    paths: {
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
        jquery: '../bower_components/jquery/dist/jquery.min',
        moment: '../bower_components/moment/min/moment-with-locales.min',
        angular: '../bower_components/angular/angular.min',
        ngResource: '../bower_components/angular-resource/angular-resource.min',
        ngFileUpload: '../bower_components/ng-file-upload/ng-file-upload-all.min',
        uiBootstrap: '../bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        uiRouter: '../bower_components/angular-ui-router/release/angular-ui-router.min',
        angularAnimate: '../bower_components/angular-animate/angular-animate.min',
        angularMocks: '../bower_components/angular-mocks/angular-mocks',
        ocLazyLoad: '../bower_components/oclazyload/dist/ocLazyLoad.min',
        angularBase64: '../bower_components/angular-base64/angular-base64.min',
        angularMd: '../bower_components/angular-marked/dist/angular-marked.min'
},
    shim: {
        'angular': {
            'exports': 'angular'
        },
        'angularMocks': {
            deps: [
                'angular'
            ],
                'exports': 'angular.mock'
        },
        'angularAnimate': {
            deps: [
                'angular'
            ]
        },
        'ngResource': {
            deps: [
                'angular'
            ]
        },
        'ngFileUpload': {
            deps: [
                'angular'
            ]
        },
        'uiBootstrap': {
            deps: [
                'angular'
            ]
        },
        'uiRouter': {
            deps: [
                'angular'
            ]
        },
        'ocLazyLoad': {
            deps: [
                'angular'
            ]
        },
        'bootstrap': {
            deps: [
                'jquery'
            ]
        }
    }
}