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

.factory('Util', function($ionicPopup, $ionicActionSheet, $ionicHistory, $timeout, Model, MimeTypes) {

    var categories;
    var templates;
    var services;

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
                console.log('showAlert');
            });
        },

        share: function(id, title) {
            var sheet = $ionicActionSheet.show({
                titleText: '分享',
                cancelText: '取消',
                buttons: [{
                    text: '分享到微信朋友圈'
                }, {
                    text: '发送给微信好友'
                }],
                buttonClicked: function(index) {
                    var popup = $ionicPopup.show({
                        title: '分享',
                        template: '对不起，次版本尚未提供分享功能'
                    });
                    $timeout(function() {
                        popup.close();
                    }, 3000);
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
})