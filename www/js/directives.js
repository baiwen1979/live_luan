angular.module('app.directives', [])
.directive('hideTabs', function($rootScope){
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
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

.directive('cssFontSize', function(){
    return {
        restrict:'AC',
        link:function(scope, element, attributes){
            var fontSize = '20px';
            if (localStorage.getItem('fontSize')) {
                fontSize = angular.fromJson(localStorage.getItem('fontSize')).fz;
            }
            element.css({
                fontSize: fontSize,
                lineHeight: '1.8em'
            });
        }
    };
});