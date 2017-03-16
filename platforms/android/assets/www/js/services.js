angular.module('app.services', ['ngResource', 'app.constants'])

.factory('Storage', function() {

	var storeCache = {};

	return {
		getItems: function(storeName) {
			if (storeCache[storeName]) {
				return storeCache[storeName];
			}
			storeCache[storeName] = localStorage.getItem(storeName);
			if (storeCache[storeName]) {
				storeCache[storeName] = angular.fromJson(storeCache[storeName]);
			}
			else {
				storeCache[storeName] = [];
			}
			return storeCache[storeName];
		},

		putItem: function(storeName, item) {
			var items = this.getItems(storeName);
			items.push(item);
			localStorage.setItem(storeName, angular.toJson(items));
		},
		
	};
})

.factory('Model', ['$resource', 'ResourceUrls', function($resource, ResourceUrls) {

	var paramConfig = {
		reqChar: '?',
		operator: '=',
		separator: '&',
		suffix: ''
	};
	
	
	function getData(url, onOK, onErr) {
		if (typeof(onErr) != 'function') {
			onErr = function(err) {};
		}
		$resource(url).get(function(res) {
			if (res.result == 'OK') {
				onOK(res.data);
			} else {
				onErr(res.data);
			}
		}, function(err){
			onErr(err.data);
		});
	}

	function paramsToQueryStr(params) {
		var qs = paramConfig.reqChar;
		for (var p in params) {
			qs += p + paramConfig.operator + params[p] + paramConfig.separator;
		}
		return qs;
	}

	return {
		list: function(clazz, params, onOK, onErr) {
			var qs = paramsToQueryStr(params);
			var listUrl = ResourceUrls.ApiBaseUrl + '/' + ResourceUrls[clazz + 'List'];
			getData(listUrl + qs + paramConfig.suffix, onOK, onErr);
		},

		detail: function(clazz, params, onOK, onErr) {
			var qs = paramsToQueryStr(params);
			var detailUrl = ResourceUrls.ApiBaseUrl + '/' + ResourceUrls[clazz + 'Detail'];
			getData(detailUrl + qs + paramConfig.suffix, onOK, onErr);
		}
	};
}])

.factory('Util', function($http, $ionicLoading, $ionicPopup, $ionicActionSheet, $ionicHistory, $timeout, Model, MimeTypes) {

	var categories;
	var templates;
	var services;
	var wechatIsInstall = function (succ, fail){
		Wechat.isInstalled(succ, fail);
	};
	var WechatShare = function (scene, detail){
		//取出第一张图片的URl
		var thumbUrl = detail.content.match(/http[^\"'>]+.(jpg|JPG|jpeg|JPEG|gif|GIF|png|PNG)/i);
		wechatIsInstall(function (installed) {
			if(!installed){
				$ionicPopup.alert({
					title:'无法分享',
					template:'请先安装微信',
					okText:'我知道了'
				});
				return;
			}
			Wechat.share({
				message:{
					title:detail.title,
					description:'分享自直播潞安',
					thumb:thumbUrl?thumbUrl[0]:'',
					media:{
						type:Wechat.Type.WEBPAGE,
						webpageUrl:'https://jyfiaueng.github.io/FindColor/'
					}
				},
				scene: scene
			}, function () {
				$ionicPopup.alert({
					title:'分享成功',
					template:'感谢您的支持',
					okText:'关闭'
				});
			}, function (reason) {

			});
		}, function (reason) {
			var popup = $ionicPopup.show({
				title: '无法分享',
				template: reason
			});
			$timeout(function() {
				popup.close();
			}, 3000);
		});
	};

	var wechatInfo = {
		appid:'wx77a7c47a36036e8d',
		secret:'dde417de3f1aeeb9a2ab4844f0cad808',
		grant_type:'authorization_code'
	};
	var access_tokenBaseUtl = 'https://api.weixin.qq.com/sns/oauth2/access_token?';
	var userinfoBaseUrl = 'https://api.weixin.qq.com/sns/userinfo?';
	var wechatLogin = function (callback){
		wechatIsInstall(function (installed){
			if(!installed){
				$ionicPopup.alert({
					title:'无法登陆',
					template:'请先安装微信',
					okText:'我知道了'
				});
				return;
			}
			var scope = "snsapi_userinfo",
				state = "_" + (+new Date());
			Wechat.auth(scope, state, function (response) {
				var code = response.code;
				var url = access_tokenBaseUtl+
						'appid='+wechatInfo.appid+
						'&secret='+wechatInfo.secret+
						'&code='+code+
						'&grant_type='+wechatInfo.grant_type;
				$http({
					method:'get',
					url:url
				}).success(function (data){
					if(!data.access_token){
						$ionicPopup.alert({
							title:'登录失败',
							template:'',
							okText:'ok'
						});
						return;
					}
					$http({
						method:'get',
						url:userinfoBaseUrl+'access_token='+data.access_token+'&openid='+data.openid
					}).success(function (info){
						callback(info);
					}).error(function (data){
						$ionicPopup.alert({
							title:'失败',
							template:'获取用户信息出错',
							okText:'ok'
						});
					});
				}).error(function (data){
					$ionicPopup.alert({
						title:'登录失败',
						template:'',
						okText:'ok'
					});
				});
			}, function (reason) {
				$ionicPopup.alert({
					title:'',
					template:reason,
					okText:'ok'
				});
			});
		}, function (reason){
			var popup = $ionicPopup.show({
				title: '无法登录',
				template: reason
			});
			$timeout(function() {
				popup.close();
			}, 3000);
		});
	};

	return {
		getCategories: function(onLoad, onErr) {
			if (categories) {
				onLoad(categories);
			} else {
				Model.list('Category', {}, function(list) {
					categories = list;
					onLoad(categories);
				}, onErr);
			}
		},

		getDetailTemplate: function(categoryId, callback) {
			if (templates) {
				callback(templates[categoryId]);
			} 
			else {
				this.getCategories(function(list) {
					templates = {};
					for (var i in list) {
						templates[list[i].id] = list[i].detailTemplate;
					}
					callback(templates[categoryId]);
				}, function() {
					callback('default');
				});
			}
		},

		getServices : function(onLoad, onErr) {
			if (services) {
				onLoad(services);
			}
			else {
				Model.list('Service', {}, function(list) {
					services = list;
					onLoad(services);
				}, onErr);
			}
		},

		showAlert: function(title, tmp){
			var alertPopup = $ionicPopup.alert({
				title: title,
				template: tmp,
				okType:'button-assertive'
			});

			alertPopup.then(function(res) {
				// console.log('showAlert');
			});
		},

		WechatShare: WechatShare,

		wechatLogin:wechatLogin,

		share: function(detail) {
			var self = this;
			var sheet = $ionicActionSheet.show({
				titleText: '分享',
				cancelText: '取消',
				buttons: [{
					text: '分享到微信朋友圈'
				},{
					text: '分享到微信好友'
				}],
				buttonClicked: function(index) {
					if(index === 0){
						WechatShare(Wechat.Scene.TIMELINE, detail);
					}
					if(index === 1){
						WechatShare(Wechat.Scene.SESSION, detail);
					}
				}
			});
		},

		goBack: function(){
			$ionicHistory.goBack();
		},

		setStatusBarHexColor: function(hexColorString) {
			if (window.StatusBar) {
				window.StatusBar.backgroundColorByHexString(hexColorString);
			}
		},

		getMimeTypeOfFile: function (filename) {
			var suffix = filename.substring(filename.lastIndexOf('.') + 1);
			return MimeTypes[suffix]? MimeTypes[suffix]:'application/octet-stream';
		}
	};
});