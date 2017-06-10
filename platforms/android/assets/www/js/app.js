angular.module('app', ['ionic', 'ngCordova', 'app.sortable', 'app.controllers', 'app.services', 'app.directives', 'app.filters', 'app.constants'])

.run(function($ionicPlatform, $rootScope, $location, $timeout, $ionicHistory, $cordovaToast, StatusBarColor) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(false);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
            StatusBar.backgroundColorByHexString(StatusBarColor.ColorOfHome);
        }
        
    });

    $ionicPlatform.registerBackButtonAction(function (e) {

        var toastOptions = {
            message: "再按一次退出直播潞安",
            duration: "short", 
            position: "bottom",
            addPixelsY: -120
        };

        if ($location.path() == '/tab/home' || $location.path() == '/tab/services' || $location.path() == '/tab/account') {
            if ($rootScope.backButtonPressedOnceToExit) {
                ionic.Platform.exitApp();
            } 
            else {
                $rootScope.backButtonPressedOnceToExit = true;
                $cordovaToast.showWithOptions(toastOptions);
                $timeout(function () {
                    $rootScope.backButtonPressedOnceToExit = false;
                }, 2000);
            }
        }
        else if ($ionicHistory.backView()) {
            $ionicHistory.goBack();
        } 
        else {
            $rootScope.backButtonPressedOnceToExit = true;
            $cordovaToast.showWithOptions(toastOptions);
            $timeout(function () {
                $rootScope.backButtonPressedOnceToExit = false;
            }, 2000);
        }

        e.preventDefault();

        return false;
    }, 101);
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $stateProvider
    // setup an abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })

    // Each tab has its own nav history stack:
    .state('tab.home', {
        url: '/home',
        views: {
            'tab-home': {
                templateUrl: 'templates/tab-home.html',
                controller: 'HomeCtrl'
            }
        }
    })

    .state('tab.detail', {
        url: '/detail/:id',
        views: {
            'tab-home': {
                templateUrl: 'templates/detail.html',
                controller: 'DetailCtrl'
            }
        }
    })

    .state('tab.services', {
        url: '/services',
        views: {
            'tab-services': {
                templateUrl: 'templates/tab-services.html',
                controller: 'ServicesCtrl'
            }
        }
    })

    .state('tab.service',{
        url: '/service/:id',
        views : {
            'tab-services' : {
                templateUrl: 'templates/tab-service.html',
                controller: 'ServiceCtrl'
            }
        }
    })

    .state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            }
        }
    })

    .state('tab.login', {
        url: '/login',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-login.html',
                controller: 'LoginCtrl'
            }
        }
    })

    .state('tab.register', {
        url: '/register',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-register.html',
                controller: 'RegisterCtrl'
            }
        }
    })

    .state('tab.forgetPassword', {
        url: '/forgetPassword',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-forgetPassword.html',
                controller: 'ForgetPasswordCtrl'
            }
        }
    })

    .state('tab.myComments', {
        url:'/myComments',
        views:{
            'tab-account':{
                templateUrl: 'templates/myComments.html',
                controller: 'myCommentsCtrl'
            }
        }
    })

    .state('tab.myArticles', {
        url:'/myArticles',
        views:{
            'tab-account':{
                templateUrl: 'templates/myArticles.html',
                controller: 'myArticlesCtrl'
            }
        }
    })

    .state('tab.myContact', {
        url:'/myContact',
        views:{
            'tab-account':{
                templateUrl: 'templates/myContact.html',
                controller: 'myContactCtrl'
            }
        }
    })

    .state('tab.publish', {
        url:'/publish/:id',
        views:{
            'tab-account':{
                templateUrl: 'templates/publish.html',
                controller: 'publishCtrl'
            }
        }
    })

    .state('tab.LookMyArticle',{
        url: '/LookMyArticle/:id',
        views : {
            'tab-account' : {
                templateUrl: 'templates/LookMyArticle.html',
                controller: 'LookMyArticleCtrl'
            }
        }
    })

    .state('tab.myDetail', {
        url: '/myDetail/:id',
        views: {
            'tab-account': {
                templateUrl: 'templates/detail.html',
                controller: 'DetailCtrl'
            }
        }
    })

    .state('tab.myCollects', {
        url:'/myCollects',
        views:{
            'tab-account':{
                templateUrl: 'templates/myCollects.html',
                controller: 'myCollectsCtrl'
            }
        }
    })

    .state('tab.feedback', {
        url:'/feedback',
        views:{
            'tab-account':{
                templateUrl: 'templates/tab-feedback.html',
                controller: 'feedbackCtrl'
            }
        }
    })

    .state('tab.setting', {
        url:'/setting',
        views:{
            'tab-account':{
                templateUrl: 'templates/tab-setting.html',
                controller: 'settingCtrl'
            }
        }
    })

    .state('tab.about', {
        url:'/about',
        views:{
            'tab-account':{
                templateUrl: 'templates/tab-about.html',
                controller: 'aboutCtrl'
            }
        }
    });

    $urlRouterProvider.otherwise('/tab/home');

    $ionicConfigProvider.platform.android.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.backButton.text('');
})

.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.
        'http://60.220.238.2:8080/**'
    ]);

    // localStorage.setItem('fontSize', angular.toJson({'fz':'14px'}));

    // The blacklist overrides the whitelist so the open redirect here is blocked.
    $sceDelegateProvider.resourceUrlBlacklist([]);
});
