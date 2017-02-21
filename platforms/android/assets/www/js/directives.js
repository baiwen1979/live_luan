angular.module('app.directives', [])
.directive('hideTabs', function($rootScope){
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            // console.log('hide-tabs');
            scope.$on('$ionicView.beforeEnter', function() {
                scope.$watch(attributes.hideTabs, function(value){
                    $rootScope.hideTabs = value;
                });
            });

            scope.$on('$ionicView.beforeLeave', function(){
                $rootScope.hideTabs = false;
            });
        }
    };
})

.directive('hideEle', function (){
    return {
        restrict:'AC',
        link:function(scope, element, attributes){
            if(!scope.stateCurrentName){
                element.css({
                    visibility:'hidden'
                });
            }else{
                element.css({
                    visibility:'visible'
                });
            }
        }
    };
})

.directive('changeFontSize', function(){
    return {
        restrict:'AC',
        link:function(scope, element, attributes){
            element.css({
                fontSize:angular.fromJson(localStorage.getItem('fontSize')).fz,
                lineHeight:(parseInt(angular.fromJson(localStorage.getItem('fontSize')).fz)*1.6)+'px'
            });
        }
    };
});