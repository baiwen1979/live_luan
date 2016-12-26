angular.module('app.constants', [])
//服务器资源地址
.constant('ResourceUrls', {
	ApiBaseUrl: 'http://60.220.238.2:8080/media/api/',
	CategoryList: 'categories.do',
    ArticleList: 'newsJsonList.do',
    ArticleDetail: 'newsJsonDetailView.do',
    ServiceList:'services.do',
    Login: 'login.do',
    AddComment:  'addComment.do',
    AddArticle: 'addArticle.do',
    Upload: 'upload.do'
})
//摄像头选项
.constant('CameraOptions', {
	quality: 100,  //相片质量0-100
	destinationType: 1, //类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
	sourceType: 2, //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
	allowEdit: true, //在选择之前允许修改截图
	encodingType: 1,//保存的图片格式： JPEG = 0, PNG = 1
	targetWidth: 200,//照片宽度
	targetHeight: 200, //照片高度
	mediaType: 2, //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
	cameraDirection: 0, //枪后摄像头类型：Back= 0,Front-facing = 1
	saveToPhotoAlbum: true //保存进手机相册
})
.constant('MimeTypes', {
	jpg: 'image/jpeg',
	wav: 'audio/x-wav',
	mp3: 'audio/mpeg',
	mp4: 'video/mpeg'
})
//首页、服务和我的页面对应的状态栏颜色
.constant('StatusBarColor',{
	ColorOfHome: '#DDDDDD',
	ColorOfServices: '#FF9999',
    ColorOfAccount: '#14C1F3'
});