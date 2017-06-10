angular.module('app.constants', [])
//服务器资源地址
.constant('ResourceUrls', {
	ApiBaseUrl: 'http://live.chinaluan.com:8080/media/api/',
	WwwBaseUrl: 'http://live.chinaluan.com:8080/media/www/',
	DownloadBaseUrl: 'http://live.chinaluan.com:8080/media/download/',
	CategoryList: 'categories.do',
    ArticleList: 'newsJsonList.do',
    ArticleDetail: 'newsJsonDetailView.do',
    ServiceList:'services.do',
    Login: 'login.do',
    AddComment: 'addComment.do',
    AddArticle: 'addArticle.do',
    Upload: 'upload.do',
    WechatShareDetail: 'index.html#/tab/detail',
    AddGood: 'addGood.do',
    AddShareTimes: 'addShareTimes.do',
    GetNewVersion: 'getNewVersion.do',
    GetAppId: 'registerApp.do',
    Ads: 'ads.do'
})
//微信登录授权信息
.constant('WechatLoginAuthInfo', {
	AppId: 'wx77a7c47a36036e8d',
	Secret: 'dde417de3f1aeeb9a2ab4844f0cad808',
	GrantType: 'authorization_code',
	AccessTokenBaseUrl: 'https://api.weixin.qq.com/sns/oauth2/access_token',
	UserInfoBaseUrl : 'https://api.weixin.qq.com/sns/userinfo'
})
//摄像头选项
.constant('CameraOptions', {
	quality: 100,
	destinationType: 1, 
	sourceType: 2,
	allowEdit: true,
	encodingType: 0,
	targetWidth: 200,
	targetHeight: 200,
	mediaType: 2,
	cameraDirection: 0,
	saveToPhotoAlbum: true
})
//支持的MIME类型
.constant('MimeTypes', {
	jpg: 'image/jpeg',
	png: 'image/png',
	wav: 'audio/x-wav',
	mp3: 'audio/mpeg',
	mp4: 'video/mp4'
})
//首页、直播和我的页面对应的状态栏颜色
.constant('StatusBarColor',{
	ColorOfHome: '#DDDDDD',
	ColorOfServices: '#6CAFDF',
    ColorOfAccount: '#14C1F3'
})
//APP选项
.constant('AppOptions', {
	ApkFileNamePrefix: 'luanNews'
});
