// Generated by Haxe 3.4.7
(function ($hx_exports) { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var ATween = $hx_exports["ATween"] = function(target) {
	this._onRepeatCallback = null;
	this._onCompleteParams = null;
	this._onCompleteCallback = null;
	this._onCancelCallback = null;
	this._onUpdateCallback = null;
	this._onStartCallbackFired = false;
	this._isStarted = false;
	this._onStartCallback = null;
	this._easing = null;
	this._retain = false;
	this._pause = false;
	this._isCompleted = false;
	this._yoyo = false;
	this._repeatTimes = 0;
	this._durationMs = 1;
	this._delayMs = 0;
	this._startMs = 0;
	this._updateSteps = 0;
	this._repeatDelayMs = 0;
	this._repeatSteps = 0;
	this._repeatRefs = 0;
	this._repeatNextStartMs = 0;
	this._data = null;
	this._convertor = null;
	this._attachment = null;
	this._initedTarget = false;
	this.elapsedPercent = 0;
	this.elapsedMs = 0;
	this._target = target;
};
ATween._add = function(ins) {
	ATween._instances.push(ins);
};
ATween._del = function(ins) {
	var i = ATween._instances.indexOf(ins);
	if(i != -1) {
		ATween._instances.splice(i,1);
	}
};
ATween.updateAll = function(ms) {
	if(ATween._instances.length == 0) {
		return;
	}
	if(ATween.stop == true) {
		return;
	}
	var instances = ATween._instances.concat([]);
	var _g = 0;
	while(_g < instances.length) {
		var ins = instances[_g];
		++_g;
		if(ins._pause == false && ins.update(ms) == false) {
			ATween._del(ins);
		}
	}
};
ATween.killAll = function(completed) {
	if(completed == null) {
		completed = false;
	}
	var instances = ATween._instances.concat([]);
	var _g1 = 0;
	var _g = instances.length;
	while(_g1 < _g) {
		var i = _g1++;
		instances[i].cancel(completed);
	}
};
ATween.killTweens = function(targetOrAttachment,completed) {
	if(completed == null) {
		completed = false;
	}
	var instance = ATween._instances.concat([]);
	var num = 0;
	var _g1 = 0;
	var _g = instance.length;
	while(_g1 < _g) {
		var i = _g1++;
		var ins = instance[i];
		if(ins._target == targetOrAttachment || ins._attachment == targetOrAttachment) {
			ins.cancel(completed);
			++num;
		}
	}
};
ATween.isTweening = function(targetOrAttachment) {
	var _g1 = 0;
	var _g = ATween._instances.length;
	while(_g1 < _g) {
		var i = _g1++;
		var ins = ATween._instances[i];
		if(ins._target == targetOrAttachment || ins._attachment == targetOrAttachment) {
			return true;
		}
	}
	return false;
};
ATween.checkInstalled = function() {
	if(!ATween._isInstalled) {
		ATween._isInstalled = true;
		if(window != null && ($_=window,$bind($_,$_.requestAnimationFrame)) != null) {
			var lastTime = 0;
			var onFrame = function(now) {
				var ms = now - lastTime;
				lastTime = now;
				ATween.updateAll(ms);
				window.requestAnimationFrame(onFrame);
			};
			lastTime = window.performance.now();
			onFrame(lastTime);
		} else {
			window.console.log("You need to manually call \"ATween.updateAll\" function update all tweens");
		}
	}
};
ATween.newTween = function(target,durationMs,delayMs) {
	if(delayMs == null) {
		delayMs = 0;
	}
	ATween.checkInstalled();
	var t = new ATween(target);
	t._durationMs = durationMs;
	t._delayMs = delayMs;
	return t;
};
ATween.newOnce = function(intervalMs,onCompleteCallback,onCompleteParams) {
	ATween.checkInstalled();
	var t = new ATween(null);
	t._delayMs = intervalMs;
	t.onComplete(onCompleteCallback,onCompleteParams);
	t.start();
	return t;
};
ATween.newTimer = function(intervalMs,times,onRepeatCallback,onCompleteCallback,onCompleteParams) {
	var t = new ATween(null);
	t._delayMs = intervalMs;
	t.repeat(times);
	t.onRepeat(onRepeatCallback);
	t.onComplete(onCompleteCallback,onCompleteParams);
	t.start();
	return t;
};
ATween.prototype = {
	start: function() {
		if(this._isStarted) {
			return this;
		}
		this._isStarted = true;
		ATween._add(this);
		this.elapsedMs = 0;
		this._isCompleted = false;
		this._onStartCallbackFired = false;
		this._repeatNextStartMs = 0;
		this._startMs = this._delayMs;
		if(this._delayMs == 0 && this._target != null) {
			this.initTarget();
		}
		return this;
	}
	,initTarget: function() {
		var fields = Reflect.fields(this._dstVals);
		var _g = 0;
		while(_g < fields.length) {
			var property = fields[_g];
			++_g;
			var curVal;
			if(this._target.get_tween_prop != null) {
				curVal = this._target.get_tween_prop(property);
			} else {
				curVal = this._target[property];
			}
			var dstVal = this._dstVals[property];
			if(typeof(dstVal) != "number") {
				throw new js__$Boot_HaxeError("Unknown dest value:" + dstVal);
			}
			curVal *= 1.0;
			if(this._srcVals == null) {
				this._srcVals = { };
			}
			this._srcVals[property] = curVal;
			if(this._revVals == null) {
				this._revVals = { };
			}
			this._revVals[property] = curVal;
		}
		this._initedTarget = true;
	}
	,updateTarget: function(percent,ignoreCallback) {
		if(ignoreCallback == null) {
			ignoreCallback = false;
		}
		if(this._target == null) {
			return;
		}
		var ePercent = percent;
		var fnE = this._easing;
		if(fnE != null) {
			ePercent = fnE(percent);
		}
		var fields = Reflect.fields(this._srcVals);
		var _g = 0;
		while(_g < fields.length) {
			var property = fields[_g];
			++_g;
			var curVal = this._srcVals[property];
			if(curVal == null) {
				continue;
			}
			var startVal = curVal;
			var endVal = this._dstVals[property];
			var newVal;
			if(percent >= 1) {
				newVal = endVal;
			} else {
				newVal = startVal + (endVal - startVal) * ePercent;
			}
			if(this._target.set_tween_prop != null) {
				this._target.set_tween_prop(property,newVal);
			} else {
				this._target[property] = newVal;
			}
			if(this._attachment != null) {
				var syncVal;
				var fnC = this._convertor;
				if(fnC != null) {
					syncVal = fnC(newVal,startVal,endVal,ePercent,property);
				} else {
					syncVal = Math.floor(newVal) + "px";
				}
				var e = this._attachment;
				e.style.setProperty(property,syncVal);
			}
		}
		if(ignoreCallback == false && this._onUpdateCallback != null) {
			this._updateSteps++;
			var cb = this._onUpdateCallback;
			cb.call(this,percent,this._updateSteps);
		}
	}
	,update: function(ms) {
		this.elapsedMs += ms;
		if(this._repeatNextStartMs != 0) {
			if(this.elapsedMs >= this._repeatNextStartMs) {
				this._repeatNextStartMs = 0;
				if(this._yoyo == false) {
					this.updateTarget(0);
				}
			}
		}
		if(this.elapsedMs < this._startMs) {
			return true;
		}
		if(this._target != null && this._initedTarget == false) {
			this.initTarget();
		}
		if(this._onStartCallbackFired == false) {
			this._onStartCallbackFired = true;
			if(this._onStartCallback != null) {
				var cbS = this._onStartCallback;
				cbS.call(this);
			}
		}
		this.elapsedPercent = (this.elapsedMs - this._startMs) / this._durationMs;
		if(this.elapsedPercent > 1) {
			this.elapsedPercent = 1;
		}
		this.updateTarget(this.elapsedPercent);
		if(this.elapsedPercent == 1) {
			if(this._repeatRefs != 0) {
				this._repeatSteps++;
				this._repeatRefs--;
				if(this._target != null) {
					var fields = Reflect.fields(this._revVals);
					var _g = 0;
					while(_g < fields.length) {
						var property = fields[_g];
						++_g;
						var valueB = this._dstVals[property];
						if(this._yoyo == true) {
							var tmp = this._revVals[property];
							this._revVals[property] = valueB;
							this._dstVals[property] = tmp;
						}
						this._srcVals[property] = this._revVals[property];
					}
				}
				this._repeatNextStartMs = this.elapsedMs + this._repeatDelayMs;
				this._startMs = this._repeatNextStartMs + this._delayMs;
				if(this._onRepeatCallback != null) {
					var cbR = this._onRepeatCallback;
					var rzl = cbR.call(this,this._repeatSteps);
					if(rzl == false) {
						this._repeatRefs = 0;
					}
				}
			}
			if(this._repeatRefs == 0) {
				this._isCompleted = true;
				if(this._onCompleteCallback != null) {
					var cbC = this._onCompleteCallback;
					cbC.apply(this,this._onCompleteParams);
				}
				return false;
			}
			return true;
		}
		return true;
	}
	,cancel: function(complete) {
		if(complete == null) {
			complete = false;
		}
		if(this._isCompleted == true || this._retain == true) {
			return this;
		}
		this._repeatRefs = 0;
		if(complete == true) {
			this.update(2147483647);
		}
		ATween._del(this);
		this._isCompleted = true;
		if(this._onCancelCallback != null) {
			var cb = this._onCancelCallback;
			cb.call(this);
		}
		return this;
	}
	,to: function(properties) {
		this._dstVals = properties;
		return this;
	}
	,attach: function(obj,convert) {
		var t;
		var value = obj;
		if(((value instanceof HTMLElement) ? value : null) != null) {
			t = obj;
		} else {
			t = window.document.getElementById(obj);
		}
		this._attachment = t;
		this._convertor = convert;
		return this;
	}
	,data: function(v) {
		this._data = v;
		return this;
	}
	,repeat: function(times,yoyo,delayMs) {
		if(delayMs == null) {
			delayMs = 0;
		}
		if(yoyo == null) {
			yoyo = false;
		}
		this._yoyo = yoyo;
		this._repeatTimes = times;
		this._repeatRefs = times;
		this._repeatDelayMs = delayMs;
		return this;
	}
	,callRepeat: function() {
		var cb = this._onRepeatCallback;
		var rzl = cb.call(this, 0);
		if(rzl == false) {
			this._retain = false;
			this.cancel();
		}
		return this;
	}
	,easing: function(v) {
		this._easing = v;
		return this;
	}
	,retain: function() {
		this._retain = true;
		return this;
	}
	,release: function() {
		this._retain = false;
		return this;
	}
	,isRetain: function() {
		return this._retain;
	}
	,setPause: function(v) {
		this._pause = v;
	}
	,getPause: function() {
		return this._pause;
	}
	,getRepeatTimes: function() {
		return this._repeatTimes;
	}
	,getTarget: function() {
		return this._target;
	}
	,getAttachment: function() {
		return this._attachment;
	}
	,getData: function() {
		return this._data;
	}
	,onStart: function(callback) {
		this._onStartCallback = callback;
		return this;
	}
	,onUpdate: function(callback) {
		this._onUpdateCallback = callback;
		return this;
	}
	,onComplete: function(callback,params) {
		this._onCompleteCallback = callback;
		this._onCompleteParams = params;
		if(this._onCompleteParams != null) {
			this._onCompleteParams = this._onCompleteParams.concat([]);
		}
		return this;
	}
	,onCancel: function(callback) {
		this._onCancelCallback = callback;
		return this;
	}
	,onRepeat: function(callback) {
		this._onRepeatCallback = callback;
		return this;
	}
	,toAlpha: function(v) {
		return this.to({ alpha : v});
	}
	,toX: function(v) {
		return this.to({ x : v});
	}
	,toY: function(v) {
		return this.to({ y : v});
	}
	,toXY: function(a,b) {
		return this.to({ x : a, y : b});
	}
};
var Reflect = function() { };
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) {
			a.push(f);
		}
		}
	}
	return a;
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) {
		Error.captureStackTrace(this,js__$Boot_HaxeError);
	}
};
js__$Boot_HaxeError.wrap = function(val) {
	if((val instanceof Error)) {
		return val;
	} else {
		return new js__$Boot_HaxeError(val);
	}
};
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
});
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
ATween.stop = false;
ATween._instances = [];
ATween._isInstalled = false;
})(typeof exports != "undefined" ? exports : typeof window != "undefined" ? window : typeof self != "undefined" ? self : this);
