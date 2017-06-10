angular.module('app.filters', [])

.filter('percentage', function(){

	return function (n, m) {
		if (n.toString().length < 4) {
			return n * 100.0 / m;
		}
		else {
			return n;
		}
	}
})

.filter('timeHommization', function() {

	function formatDate(date,format) {
		var paddNum = function(num) {
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
		return format.replace(/([a-z])(\1)*/ig, function(m){return cfg[m];});
	}

	return function(e){
		var t = formatDate(new Date(),"yyyy-MM-dd");
		var msOfDay = 24 * 60 * 60 * 1000;
		if(t == e) {
			return '今天';
		}
		else if (new Date(t).getTime() - new Date(e).getTime() < 2 * msOfDay) {
			return '昨天';
		}
		
		else if( new Date(t).getTime() - new Date(e).getTime() < 3 * msOfDay){
			return '前天';
		}
		
		else{
			return e.substring(5);
		}
		
	};
});