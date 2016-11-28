angular.module('app.controllers', [])

.controller('HomeCtrl', function($scope, $timeout, $ionicScrollDelegate, $ionicSlideBoxDelegate,
    Model, Util) {

    //active slideIndex
    $scope.slideIndex = 0;

    //constructor CategoryVM
    function CategoryVM() {
        this.hasMore = false;
        this.items = [];
        this.pageCount = 0;
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
            for (var i in categories) {
                var vm = new CategoryVM(categories[i].id);
                categories[i].vm = vm;
            }
            $scope.categories = categories;
        }, function(err) {
            $scope.error = err;
        });
    }

    //load Articles for the category specified by categoryIndex
    $scope.loadArticles = function(categoryIndex) {
        var categoryId = $scope.categories[categoryIndex].id;
        var pageCount = $scope.categories[categoryIndex].vm.pageCount;
        var param = { c: categoryId, p: pageCount };
        Model.list("article", param, function(items) {
            for (var i in items) {
                $scope.categories[categoryIndex].vm.items.push(items[i]);
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

    $scope.$on('$stateChangeSuccess', function() {});

    $scope.$on('$ionicView.enter', function(e) {
        $timeout(function() {
            $scope.outerSlideChanged($scope.slideIndex);
        }, 500);
    });

    //active the outer slide by index when click top tab
    $scope.activeSlide = function(index) {
        $ionicSlideBoxDelegate.$getByHandle('outer-slider').slide(index);
    };

    //fired when outer slide Changed to index
    $scope.outerSlideChanged = function(index) {
        $ionicScrollDelegate.$getByHandle('tabs-scroll').scrollTo(index * 40);
        //$scope.slideIndex = index;    
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
    $ionicSlideBoxDelegate.enableSlide(true);
})

.controller('DetailCtrl', function($scope, $stateParams, $ionicHistory,
    $ionicActionSheet, $ionicPopup, $ionicPopover, $timeout, $sce, $state,
    Storage, Model, Util, share, goBack) {

    $scope.stateCurrentName = ($state.current.name === 'tab.myDetail') ? false : true;
    $scope.template = 'default';
    $scope.slideIndex = 0;
    $scope.showSubTitle = true;
    $scope.showFooterBar = true;
    $scope.fullSubTitle = false;
    $scope.myComment = "";

    function createPopover() {
        var popover = $ionicPopover.fromTemplateUrl('templates/popover-comment.html', {
            scope: $scope
        });
        popover.then(function(po) {
            $scope.popover = po;
            //$scope.initialize({focusFirstInput: true});
        });
    }

    $scope.$on('$ionicView.enter', function() {
        Model.detail('article', { id: $stateParams.id }, function(detail) {
            //detail.content = $sce.trustAsHtml(detail.content);
            $scope.detail = detail;
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

    $scope.goBack = goBack;

    $scope.closePopover = function() {
        $scope.popover.hide();
    };

    $scope.commit = function(myComment) {
        Storage.putItem('myComments', {
            id: $scope.detail.id,
            title: $scope.detail.title,
            text: myComment
        });

        $scope.detail.comments.unshift({
            // user:'我[匿名]',
            user:localStorage.getItem('userInfo') ? angular.fromJson(localStorage.getItem('userInfo')).username : '我[匿名]', 
            portrait_url: 'img/user.png',
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

    $scope.ArticleShare = function (id, title){
        share(id, title);
    };

})

.controller('ServicesCtrl', function($scope, _, Util) {

    Util.getServices(function(items) {

        $scope.groups = _.groupBy(items, function(item){
            return item.serviceType.name;
        });
        console.log($scope.groups);
    });
})

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

.controller('LoginCtrl', function($rootScope, $scope, $stateParams, $ionicHistory, $http, $location, $ionicPopup, $timeout, showAlert, Storage, goBack) {
    //$scope.userId = $stateParams.userId;

    $scope.goBack = goBack;

    $scope.user = {
        username:localStorage.getItem('userInfo') ? angular.fromJson(localStorage.getItem('userInfo')).username : '',
        password:localStorage.getItem('userInfo') ? angular.fromJson(localStorage.getItem('userInfo')).password : ''
    };

    $scope.submit = function(){
        if($scope.user.username && $scope.user.password){
            $http({
                method:'post',
                url:'http://60.220.238.2:8080/media/api/login.do',
                params:{
                    username:$scope.user.username,
                    password:$scope.user.password
                }
            }).success(function(data){
                console.log(data);
                if(data.result === 'OK'){
                    localStorage.setItem('userInfo', angular.toJson({
                        sessionId:data.data.sessionId,
                        userId:data.data.userId,
                        username:$scope.user.username,
                        password:$scope.user.password
                        // avatar:data.data.avatar
                    }));
                    console.log(data.data.sessionId);
                    var popup = $ionicPopup.show({
                        title: '登录成功',
                        template: ''
                    });
                    $timeout(function() {
                        popup.close();
                        $location.url('/tab/account');
                    }, 1200);
                }else{
                    showAlert('登录失败', '用户名或密码不正确！');
                }
            }).error(function(data){
                console.log(data);
                showAlert('未知错误', '请检查网络或进行意见反馈！');
            });
        }else{
            showAlert('无法登录', '请填写完整的登录信息！');
        }
    };

    $rootScope.hideTabs = true;
})

.controller('RegisterCtrl', function($scope, $ionicHistory, goBack) {

    $scope.goBack = goBack;

    $scope.submit = function(){
        
    };
})

.controller('ForgetPasswordCtrl', function($scope, $ionicHistory, goBack) {

    $scope.goBack = goBack;

    $scope.submit = function(){
        
    };
})

.controller('AccountCtrl', function($rootScope, $scope, $ionicActionSheet, Storage) {

    $scope.$on('$ionicView.enter', function() {
        $rootScope.hideTabs = false;
        $scope.sessionId = localStorage.getItem('userInfo') ? angular.fromJson(localStorage.getItem('userInfo')).username  : '登录 | 注册';
    });

    $scope.settings = {
        enableFriends: true
    };

    $scope.avatar = 'img/user.png';

    $scope.luminance = function(){
        $ionicActionSheet.show({
            
        });
    };
})

.controller('myArticlesCtrl', function($rootScope, $scope, $ionicHistory, Storage, $location, goBack){

    $scope.goBack = goBack;

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

})

.controller('LookMyArticleCtrl', function($scope, $ionicHistory, $stateParams, Storage, share, goBack){

    $scope.goBack = goBack;

    $scope.article = {
        id:Storage.getItems('myArticles')[$stateParams.id].uid,
        title:Storage.getItems('myArticles')[$stateParams.id].title,
        content:Storage.getItems('myArticles')[$stateParams.id].content,
        file:Storage.getItems('myArticles')[$stateParams.id].file,
    };

    $scope.MyArticleShare = function (){
        share($scope.article.id, $scope.article.title);
    };
})

.controller('publishCtrl', function($scope, $ionicHistory, $ionicPopup, $stateParams, $http, $timeout, $cordovaCamera, $location,
    $ionicActionSheet, $cordovaImagePicker, $cordovaFile, $cordovaFileTransfer, Storage, Util, showAlert, goBack){

    $scope.goBack = goBack;

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
                showAlert('未登录', '请登陆后再发表文章！');
                return;
            }
            var popup = $ionicPopup.show({
                title: '正在发表...',
            });
            $http({
                method:'post',
                url:'http://60.220.238.2:8080/media/api/addArticle.do',
                params:{
                    uid:Storage.getItems('userInfo').userId,
                    cid: $scope.publish.type,
                    title: $scope.publish.title,
                    content: $scope.publish.content,
                }
            }).success(function(data){
                if(data.result === 'OK'){
                    console.log(data);
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
                    showAlert('发布成功', '请等待审核！');
                    $scope.goBack();
                }else if(data.result === 'ERR'){
                    popup.close();
                    showAlert('发布失败', '服务器错误！');
                }
            }).error(function(){
                popup.close();
                showAlert('发布出错', '未知错误！');
            });
        }
    };

    var options = {
        quality: 100,//相片质量0-100
        destinationType: 1,//返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
        sourceType: 2,//从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
        allowEdit: true,//在选择之前允许修改截图
        encodingType:1,//保存的图片格式： JPEG = 0, PNG = 1
        targetWidth: 200,//照片宽度
        targetHeight: 200,//照片高度
        mediaType:2,//可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
        cameraDirection:0,//枪后摄像头类型：Back= 0,Front-facing = 1
        saveToPhotoAlbum: true//保存进手机相册
    };

    $scope.changeFile = function(){
        if(!localStorage.getItem('userInfo')){
            showAlert('未登录', '请登录后再上传文件！');
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
                console.log('取消');
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
                        showAlert('选取失败', '');
                    });
                }else if(index === 1){
                    $cordovaCamera.getPicture(options)
                    .then(function(imageURI) {
                        $scope.fileUrl.push(imageURI);
                        $scope.fileName.push(imageURI.substring(imageURI.lastIndexOf('/')+1));
                        $scope.fileName_f.push(imageURI.substring(imageURI.lastIndexOf('/')+1));
                    }, function(err) {
                        showAlert('选取失败', err);
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

    // $scope.uploadInput = document.getElementById('uploadInput');

    // $scope.upload = function(){
    //     // $scope.formFileUrl = $scope.fileUrl[$scope.uploadNumber];
    //     $scope.uploadInput.value = $scope.fileUrl[$scope.uploadNumber];
    //     $scope.formData = new FormData(document.getElementById('uploadForm'));
    //     $http({
    //         url:'http://60.220.238.2:8080/media/api/upload.do',
    //         method:'POST',
    //         data:$scope.formData,
    //         headers:{
    //             'Content-Type': undefined
    //         },
    //     }).success(function(succ){
    //         showAlert(succ.result, '');
    //         if(succ.result === 'OK'){
    //             if($scope.uploadNumber == $scope.fileUrl.length-1){
    //                 $scope.popup.close();
    //                 showAlert('上传完成', $scope.failFile.length!==0 ? '失败的文件：'+$scope.failFile : '');
    //                 $scope.uploadNumber = 0;
    //                 $scope.fileUrl = [];
    //             }else{
    //                 $scope.uploadNumber++;
    //                 $scope.upload();
    //             }
    //         }else{
    //             $scope.failFile.push($scope.fileName[$scope.uploadNumber]);
    //             if($scope.uploadNumber == $scope.fileUrl.length-1){
    //                 $scope.popup.close();
    //                 showAlert('失败', '上传失败！');
    //             }
    //             $scope.uploadNumber++;
    //             $scope.upload();
    //         }
    //     }).error(function(err){
    //         showAlert('上传失败', '请检查网络或进行意见反馈！');
    //     });
    // };

    $scope.upload = function () {
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = $scope.fileUrl[$scope.uploadNumber].substring($scope.fileUrl[$scope.uploadNumber].lastIndexOf('/') + 1);
        var houzhui = options.fileName.substring(options.fileName.lastIndexOf('.')+1);
        if(houzhui == 'jpg'){
            options.mimeType = "image/jpeg";
        }else if(houzhui == 'wav'){
            options.mimeType = 'audio/x-wav';
        }else if(houzhui == 'mp3'){
            options.mimeType = 'audio/mpeg';
        }else if(houzhui == 'mp4'){
            options.mimeType = 'video/mpeg';
        }else{
            options.mimeType = 'application/octet-stream';
        }
        var uri = encodeURI("http://60.220.238.2:8080/media/api/upload.do");
        // options.chunkedMode = false;
        // options.params = {
        //     file:$scope.fileUrl[$scope.uploadNumber]
        // };
        // options.headers = {
        //     'Content-Type': undefined
        // };
        // options.httpMethod = 'POST';
        var ft = new FileTransfer();
        ft.upload($scope.fileUrl[$scope.uploadNumber], uri, function(data){
            var response = angular.fromJson(data.response);
            if(response.result === 'OK'){
                $scope.publish.content += '('+response.data.fileUrl+')';
                if($scope.uploadNumber == $scope.fileUrl.length-1){
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
            }else{
                $scope.failFile.push($scope.fileName[$scope.uploadNumber]);
                if($scope.uploadNumber == $scope.fileUrl.length-1){
                    $scope.popup.close();
                    showAlert('失败', '上传失败！');
                    $scope.uploadNumber = 0;
                    $scope.fileUrl = [];
                    $scope.fileName = [];
                    return;
                }
                $scope.uploadNumber++;
                $scope.upload();
            }
        }, function(data){
            showAlert('上传失败', '请检查网络或进行意见反馈！');
        }, options);
    };
})

.controller('myCommentsCtrl', function($rootScope, $scope, $ionicHistory, Storage, goBack){

    $scope.goBack = goBack;

    $scope.getMyCommits = function() {
        return Storage.getItems('myComments');
    };

})

.controller('myCollectsCtrl', function($rootScope, $scope, $ionicHistory, Storage, goBack){

    $scope.goBack = goBack;

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

.controller('feedbackCtrl', function($scope, $timeout, $ionicPopup, $http, goBack){
    $scope.goBack = goBack;

    $scope.publishSuggestion = function(){
        var popup = $ionicPopup.show({
            title: '正在提交...',
        });
        $http({
            method:'post',
            url:'http://60.220.238.2:8080/media/api/addArticle.do',
            params:{
                uid:-1,
                cid:-1,
                title: '意见反馈',
                content: $scope.feedback.content + '(' + $scope.feedback.call + ')',
            }
        }).success(function(){
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

.controller('settingCtrl', function($rootScope, $scope, $timeout, $ionicPopup, $ionicActionSheet, goBack){
    $scope.goBack = goBack;

    $scope.fontSize = '中';

    $scope.cache = parseInt(Math.random()*10000+100)/1024;

    $scope.$on('$ionicView.enter', function() {
        $rootScope.hideTabs = false;
    });

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
                console.log('取消');
            },
            buttonClicked: function(index) {
                if(index === 0){
                    $scope.fontSize = '超小';
                    localStorage.setItem('fontSize', angular.toJson({'fz':'10px'}));
                }else if(index === 1){
                    $scope.fontSize = '小';
                    localStorage.setItem('fontSize', angular.toJson({'fz':'12px'}));
                }else if(index === 2){
                    $scope.fontSize = '中';
                    localStorage.setItem('fontSize', angular.toJson({'fz':'14px'}));
                }else if(index === 3){
                    $scope.fontSize = '大';
                    localStorage.setItem('fontSize', angular.toJson({'fz':'16px'}));
                }else if(index === 4){
                    $scope.fontSize = '超大';
                    localStorage.setItem('fontSize', angular.toJson({'fz':'18px'}));
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

.controller('aboutCtrl', function($rootScope, $scope, goBack){

    $scope.goBack = goBack;

    $rootScope.hideTabs = true;
})

.filter('timeHommization', function(){
    return function(e){
        var t = formatDate(new Date(),"yyyy-MM-dd");
        if(t == e){
            return '今天';
        }else if( new Date(t).getTime() - new Date(e).getTime() < 2*24*60*60*1000){
            return '昨天';
        }else if( new Date(t).getTime() - new Date(e).getTime() < 3*24*60*60*1000){
            return '前天';
        }else{
            return e;
        }
        function formatDate(date,format){
            var paddNum = function(num){
              num += "";
              return num.replace(/^(\d)$/,"0$1");
            };
            var cfg = {
                yyyy : date.getFullYear(),
                yy : date.getFullYear().toString().substring(2),
                M  : date.getMonth() + 1 ,
                MM : paddNum(date.getMonth() + 1),
                d  : date.getDate(),
                dd : paddNum(date.getDate()),
                hh : date.getHours(),
                mm : date.getMinutes(),
                ss : date.getSeconds()
            };
            // format || (format = "yyyy-MM-dd hh:mm:ss");
            return format.replace(/([a-z])(\1)*/ig,function(m){return cfg[m];});
        }
    };
});