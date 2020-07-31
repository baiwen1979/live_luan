angular.module('app.controllers', ['ngCordova', 'app.constants', 'underscore'])

.controller('HomeCtrl', function(
	$rootScope, $scope, $timeout, $ionicPlatform, 
	$ionicScrollDelegate, $ionicSlideBoxDelegate, $ionicModal, $cordovaToast, 
	Model, Util, StatusBarColor) {

	//active slideIndex
	$scope.slideIndex = 0;

	//constructor CategoryVM
	function CategoryVM(id) {
		this.id = id;
		this.hasMore = false;
		this.items = [];
		this.pageCount = 0;
	}

	function setItemsAs(items, fromIndex, toIndex, what, as) {
		for (var i = fromIndex; i <= toIndex; i++) {
			if (items[i] && items[i][what]) {
				items[i].as = as;
			}
		}
	}

	//called when Articles have been loaded
	function onArticlesLoad() {
		$ionicScrollDelegate.resize();
		$ionicSlideBoxDelegate.update();
		$scope.$broadcast('scroll.refreshComplete');
		$scope.$broadcast('scroll.infiniteScrollComplete');
	}
	//initialize every Category View Models
	function initCategoryVMs() {
		Util.getCategories(function(categories) {
			// console.log('initCategoryVMs');
			if(localStorage.getItem('categorySort')){
				categories = angular.fromJson(localStorage.getItem('categorySort'));
			}else{
				localStorage.setItem('categorySort', angular.toJson(categories));
			}
			$scope.categorySort = categories;

			for (var i in categories) {
				var vm = new CategoryVM(categories[i].id);
				categories[i].vm = vm;
			}

			$scope.categories = categories;
			if ($scope.categories) {
				$timeout(function() {
					$scope.outerSlideChanged($scope.slideIndex);
				}, 100);
			}
		}, function(err) {
			$scope.error = err;
		});
	}

	function checkUpdate () {
		if (ionic.Platform.isAndroid()) {
			Util.checkUpdate();
		}
	}

	function registerApp() {
		if (!localStorage.getItem('appId')) {
			Util.getAppId().then(function(appId) {
				localStorage.setItem('appId', appId);
			});
		}
	}

	// 首屏广告相关
	function showAds() {
		Util.getAds().then(function(ads) {
			$scope.ads = ads;
			//console.log($scope.ads.length);
			$scope.advHide = false;
			$rootScope.hideTabs = true;
			$scope.advTime = $scope.ads.length;

			$scope.hideAdv = function (){
				$scope.advHide = true;
				$rootScope.hideTabs = false;
			};

			$scope.ctrlTime = function (index){
				$scope.advTime--;
				if($scope.advTime <= 1){
					$timeout($scope.hideAdv, 2000);
					$timeout(checkUpdate, 3000);
				}
			};

			if (ads.length == 1) {
				$timeout($scope.ctrlTime, 2000);
			}
		});
	}

	$scope.offline = false;

	//load Articles for the category specified by categoryIndex
	$scope.loadArticles = function(categoryIndex) {
		var categoryId = $scope.categories[categoryIndex].id;
		var pageCount = $scope.categories[categoryIndex].vm.pageCount;
		var param = { c: categoryId, p: pageCount };
		Model.list("Article", param, function(items) {
			for (var i in items) {
				$scope.categories[categoryIndex].vm.items.push(items[i]);
			}
			if ($scope.categories[categoryIndex].vm.pageCount === 0) {
				setItemsAs($scope.categories[categoryIndex].vm.items, 0, 4, 'large_image', 'slider');
			}
			$scope.categories[categoryIndex].vm.pageCount++;
			onArticlesLoad();
		}, function(err) {
			$scope.categories[categoryIndex].vm.hasMore = false;
		});
	};

	//refresh article list for current category
	$scope.doRefresh = function(categoryIndex) {
		$scope.categories[categoryIndex].vm.hasMore = true;
		$scope.categories[categoryIndex].vm.pageCount = 0;
		$scope.categories[categoryIndex].vm.items = [];
		$scope.loadArticles(categoryIndex);
	};

	$scope.$on('$stateChangeSuccess', function() {
		
	});

	$scope.$on('$ionicView.enter', function(e) {
		Util.setStatusBarHexColor(StatusBarColor.ColorOfHome);
		$scope.outerSlideChanged($scope.slideIndex);
	});

	//active the outer slide by index when click top tab
	$scope.activeSlide = function(index) {
		$ionicSlideBoxDelegate.$getByHandle('outer-slider').slide(index);
	};

	//fired when outer slide Changed to index
	$scope.outerSlideChanged = function(index) {
		
		if(!$scope.categories){
			$scope.offline = true;
			return;
		}

		$scope.offline = false;

		var tabScroll = $ionicScrollDelegate.$getByHandle('tabs-scroll');

		if (tabScroll) {
			$timeout (function(){
				tabScroll.scrollTo(index * 40);
				innerSlider.loop(true);
			}, 100);
		}

		var innerSlider = $ionicSlideBoxDelegate.$getByHandle('inner-slider');
		if (innerSlider) {
			$timeout(function(){
				innerSlider.loop(true);
			}, 100);
		}
				
		$scope.slideIndex = index;

		if ($scope.categories[index].vm.items.length < 1) {
			$scope.categories[index].vm.hasMore = true;
			$scope.loadArticles(index);
		}
	};

	//enable or disable the outer slide box when touch or release the inner slide box
	$scope.enableOuterSlider = function(enable) {
		$ionicSlideBoxDelegate.$getByHandle('outer-slider').enableSlide(enable);
	};

	initCategoryVMs();
	registerApp();

	if (ionic.Platform.isAndroid()) {
		showAds();
	}
	else {
		$timeout(showAds, 2800);
	}

	$scope.initCategoryVMs = initCategoryVMs;
	$ionicSlideBoxDelegate.enableSlide(true);


	// 排序的modal相关
	$ionicModal.fromTemplateUrl('templates/sortModal.html', {
			scope: $scope,
			animation: 'slide-in-right'
		}).then(function(modal) {
			$scope.modal = modal;
		});
	$scope.showModal = false;//用于控制关闭按钮的转动
	$scope.openModal = function() {
		$scope.categorySort = angular.fromJson(localStorage.getItem('categorySort'));
		$scope.modal.show();
		$scope.showModal = true;
	};
	$scope.closeModal = function() {
		for(var i = 0; i < $scope.categorySort.length; i++){
			if($scope.categorySort[i].id !== $scope.categories[i].id){
				localStorage.setItem('categorySort', angular.toJson($scope.categorySort));
				initCategoryVMs();
				$cordovaToast.showShortBottom('栏目已重排!');
				break;
			}
		}
		$scope.modal.hide();
		$scope.showModal = false;
	};
	$scope.$on('$destroy', function() {
		$scope.showModal = false;
		for(var i = 0; i < $scope.categorySort.length; i++){
			if($scope.categorySort[i].id !== $scope.categories[i].id){
				localStorage.setItem('categorySort', angular.toJson($scope.categorySort));
				initCategoryVMs();
				$cordovaToast.showShortBottom('栏目已重排!');
				break;
			}
		}
		$scope.modal.remove();
	});
	$scope.$on('modal.hide', function() {
		// 执行动作
		$scope.showModal = false;
		for(var i = 0; i < $scope.categorySort.length; i++){
			if($scope.categorySort[i].id !== $scope.categories[i].id){
				localStorage.setItem('categorySort', angular.toJson($scope.categorySort));
				initCategoryVMs();
				$cordovaToast.showShortBottom('栏目已重排!');
				break;
			}
		}
	});
	$scope.$on('modal.removed', function() {
		// 执行动作
		$scope.showModal = false;
		for(var i = 0; i < $scope.categorySort.length; i++){
			if($scope.categorySort[i].id !== $scope.categories[i].id){
				localStorage.setItem('categorySort', angular.toJson($scope.categorySort));
				initCategoryVMs();
				$cordovaToast.showShortBottom('栏目已重排!');
				break;
			}
		}
	});

})

.controller('DetailCtrl', function($scope, $stateParams, $ionicHistory,$cordovaToast,$cordovaFile,
	$ionicActionSheet, $ionicPopup, $ionicPopover, $timeout, $sce, $state,
	Storage, Model, Util, $http, StatusBarColor, ResourceUrls, $ionicModal,$ionicSlideBoxDelegate,$cordovaFileTransfer) {

	$scope.stateCurrentName = ($state.current.name === 'tab.myDetail') ? false : true;
	$scope.template = 'default';
	$scope.slideIndex = 0;
	$scope.showSubTitle = true;
	$scope.showFooterBar = true;
	$scope.fullSubTitle = false;
	$scope.myComment = "";
	$scope.goBack = Util.goBack;

	function createPopover() {
		var popover = $ionicPopover.fromTemplateUrl('templates/popover-comment.html', {
			scope: $scope
		});
		popover.then(function(po) {
			$scope.popover = po;
			//$scope.initialize({focusFirstInput: true});
		});
	}

	function isArticleVoted(id) {
		var votes = localStorage.getItem('articleVotes');
		var voted = false;
		if (votes) {
			votes = angular.fromJson(votes);
			voted = votes.indexOf(id) != -1;
		}
		return voted;
	}

	function trustUrl(article, urlAttrName) {
		if (article[urlAttrName]) {
			article[urlAttrName] = $sce.trustAsResourceUrl(article[urlAttrName]);
		}
	}

	$scope.$on('$ionicView.enter', function() {

		Util.setStatusBarHexColor(StatusBarColor.ColorOfHome);

		Model.detail('Article', { id: $stateParams.id }, function(detail) {
			//detail.content = $sce.trustAsHtml(detail.content);
			$scope.detail = detail;
			$scope.hot = isArticleVoted(detail.id);
			trustUrl($scope.detail,"srcUrl");
			Util.getDetailTemplate(detail.categoryId, function(template) {
				$scope.template = template;
			});
		}, function(err) {
			$scope.error = err;
		});
		createPopover();
	});

	$scope.onSlideClick = function() {
		$scope.showFooterBar = !$scope.showFooterBar;
		$scope.showSubTitle = !$scope.showSubTitle;
	};

	$scope.slideChanged = function(index) {
		$scope.slideIndex = index;
	};

	$scope.swipeUp = function() {
		$scope.fullSubTitle = true;
	};

	$scope.swipeDown = function() {
		$scope.fullSubTitle = false;
	};

	$scope.closePopover = function() {
		$scope.popover.hide();
	};

	$scope.commit = function(myComment) {
		var userInfo = localStorage.getItem('userInfo');

		if (userInfo && userInfo.trim()!=''){ 
			userInfo = angular.fromJson(localStorage.getItem('userInfo'));
		}

		$http({
			method:'post',
			url: ResourceUrls.ApiBaseUrl + ResourceUrls.AddComment,
			params:{
				aid: $scope.detail.id,
				uid: userInfo? userInfo.userId : '-1',
				headimgurl: userInfo? userInfo.avatar : 'img/user.png',
				username: userInfo? userInfo.username : '游客',
				content: myComment

			}
		}).success(function(data){
			// console.log(data);
			if(data.result == 'OK'){
				Util.showAlert('评论成功！');
			}
			else{
				Util.showAlert('评论被服务器拒绝！');
			}
		}).error(function(data){
			Util.showAlert('未知', '请检查网络或进行意见反馈！');
		});

		Storage.putItem('myComments', {
			id: $scope.detail.id,
			title: $scope.detail.title,
			text: myComment
		});

		$scope.detail.comments.unshift({
			// user:'我[匿名]',
			user: userInfo? userInfo.username : '我[游客]',
			portrait_url: userInfo? userInfo.avatar : 'img/user.png',
			comment: myComment,
			commentTime: (new Date()).getTime()
		});

		$scope.closePopover();

	};

	$scope.comment = function(id, event) {
		$scope.popover.show(event);
	};

	$scope.collect = function(id, title) {
		Storage.putItem('favorites', {
			id: id,
			title: title
		});
	};

	$scope.isCollected = function(id) {
		var favorites = Storage.getItems('favorites');
		for (var i in favorites) {
			if (favorites[i].id === id) {
				return true;
			}
		}
		return false;
	};

	// 分享相关代码
	$scope.ArticleShare = function (id, title, detail){
		Util.share(detail);
		Util.addShareTimes(id);
	};

	//分享到微信朋友圈
	$scope.shareTimeline = function (detail) {
		Util.WechatShare(1, detail);
		Util.addShareTimes(detail.id);
	};
	//分享到微信好友
	$scope.shareSession = function (detail) {
		Util.WechatShare(0, detail);
		Util.addShareTimes(detail.id);
	};

	$scope.likeArticle = function (detail) {
		if($scope.hot){
			return;
		}
		$scope.hot = true;

		$scope.detail.good++;
		Util.voteArticle(detail.id);
	};

	// 文章内图片点击出现图片box并可下载的实现
	$scope.imgArr = [];
	$ionicModal.fromTemplateUrl('templates/imageModal.html', {
		scope: $scope,
		animation: 'slide-in-right'
	}).then(function(modal) {
			$scope.modal = modal;
	});
	$scope.openModal = function(content, e) {
		if(e.target.tagName !== 'IMG'){
			return;
		}
		var src = e.target.src;
		var imgArr = content.match(/http[^\"'>]+.[jpg|JPG|jpeg|JPEG|gif|GIF|png|PNG]/gi);
		for(var i = 0; i < imgArr.length; i++){
			if(imgArr[i] == src){
				$ionicSlideBoxDelegate.slide(i, 0);
				break;
			}
		}
		$scope.imgArr = imgArr;
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
	$scope.download = function (){
		var url = $scope.imgArr[$ionicSlideBoxDelegate.currentIndex()];
		function saveImageToPhone(url, success, error) {
			var canvas, context, imageDataUrl, imageData;
			var img = new Image();
			img.onload = function () {
				canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;
				context = canvas.getContext('2d');
				context.drawImage(img, 0, 0);
				try {
					imageDataUrl = canvas.toDataURL('image/png', 1.0);
					imageData = imageDataUrl.replace(/data:image\/png;base64,/, '');
					cordova.exec(
						success,
						error,
						'Canvas2ImagePlugin',
						'saveImageDataToLibrary',
						[imageData]
					);
				}
				catch (e) {
					error(e.message);
				}
			};
			try {
				img.src = url;
			}
			catch (e) {
				error(e.message);
			}
		}
		var success = function (msg) {
			$cordovaToast.showWithOptions({
				message: '已保存至' + msg,
				duration: "long", 
				position: "bottom",
				addPixelsY: -120
			});
		};
		var error = function (err) {
			$cordovaToast.showWithOptions({
				message: err,
				duration: "long", 
				position: "bottom",
				addPixelsY: -120
			});
		};
		saveImageToPhone(url, success, error);
	};

})

//服务控制器
.controller('ServicesCtrl', function($scope, Util, StatusBarColor, _) {

	$scope.$on('$ionicView.enter', function(e) {
		Util.setStatusBarHexColor(StatusBarColor.ColorOfServices);
	});

	$scope.loadServices = function() {
		Util.getServices(function(items) {
			$scope.groups = _.groupBy(items, function(item){return 's' + item.serviceType.id});
			//console.log($scope.groups);
		});
	};
	$scope.$on('$ionicView.enter', $scope.loadServices);
})

//服务详情控制器
.controller('ServiceCtrl', function($timeout, $scope, $sce, $stateParams, Util) {
	Util.getServices(function(services) {
		for (var i = 0; i < services.length; i++) {
			if (services[i].id == $stateParams.id) {
				$scope.service = services[i];
				$scope.serviceUrl = $sce.trustAsResourceUrl($scope.service.serviceUrl);
				break;
			}
		}
	});

})

.controller('LoginCtrl', function($rootScope, $scope, $ionicLoading, $stateParams, $ionicHistory, $http, 
	$location, $ionicPopup, $timeout, Util, Storage, ResourceUrls) {
	$scope.user = {};
	$scope.goBack = Util.goBack;
	$scope.$on('$ionicView.enter', function() {
		if(localStorage.getItem('userInfo')){
			if(angular.fromJson(localStorage.getItem('userInfo'))){
				$scope.isLogin = true;
				$scope.userinfo = angular.fromJson(localStorage.getItem('userInfo'));
			}
		}else{
			$scope.isLogin = false;
		}
	});

	$scope.userinfo = '';

	$scope.logoff = function (){
		$scope.isLogin = false;
		localStorage.setItem('userInfo', '');
	};

	$scope.switchAccount = function (){
		$scope.wechatLogin();
	};

	$scope.QQLogin = function (){
		Util.showAlert('无法登录', '目前版本仅支持微信登录');
	};
	$scope.wechatLogin = function (){
		Util.wechatLogin(function (userinfo) {

			var userInfo = {
				userId: userinfo.openid,
				avatar: userinfo.headimgurl,
				username: userinfo.nickname,
				sex: userinfo.sex,
				language: userinfo.language,
				city: userinfo.city,
				province: userinfo.province,
				country: userinfo.country,
				unionid: userinfo.unionid
			};

			userInfo = JSON.stringify(userInfo);
			localStorage.setItem('userInfo', userInfo);

			$location.url('/tab/account');

			var popup = $ionicPopup.show({
				title: '登录成功',
				template: '微信授权登录成功!'
			});
			
			$timeout(function() {
				$scope.isLogin = true;
				popup.close();
			}, 1600);
			
		});
	};
	$scope.sinaLogin = function (){
		Util.showAlert('无法登录', '目前版本仅支持微信登录');
	};

	$scope.submit = function(){
		/*
		$ionicPopup.alert({
			title:'提示',
			template:'请点击微信授权登录',
			okText:'ok'
		});
		*/
		if($scope.user.username && $scope.user.password){
			$http({
				method:'post',
				url:ResourceUrls.ApiBaseUrl + ResourceUrls.Login,
				params:{
					username:$scope.user.username,
					password:$scope.user.password
				}
			}).success(function(data){
				if (data.result === 'OK') {
					localStorage.setItem('userInfo', angular.toJson({
						sessionId:data.data.sessionId,
						userId:data.data.userId,
						username:$scope.user.username,
						password:$scope.user.password
						// avatar:data.data.avatar
					}));
					var popup = $ionicPopup.show({
						title: '登录成功',
						template: ''
					});
					$timeout(function() {
						popup.close();
						$location.url('/tab/account');
					}, 1200);
				}
				else {
					Util.showAlert('登录失败', '用户名或密码不正确！');
				}
			}).error(function(data){
				Util.showAlert('未知错误', '请检查网络或进行意见反馈！');
			});
		}
		else {
			Util.showAlert('无法登录', '请填写完整的登录信息！');
		}
	};

	//$rootScope.hideTabs = true;
})

.controller('RegisterCtrl', function($scope, $ionicHistory, Util) {

	$scope.goBack = Util.goBack;

	$scope.submit = function(){
		
	};
})

.controller('ForgetPasswordCtrl', function($scope, $ionicHistory, Util) {

	$scope.goBack = Util.goBack;

	$scope.submit = function(){
		
	};
})

.controller('AccountCtrl', function($rootScope, $scope, $ionicActionSheet, Storage, StatusBarColor, Util) {

	$scope.$on('$ionicView.enter', function() {

		Util.setStatusBarHexColor(StatusBarColor.ColorOfAccount);
		$rootScope.hideTabs = false;
		//console.log(localStorage);
		$scope.username = localStorage.getItem('userInfo') ? angular.fromJson(localStorage.getItem('userInfo')).username  : '点击登录';
		$scope.avatar = localStorage.getItem('userInfo') ? angular.fromJson(localStorage.getItem('userInfo')).avatar  : 'img/user.png';
		$scope.commentLen = Storage.getItems('myComments').length;
		$scope.articalLen = Storage.getItems('myArticles').length;
		$scope.collectLen = Storage.getItems('favorites').length;
	});

	$scope.settings = {
		enableFriends: true
	};

	$scope.avatar = 'img/user.png';

	// 亮度调节
	$scope.luminance = function(){
		$ionicActionSheet.show({
			
		});
	};

})

.controller('myArticlesCtrl', function($rootScope, $scope, $ionicHistory, Storage, $location, $ionicActionSheet, Util){

	$scope.goBack = Util.goBack;

	$scope.$on('$ionicView.enter', function() {
		$scope.articles = Storage.getItems('myArticles');
	});

	$scope.LookMyArticle = function(index){
		if($scope.articles[index].isPublish){
			$location.url('/tab/LookMyArticle/'+index);
		}else{
			$location.url('/tab/publish/'+index);
		}
	};

	$scope.onHold = function (index){
		// 长按弹窗删除
		var articles = Storage.getItems('myArticles');
		$ionicActionSheet.show({
			titleText: '操作',
			cancelText: '取消',
			buttons: [{
					text: '删除'
			}],
			buttonClicked: function() {
				if(articles[index].isPublish){
					Util.showAlert('已发表的文章不能删除');
				}else{
					articles.splice(index, 1);
					localStorage.setItem('myArticles', angular.toJson(articles));
					$scope.articles = Storage.getItems('myArticles');
				}
				return true;
			}
		});
	};

})

.controller('LookMyArticleCtrl', function($scope, $ionicHistory, $stateParams, Storage, Util){

	$scope.goBack = Util.goBack;

	$scope.article = {
		id:Storage.getItems('myArticles')[$stateParams.id].uid,
		title:Storage.getItems('myArticles')[$stateParams.id].title,
		content:Storage.getItems('myArticles')[$stateParams.id].content,
		file:Storage.getItems('myArticles')[$stateParams.id].file,
	};

	$scope.MyArticleShare = function (){
		Util.share($scope.article);
	};
})

.controller('publishCtrl', function($scope, $ionicHistory, $ionicPopup, $stateParams, $http, 
	$timeout, $cordovaCamera, $location,
	$ionicActionSheet, $cordovaImagePicker, 
	$cordovaFile, $cordovaFileTransfer, 
	Storage, Util, ResourceUrls, CameraOptions){

	$scope.goBack = Util.goBack;

	$scope.articles = {
		isPublish:true
	};
	if($stateParams.id != -1){
		$scope.articles = Storage.getItems('myArticles')[$stateParams.id];
	}

	if($scope.articles.isPublish){
		$scope.publish = {
			type:'1',
			title:'',
			content:''
		};
	}else{
		$scope.publish = {
			type:$scope.articles.cid,
			title:$scope.articles.title,
			content:$scope.articles.content
		};
	}

	$scope.isPublish = false;

	$scope.$on('$ionicView.leave', function(){
		if(!$scope.isPublish){
			if($scope.publish.title && $scope.publish.content){
				if($stateParams.id != -1){
					$scope.myArticles = Storage.getItems('myArticles');
					$scope.myArticles[$stateParams.id].isPublish = false;
					$scope.myArticles[$stateParams.id].cid = $scope.publish.type;
					$scope.myArticles[$stateParams.id].title = $scope.publish.title;
					$scope.myArticles[$stateParams.id].content = $scope.publish.content;
					localStorage.setItem('myArticles', angular.toJson($scope.myArticles));
				}else{
					Storage.putItem('myArticles', {
						cid: $scope.publish.type,
						title: $scope.publish.title,
						content: $scope.publish.content,
						file:$scope.fileName_f,
						isPublish:false
					});
				}
			}
		}
	});

	Util.getCategories(function(categories){
		$scope.types = categories;
	});

	$scope.fileUrl = [];
	$scope.fileName = [];
	$scope.fileName_f = [];

	$scope.article = function(){
		if($scope.publish.title!=='' && $scope.publish.content!==''){
			if(!localStorage.getItem('userInfo')){
				Util.showAlert('未登录', '请登陆后再发表文章！');
				return;
			}
			var popup = $ionicPopup.show({
				title: '正在发表...',
			});
			$http({
				method:'post',
				url:ResourceUrls.ApiBaseUrl + ResourceUrls.AddArticle,
				params:{
					uid:Storage.getItems('userInfo').userId,
					cid: $scope.publish.type,
					title: $scope.publish.title,
					content: $scope.publish.content,
				}
			}).success(function(data){
				if(data.result === 'OK'){
					// console.log(data);
					$scope.isPublish = true;
					if($scope.articles.isPublish){
						Storage.putItem('myArticles', {
							uid: $stateParams.userId,
							cid: $scope.publish.type,
							title: $scope.publish.title,
							content: $scope.publish.content,
							file:$scope.fileName_f,
							isPublish:$scope.isPublish
						});
					}else{
						$scope.myArticles = Storage.getItems('myArticles');
						$scope.myArticles[$stateParams.id].isPublish = true;
						$scope.myArticles[$stateParams.id].cid = $scope.publish.type;
						$scope.myArticles[$stateParams.id].title = $scope.publish.title;
						$scope.myArticles[$stateParams.id].content = $scope.publish.content;
						$scope.myArticles[$stateParams.id].file = $scope.fileName_f;
						localStorage.setItem('myArticles', angular.toJson($scope.myArticles));
					}
					popup.close();
					Util.showAlert('发布成功', '请等待审核！');
					$scope.goBack();
				}else if(data.result === 'ERR'){
					popup.close();
					Util.showAlert('发布失败', '服务器错误！');
				}
			}).error(function(){
				popup.close();
				Util.showAlert('发布出错', '未知错误！');
			});
		}
	};

	var options = CameraOptions;

	$scope.changeFile = function() {
		if(!localStorage.getItem('userInfo')){
			Util.showAlert('未登录', '请登录后再上传文件！');
			return;
		}
		$ionicActionSheet.show({
			buttons: [
				{ text: '图库' },
				{ text: '文件' }
			],
			titleText: '选择添加的文件类型',
			cancelText: '取消',
			cancel: function(){
				// console.log('取消');
			},
			buttonClicked: function(index) {
				if(index === 0){
					$cordovaImagePicker.getPictures({maximumImagesCount:5})
					.then(function (results) {
						for(var i = 0; i < results.length; i++){
							$scope.fileUrl.push(results[i]);
							$scope.fileName.push(results[i].substring(results[i].lastIndexOf('/')+1));
							$scope.fileName_f.push(results[i].substring(results[i].lastIndexOf('/')+1));
						}
					}, function (error) {
						Util.showAlert('选取失败', '');
					});
				}else if(index === 1){
					$cordovaCamera.getPicture(options)
					.then(function(imageURI) {
						$scope.fileUrl.push(imageURI);
						$scope.fileName.push(imageURI.substring(imageURI.lastIndexOf('/')+1));
						$scope.fileName_f.push(imageURI.substring(imageURI.lastIndexOf('/')+1));
					}, function(err) {
						Util.showAlert('选取失败', err);
					});
				}
			}
		});
	};

	$scope.formFileUrl = '';
	$scope.uploadNumber = 0;
	$scope.uploadFile = function (){
		$scope.popup = $ionicPopup.show({
			title: '上传中...',
			template: '请等待！'
		});
		$scope.failFile = [];
		$scope.upload();
	};

	$scope.failFile = [];

	$scope.upload = function () {
		var options = new FileUploadOptions();
		options.fileKey = "file";
		options.fileName = $scope.fileUrl[$scope.uploadNumber].substring($scope.fileUrl[$scope.uploadNumber].lastIndexOf('/') + 1);
		options.mimeType = Util.getMimeTypeOfFile(options.fileName);

		var uri = encodeURI(ResourceUrls.ApiBaseUrl + ResourceUrls.Upload);
		var ft = new FileTransfer();
		ft.upload($scope.fileUrl[$scope.uploadNumber], uri, function(data){
			var response = angular.fromJson(data.response);
			if (response.result === 'OK') {
				$scope.publish.content += '(' + response.data.fileUrl + ')';
				if ($scope.uploadNumber == $scope.fileUrl.length - 1) {
					$scope.popup.close();
					$scope.popup = $ionicPopup.show({
						title: '上传完成！',
					});
					$timeout(function (){
						$scope.popup.close();
					}, 1000);
					$scope.uploadNumber = 0;
					$scope.fileUrl = [];
					$scope.fileName = [];
					return;
				}
				$scope.uploadNumber++;
				$scope.upload();
			}
			else {
				$scope.failFile.push($scope.fileName[$scope.uploadNumber]);
				if($scope.uploadNumber == $scope.fileUrl.length - 1){
					$scope.popup.close();
					Util.showAlert('失败', '上传失败！');
					$scope.uploadNumber = 0;
					$scope.fileUrl = [];
					$scope.fileName = [];
					return;
				}
				$scope.uploadNumber++;
				$scope.upload();
			}
		}, function(data){
			Util.showAlert('上传失败', '请检查网络或进行意见反馈！');
		}, options);
	};
})

.controller('myCommentsCtrl', function($rootScope, $scope, $ionicHistory, Storage, Util){

	$scope.goBack = Util.goBack;

	$scope.getMyCommits = function() {
		return Storage.getItems('myComments');
	};

})

.controller('myCollectsCtrl', function($rootScope, $scope, $ionicHistory, Storage, Util){

	$scope.goBack = Util.goBack;

	$scope.favorites = Storage.getItems('favorites');

	$scope.getMyCollects = function() {
		return $scope.favorites;
	};

	$scope.data = {
		showDelete: false
	};

	$scope.onItemDelete = function(item) {
		$scope.favorites.splice($scope.favorites.indexOf(item), 1);
		localStorage.setItem('favorites', angular.toJson($scope.favorites));
	};

})

.controller('myContactCtrl', function($rootScope, $scope, $ionicHistory, Util){
	$scope.goBack = Util.goBack;
})

.controller('feedbackCtrl', function($scope, $timeout, $ionicPopup, $http, Util, ResourceUrls){
	$scope.goBack = Util.goBack;

	$scope.publishSuggestion = function(){
		var popup = $ionicPopup.show({
			title: '正在提交...',
		});
		$http({
			method:'post',
			url: ResourceUrls.ApiBaseUrl + ResourceUrls.AddArticle,
			params:{
				uid: Storage.getItems('userInfo').userId? Storage.getItems('userInfo').userId : -1,
				// cid:-1,
				title: '意见反馈',
				content: $scope.feedback.content + '(' + $scope.feedback.call + ')',
			}
		}).success(function(data){
			popup.close();
			popup = $ionicPopup.show({
				title: '提交成功！',
			});
			$timeout(function (){
				popup.close();
				$scope.goBack();
			}, 1000);
		}).error(function(){
			popup.close();
			popup = $ionicPopup.show({
				title: '提交失败！',
			});
			$timeout(function (){
				popup.close();
			}, 1000);
		});
	};

	$scope.feedback = {
		content:'',
		call:'',
	};

})

.controller('settingCtrl', function($rootScope, $scope, $timeout, $ionicPopup, $ionicActionSheet,Util){
	$scope.goBack = Util.goBack;

	var s = parseInt(localStorage.getItem('fontSize') ? angular.fromJson(localStorage.getItem('fontSize')).fz : '20');
	if(s === 14) $scope.fontSize = '超小';
	if(s === 16) $scope.fontSize = '小';
	if(s === 20) $scope.fontSize = '中';
	if(s === 24) $scope.fontSize = '大';
	if(s === 28) $scope.fontSize = '超大';

	$scope.$on('$ionicView.enter', function() {
		$rootScope.hideTabs = false;
		if (localStorage.getItem('cacheNum')) {
			$scope.cache = parseFloat(localStorage.getItem('cacheNum')) + (new Number(Math.random().toFixed(2)).valueOf());
		}
		else {
			$scope.cache = parseFloat(Math.random() * 5000 + 100)/ 1024;
		}
		localStorage.setItem('cacheNum', $scope.cache.toString());
	});

	$scope.pushNews = localStorage.getItem('pushNews') ? (localStorage.getItem('pushNews')=='true'?true : false) : true;
	$scope.changePush = function (){
		$scope.pushNews = !$scope.pushNews;
		localStorage.setItem('pushNews', $scope.pushNews ? 'true' : 'false');
	};
	$scope.wifiImg = localStorage.getItem('wifiImg') ? (localStorage.getItem('wifiImg')=='true'?true : false) : true;
	$scope.changeWifi = function (){
		$scope.wifiImg = !$scope.wifiImg;
		localStorage.setItem('wifiImg', $scope.wifiImg ? 'true' : 'false');
	};

	$scope.changeFontSize = function(){
		$ionicActionSheet.show({
			buttons: [
				{ text: '正文超小号' },
				{ text: '正文小号' },
				{ text: '正文中号' },
				{ text: '正文大号' },
				{ text: '正文超大号' },
			],
			titleText: '请选择正文字号大小',
			cancelText: '取消',
			cancel: function(){
				// console.log('取消');
			},
			buttonClicked: function(index) {
				if(index === 0){
					$scope.fontSize = '超小';
					localStorage.setItem('fontSize', angular.toJson({'fz':'14px'}));
				}else if(index === 1){
					$scope.fontSize = '小';
					localStorage.setItem('fontSize', angular.toJson({'fz':'16px'}));
				}else if(index === 2){
					$scope.fontSize = '中';
					localStorage.setItem('fontSize', angular.toJson({'fz':'20px'}));
				}else if(index === 3){
					$scope.fontSize = '大';
					localStorage.setItem('fontSize', angular.toJson({'fz':'24px'}));
				}else if(index === 4){
					$scope.fontSize = '超大';
					localStorage.setItem('fontSize', angular.toJson({'fz':'28px'}));
				}
				return true;
			}
		});
	};

	$scope.clearCache = function(){
		var popup = $ionicPopup.show({
			title: '正在清理...',
		});
		$timeout(function (){
			popup.close();
			popup = $ionicPopup.show({
				title: '清理完成！',
			});
			$timeout(function(){
				popup.close();
				$scope.cache = 0;
				localStorage.removeItem('cacheNum');
			}, 1000);
		}, 2000);
		
	};

	$scope.version = function(){
		var popup = $ionicPopup.show({
			title: '正在检查...',
		});
		$timeout(function (){
			popup.close();
			popup = $ionicPopup.show({
				title: '已是最新版本！',
			});
			$timeout(function(){
				popup.close();
			}, 1000);
		}, 2000);
	};
})

.controller('aboutCtrl', function($rootScope, $scope, Util){

	$scope.goBack = Util.goBack;

	$rootScope.hideTabs = true;
});