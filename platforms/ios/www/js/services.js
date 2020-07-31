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

.factory('Util', function($http, $resource, $ionicLoading, $ionicPopup, 
	$ionicActionSheet, $ionicHistory, $timeout, 
	$cordovaAppVersion, $cordovaFileTransfer, $cordovaFileOpener2,
	Model, MimeTypes, ResourceUrls, WechatLoginAuthInfo, AppOptions) {

	var categories;
	var templates;
	var services;
	var wechatIsInstall = function (succ, fail) {
		if (window.Wechat) {
			Wechat.isInstalled(succ, fail);
		}
		else {
			$ionicPopup.alert({
				title: '无法分享',
				template: '您的平台不支持微信分享',
				okText: '好吧'
			});
		}
	};
	var WechatShare = function (scene, detail){
		
		var thumbUrl = ResourceUrls.WwwBaseUrl + 'img/player.png';
		//取出第一张图片的URl
		if (detail.content) {
		    thumbUrl = detail.content.match(/http[^\"'>]+.(jpg|JPG|jpeg|JPEG|gif|GIF|png|PNG)/i)[0];
		}
		wechatIsInstall(function (installed) {
			if(!installed){
				$ionicPopup.alert({
					title: '无法分享',
					template: '您的手机没有安装微信',
					okText: '我知道了'
				});
				return;
			}
			$ionicLoading.show({template: '请稍候...', duration:4000});

			Wechat.share({
				message: {
					title: detail.title,
					description: '分享自直播潞安',
					thumb: thumbUrl,
					media: {
						type: Wechat.Type.WEBPAGE,
						webpageUrl: ResourceUrls.WwwBaseUrl + ResourceUrls.WechatShareDetail + '/' + detail.id
					}
				},
				scene: scene
			}, function () {
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: '分享成功',
					template: '感谢您的支持',
					okText: '关闭'
				});
			}, function (reason) {
				$ionicLoading.hide();
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

	var wechatLogin = function (callback){
		wechatIsInstall(function (installed){
			if(!installed){
				$ionicPopup.alert({
					title:'无法登陆',
					template:'您的手机没有安装微信',
					okText:'我知道了'
				});
				return;
			}
			var scope = "snsapi_userinfo",state = "_" + new Date();

			$ionicLoading.show({template: '请稍候...'});

			Wechat.auth(scope, state, function (response) {
				var code = response.code;
				var url = WechatLoginAuthInfo.AccessTokenBaseUrl +
						'?appid=' + WechatLoginAuthInfo.AppId +
						'&secret=' + WechatLoginAuthInfo.Secret +
						'&code=' + code +
						'&grant_type=' + WechatLoginAuthInfo.GrantType;
				$http({
					method:'get',
					url:url
				}).success(function (data){
					$ionicLoading.hide();
					if(!data.access_token){
						$ionicPopup.alert({
							title: '登录失败',
							template: '未获得访问令牌',
							okText: '好吧'
						});
						return;
					}
					$http({
						method: 'get',
						url: WechatLoginAuthInfo.UserInfoBaseUrl + 
						'?access_token=' + data.access_token + 
						'&openid=' + data.openid
					})
					.success(function (info) {
						$ionicLoading.hide();
						callback(info);
					})
					.error(function (data){
						$ionicLoading.hide();
						$ionicPopup.alert({
							title: '登录失败',
							template: '获取用户信息出错',
							okText: '好吧'
						});
					});
				}).error(function (data){
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: '登录失败',
						template: '原因：' + data,
						okText: '好吧'
					});
				});
			}, function (reason) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					title:'登录失败',
					template: '原因：' + reason,
					okText:'ok'
				});
			});
		}, function (reason){
			$ionicLoading.hide();
			var popup = $ionicPopup.show({
				title: '登录失败',
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

		wechatLogin: wechatLogin,

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

		voteArticle: function(id) {
			var voteUrl = ResourceUrls.ApiBaseUrl + ResourceUrls.AddGood;
			voteUrl += '?aid=' + id;
			$resource(voteUrl).get(function(res) {
				if (res.result == 'ok') {
					var articleVotes = localStorage.getItem('articleVotes');
					if (articleVotes) {
						articleVotes = angular.fromJson(articleVotes);
					}
					else {
						articleVotes = [];
					}
					articleVotes.push(id);
					localStorage.setItem('articleVotes', angular.toJson(articleVotes)); 
				}
			});
		},

		addShareTimes: function(id) {
			var actionUrl = ResourceUrls.ApiBaseUrl + ResourceUrls.AddShareTimes;
			actionUrl += '?aid=' + id;
			$resource(actionUrl).get(function(res) {
				if (res && res.result == 'ok') {
					console.log('文章：' + id + '被分享！');
				}
			});
		},

		goBack: function(){
			$ionicHistory.goBack();
		},

		getVersion: function() {
			var res = $resource(ResourceUrls.ApiBaseUrl + ResourceUrls.GetNewVersion);
			return res.get().$promise;
		},

		getAds: function() {
			var res = $resource(ResourceUrls.ApiBaseUrl + ResourceUrls.Ads);
			var promise = res.get().$promise;
			return promise.then(function(res) {
				return res.data;
			});
		},

		getAppId: function() {
			var res = $resource(ResourceUrls.ApiBaseUrl + ResourceUrls.GetAppId);
			var promise = res.get().$promise;
			return promise.then(function(res) {
				return res.appId;
			});
		},

		showUpdateConfirm: function(version) {
			var me = this;
			var confirmPopup = $ionicPopup.confirm({
				title: '新版本发布，是否升级？',
				template: version.description,
				cancelText: '取消',
				okText: '现在升级'
			});

			confirmPopup.then(function(res){
				if (res) {
					$ionicLoading.show({
						template: '正在下载更新：0%'
					});

					var fileName = AppOptions.ApkFileNamePrefix + '-' + version.appVersion + '.apk';
					var url = ResourceUrls.DownloadBaseUrl + fileName;
					var targetPath = cordova.file.externalDataDirectory + fileName;
					var trustHosts = true;
                	var options = {};
                	$cordovaFileTransfer.download(url,targetPath,options,trustHosts)
                	.then(function(result) {
                    	$cordovaFileOpener2.open(targetPath,'application/vnd.android.package-archive')
                    	.then(function(){
                    		//success
                    	}, function(){
                    		//error
                    		me.showAlert('打开文件失败','无法打开文件');
                    	});
                    		
                    	$ionicLoading.hide();

                	}, function(err) {
                    	me.showAlert('下载失败', err);
                	}, function(progress) {
                    	$timeout(function() {
	                        var downloadProgress = (progress.loaded / progress.total) * 100;
	                        $ionicLoading.show({
	                            template: "正在下载更新：" + Math.floor(downloadProgress) + "%"
	                        });
	                        if (downloadProgress > 99) {
	                            $ionicLoading.hide();
	                        }
                        })
                    });
                }
			});
		},

		checkUpdate: function() {
			var me = this;
			this.getVersion().then(function(data) {
				$cordovaAppVersion.getVersionNumber().then(function(version){
					if (version < data.appVersion) {
						me.showUpdateConfirm(data);
					}
				});
			});
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