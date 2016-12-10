angular.module('app', ['ionic', 'underscore', 'app.controllers', 'app.services', 'app.directives', 'ngCordova'])

.run(function($ionicPlatform, $rootScope, $location, $timeout, $ionicHistory, $cordovaToast, $cordovaStatusbar, $ionicPopup) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleLightContent();
			// StatusBar.styleDefault 状态栏默认样式，也就是电池信号黑色；
			// StatusBar.styleLightContent 状态栏内容浅色，貌似就是白色，适合深色背景；
			// StatusBar.styleBlackTranslucent 状态栏黑色半透明，我测了下，跟上面一样的效果，电池时间都是白色的，适合深色背景；
			// StatusBar.styleBlackOpaque 状态栏黑色不透明。我测了下，还是白色的，跟上面一样，适合深色背景；
			// StatusBar.hide 状态栏隐藏；
			// StatusBar.show 状态栏显示；
		}
	});

	// 双击退出
	// $ionicPlatform.registerBackButtonAction(function (e) {
	//     //判断处于哪个页面时双击退出
	//     // if ($location.path() == '/home' || $location.path() == '/account' || $location.path() == '/services') {
	//     if ($location.path()) {
	//         if ($rootScope.backButtonPressedOnceToExit) {
	//             ionic.Platform.exitApp();
	//         } else {
	//             $rootScope.backButtonPressedOnceToExit = true;
	//             $cordovaToast.showShortTop('再按一次退出');
	//             setTimeout(function () {
	//                 $rootScope.backButtonPressedOnceToExit = false;
	//             }, 2000);
	//         }
	//     }
	//     else if ($ionicHistory.backView()) {
	//         $ionicHistory.goBack();
	//     } else {
	//         $rootScope.backButtonPressedOnceToExit = true;
	//         $cordovaToast.showShortTop('再按一次退出');
	//         setTimeout(function () {
	//             $rootScope.backButtonPressedOnceToExit = false;
	//         }, 2000);
	//     }
	//     e.preventDefault();
	//     return false;
	// }, 101);
	$ionicPlatform.registerBackButtonAction(function (e){
		//阻止默认的行为
		e.preventDefault();
		// 退出提示框
		function showConfirm() {
		  var servicePopup = $ionicPopup.show({
			title: '提示',
			subTitle: '你确定要退出应用吗？',
			scope: $rootScope,
			buttons: [{
				text: '取消',
				type: 'button-clear button-assertive',
				onTap: function () {
				  return 'cancel';
				}
			  },{
				text: '确认',
				type: 'button-clear button-assertive border-left',
				onTap: function (e) {
				  return 'active';
				}
			  }]
		  });
		  servicePopup.then(function (res) {
			if (res == 'active') {
			  // 退出app
			  ionic.Platform.exitApp();
			}
		  });
		}
		 // 判断当前路由是否为各个导航栏的首页，是的话则显示提示框
		if ($location.path() == '/home' || $location.path() == '/services' || $location.path() == '/account') {
			showConfirm();
		} else if ($ionicHistory.backView()) {
		  $ionicHistory.goBack();
		} else {
		  showConfirm();
		}
		return false;
	  }, 101); //101优先级常用于覆盖‘返回上一个页面’的默认行为
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
