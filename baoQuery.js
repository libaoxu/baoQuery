/**
 * baoQuery.js 微型的jq的库的理解
 * @author libaoxu 2015-11-20
 */
(function (window, undefined) {

/**
 * 这里是一个方法, 就像jQuery 一样
 * @param  {多种} selector [选择器]
 * @return {指向baoQuery的构造函数的对象}
 *         [baoQuery.fn.init()下的对象, 跟baoQuery享有共同的prototype,
 *         这样baoQuery(selector) 即$(sel) 就可以用baoQuery.prototype... 下面的方法了, 不需要写new]
 */
function baoQuery ( selector ) {

	return new baoQuery.fn.init( selector );

}
//对象的引用
baoQuery.fn = baoQuery.prototype;
baoQuery.fn = {
	constructor: baoQuery,
	init: function (vArg) {
		//所有元素, 存放一个数组里
		this.elements = [];
		//选择器类型判断, jq里是sizzle, 这里就简单模拟一下
		switch (typeof vArg) {
			case 'function':
				baoQuery.bindEvent(window, 'load', vArg);
				break;
			case 'string':

				switch( vArg.charAt(0) ) {
					case '#':
						// id选择器
						this.elements.push(document.getElementById(vArg.substring(1)));
						break;
					case '.':
						// class 选择器
						this.elements = baoQuery.getByClass(document, vArg.substring(1));
						break;
					default :
						// 标签
						this.elements = baoQuery.makeArray(document.getElementsByTagName(vArg));
						break;
				}

				break;
			case 'object':
				if ( vArg.constructor === Array ) { //如果是真数组直接赋值
					this.elements = vArg;
				} else {
					//其他类型的object 就放到元素集合里
					this.elements.push( vArg );
				}

				break;
		}
	},
	css: function (attr, target) {
		var i, j;
		if (arguments.length == 2) { //设置
			// 两个参数就设置值
			for (i = 0; i < this.elements.length; i++) {
				this.elements[i].style[attr] = target;
			}
			//链式调用
			return this;

		} else if ( arguments.length == 1 ) {
			if ( typeof attr == 'object' ) {
				//如果是 {} 类型, 需要循环赋值, 实际还需要考虑key 对应的value为函数情况 ,这里暂不分析
				for (j in attr) {
					if (attr.hasOwnProperty(j)) {
						for (i = 0; i < this.elements.length; i++) {
							if (typeof attr[j] === 'function') {
								this.elements[i].style[j] = attr[j].call(this.elements[i], i);
							} else {
								this.elements[i].style[j] = attr[j];
							}
						}
					}
				}
				return this;
			}

			return baoQuery.getStyle( this.elements[0], attr );
		}


	},
	attr: function (attr, value) {
		var i , j;
		if ( arguments.length == 2 ) {
			//两个参数, 直接赋值
			for ( i = 0; i < this.elements.length; i++ ) {
				this.elements[i].setAttribute(attr, value);
			}
			//链式调用
			return this;
		} else if ( arguments.length == 1 ) {
			if ( typeof attr == 'object' ) {
				for ( i = 0; i < this.elements.length; i++) {
					for (j in attr) {
						if (attr.hasOwnProperty(j)) {
							if ( typeof attr[j] === 'function' ) {//如果value是个函数, 则做下兼容
								this.elements[i].setAttribute(j, attr[j].call(this.elements[i], i));
							} else {
								this.elements[i].setAttribute(j, attr[j]);
							}
						}
					}
				}
				return this;
			}
			return this.elements[0].getAttribute(attr);

		}
	},
	html: function () {
		//有一个参数是设置
		if (arguments[0]) {
			for (var i = 0; i < this.elements.length; i++) {
				this.elements[i].innerHTML = arguments[0];
			}
			return this;
		}
		//其他情况就是获取了
		return this.elements[0].innerHTML;
	},
	on: function ( events, fn ) {//绑定事件
		for (var i = 0; i < this.elements.length; i++) {
			//每个元素都绑定
			baoQuery.bindEvent( this.elements[i], events, fn );
		}
		//链式调用
		return this;
	},
	off: function (events, fn) {//解除绑定
		for (var i = 0; i < this.elements.length; i++) {
			baoQuery.removeEvent ( this.elements[i], events, fn );
		}
		//链式
		return this;
	},
	trigger: function ( events ) {//主动触发事件, 包括自定义事件
		for (var i = 0; i < this.elements.length; i++) {
			baoQuery.fireEvent( this.elements[i], events );
		}
		return this;
	},
	click: function (fn) {
		//其他所有事件, 本质上还是调用 on 事件
		this.on('click', fn);
		return this;
	},
	mouseover: function (fn) {
		this.on('mouseover', fn);
		return this;
	},
	mouseout: function (fn) {
		this.on('mouseout', fn);
		return this;
	},
	hover: function (fnOver, fnOut) {
		this.mouseover(fnOver);
		this.mouseout(fnOut);
		return this;
	},
	eq: function (num) {//选择第几个
		return $(this.elements[num]);
	},
	index: function () {

		var elems,
			args = arguments[0];

		if ( args ) {
			//支持index(参数), 该参数包含字符串 或是 baoQuery元素 或是dom对象, 二次选择
			if (typeof args == 'string') {
				elems = baoQuery(args).elements;
			} else if ( args instanceof baoQuery.fn.init ) {
				elems = args.elements;
			} else if ( args.nodeType == 1 ||  args[0].nodeType == 1 ) {
				elems = args;
			}

		} else {
			//默认找第一个元素的索引
			elems = this.elements[0].parentNode.children;
		}

		for (var i = 0; i < elems.length; i++) {
			if (elems[i] == this.elements[0]) {
				return i;
			}
		}
		//啥都没找到 返回-1
		return -1;

	},
	find: function (sel) { //寻找元素
		var arr = [];
		if (sel.charAt() == '.') { //class
			for (var i = 0, iLen = this.elements.length; i < iLen; i++) {
				arr = arr.concat( baoQuery.getByClass( this.elements[i], sel.substring(1)) );
			}
		} else {//标签情况
			for (var j = 0, jLen = this.elements.length; j < jLen; j++) {
				arr = arr.concat( baoQuery.makeArray( this.elements[j].getElementsByTagName(sel) ) );
			}
		}
		//返回找到的元素
		return baoQuery(arr);

	},
};

baoQuery.fn.init.prototype = baoQuery.fn;

//绑定事件, 支持自定义事件
baoQuery.bindEvent = function (obj, events, fn) {

	//obj.listeners想象着是一个店铺GXG(json: 可以包括各种类型, key)
	obj.listeners = obj.listeners || {};
	//obj.listeners[events] 就是这个这个店铺GXG的分类, 比如: 衬衫(数组), 休闲裤(数组), 腰带(数组)
	obj.listeners[events] = obj.listeners[events] || [];
	//每个分类下, 衬衫有很多件, 放到数组里, 休闲裤很多件,放到数组里
	obj.listeners[events].push(fn);

	//这个是兼容 jq事件中 return false 就可以阻止冒泡 和 默认事件
	fn.bindFn = function (ev) {
		ev = ev || window.event;
		//事件执行之后返回值如果为false则...阻止冒泡和默认事件
		if ( fn.call(obj) === false ) {
			ev.stopPropagation();
			ev.preventDefault();
			return false;
		}
	};

	//dom元素
	if ( obj.nodeType == 1 || obj == window || obj == document) {
		//做一些 ie 的兼容
		obj.addEventListener ? obj.addEventListener(events, fn.bindFn, false) : obj.attachEvent('on' + events, fn.bindFn);
	}

};
//触发事件及自定义事件
baoQuery.fireEvent = function (obj, events) {
	var stack = obj.listeners[events] || [], eventFn;
	//将把绑定的自定义事件从堆栈中提取出来, 说白了就是循环一个数组
	for (var i = 0; i < stack.length; i++) {
		eventFn = stack[i];
		//不关心evnetFn 如何实现的, 只需要判断返回结果为是否为false, 如果是false 就停止出栈
		if (eventFn.apply(this, arguments) === false) {
			return false;
		}
	}
};

//删除绑定事件
baoQuery.removeEvent = function (obj, events, fn) {
	//如果有给定解绑定事件函数, 则直接移除
	if ( fn && fn.bindFn) {
		obj.removeEventListener ? obj.removeEventListener(events, fn.bindFn, false) : obj.detachEvent('on' + events, fn.bindFn);
	} else {
		//得到所有绑定事件的 所有函数(一个数组的集合)
		var stack = obj.listeners[events] || [], eventFn;
		for (var i = 0; i < stack.length; i++) {
			eventFn = stack[i];
			//一次循环接触绑定
			obj.removeEventListener ? obj.removeEventListener(events, eventFn.bindFn, false) : obj.detachEvent('on' + events, eventFn.bindFn);
		}
	}
};

//根据类名进行选择, 初级的,
baoQuery.getByClass = function (oParent, sClass) {
	var arr = [],
		elems = ( oParent || document ).getElementsByTagName('*');

	for (var i = 0, iLen = elems.length; i < iLen; i++) {
		if ( elems[i].className.indexOf( sClass ) !== -1 ) {
			arr.push( elems[i] );
		}
	}

	return arr;
};
//把类数组变为数组
baoQuery.makeArray = function (leiArr) {
	var newArr = [];

	for (var i = 0, iLen = leiArr.length; i < iLen; i++) {
		newArr.push( leiArr[i] );
	}

	return newArr;
};
//得到css或style样式
baoQuery.getStyle = function (obj, attr) {
	return getComputedStyle? getComputedStyle(obj, false)[attr] : obj.currentStyle[attr];
};


if ( typeof window !== 'undefined' ) {
	window.$ = window.baoQuery = baoQuery;
}


})(window );
