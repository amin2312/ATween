/**
 * Copyright (c) 2022 amin2312
 * Version 1.0.0
 * MIT License
 *
 * ATween - a a easy, fast and tiny tween libary.
 */
@:expose
class ATween {
	/**
	 * 实例集.
	 */
	public static var _instances:Array<ATimer> = new Array<ATimer>();

	public static var stop:Bool = false;

	/**
	 * 添加缓动.
	 */
	public static function _add(ins:ATimer):Void {
		_instances.push(ins);
	}

	/**
	 * 删除缓动.
	 */
	public static function _del(ins:ATimer):Void {
		var i = _instances.indexOf(ins);
		if (i != -1) {
			_instances.splice(i, 1);
		}
	}

	/**
	 * 更新定时器根据参数.
	 */
	public static function updateAll(frameMs:Float):Void {
		if (_instances.length == 0) {
			return;
		}
		if (stop == true) {
			return;
		}
		var instances:Array<ATimer> = _instances.concat([]);
		for (ins in instances) {
			if (ins._pause == false && ins.update(frameMs) == false) {
				ATimer._del(ins);
			}
		}
	}

	/**
	 * 删除全部.
	 */
	public static function killAll(completed:Bool):Void {
		var instances:Array<ATimer> = _instances.concat([]);
		for (i in 0...instances.length) {
			instances[i].cancel(completed);
		}
	}

	/**
	 * 删除对象.
	 */
	public static function killTweens(target:Dynamic, completed:Bool = false):Void {
		var instance:Array<ATimer> = _instances.concat([]);
		for (i in 0...instance.length) {
			var ins = instance[i];
			if (ins._target == target) {
				ins.cancel(completed);
			}
		}
	}

	/**
	 * 对象是否缓动中.
	 */
	public static function isTweening(target:Dynamic):Bool {
		for (i in 0..._instances.length) {
			var ins = _instances[i];
			if (ins._target == target) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 参数1.
	 */
	private var _target:Dynamic;

	private var _valuesA:Dynamic;
	private var _valuesB:Dynamic;
	private var _valuesR:Dynamic;

	/**
	 * 参数2.
	**/
	private var _durationMs:Float = 1;

	private var _delayMs:Float = 0;
	private var _repeatTimes0:Int = 0;
	private var _repeatTimes1:Int = 0;
	private var _repeatDelayMs:Float = 0;
	private var _yoyo = false;

	/**
	 * 参数3.
	**/
	private var _easingFunction:Dynamic = ATween_Easing_Linear.None;

	private var _interpolationFunction:Array<Dynamic>->Float->Float = ATween_Interpolation.Linear;

	/**
	 * 参数4.
	**/
	private var _onStartCallback:Dynamic = null;

	private var _onUpdateCallback:Dynamic = null;
	private var _onCancelCallback:Dynamic = null;
	private var _onCompleteCallback:Dynamic = null;
	private var _onCompleteParams:Array<Dynamic> = null;
	private var _onRepeatCallback:Int->Bool = null;

	/**
	 * 属性.
	**/
	private var _retain = false; // 强引用, 不被Kill掉

	private var _isCompleted = false;
	private var _repeatOverMs:Float = 0;
	private var _startMs:Float = 0;
	private var _repeatedTimes:Int = 0;
	private var _onStartCallbackFired:Bool = false;
	private var _initedTarget:Bool = false;
	private var _pause:Bool = false;

	public var ElapsedMs:Float = 0;
	public var ElapsedPercent:Float = 0;

	/**
	 * 构造函数.
	 */
	public function new(target:Dynamic) {
		_target = target;
	}

	public static function newTween(target:Dynamic, durationMs:Float, delayMs:Float = 0):ATimer {
		var t = new ATimer(target);
		t._durationMs = durationMs;
		t._delayMs = delayMs;
		return t;
	}

	public static function newTimeout(delayMs:Float, onCompleteCallback:Dynamic, onCompleteParams:Array<Dynamic> = null):ATimer {
		var t = new ATimer(null);
		t._delayMs = delayMs;
		t.onComplete(onCompleteCallback, onCompleteParams);
		t.start();
		return t;
	}

	/**
	 * 重复定时器.
	 * return false:中止
	 * return true:继续
	**/
	public static function newRepeat(delayMs:Float, repeatTimes:Int, onRepeatCallback:Int->Bool, onCompleteCallback:Dynamic = null,
			onCompleteParams:Array<Dynamic> = null):ATimer {
		var t = new ATimer(null);
		t._delayMs = delayMs;
		t.repeat(repeatTimes);
		t.onRepeat(onRepeatCallback);
		t.onComplete(onCompleteCallback, onCompleteParams);
		t.start();
		return t;
	}

	/**
	 * 开始.
	 */
	public function start(time:Float = 0):ATimer {
		ATimer._add(this);

		_isCompleted = false;
		_onStartCallbackFired = false;
		_repeatOverMs = 0;
		_startMs = _delayMs;
		ElapsedMs = 0;
		// 更新对象属性
		if (_delayMs == 0 && _target != null) {
			initTarget();
		}
		return this;
	}

	private function initTarget():Void {
		var fields = Reflect.fields(_valuesB);
		for (property in fields) {
			var valueNow:Dynamic = (_target.get_attr == null ? untyped _target[property] : _target.get_attr(property));
			// 连接数组属性
			var valueB:Dynamic = untyped _valuesB[property];
			if (Std.instance(valueB, Array) != null) {
				if (valueB.length == 0) {
					continue;
				}
				untyped _valuesB[property] = [valueNow].concat(valueB);
			}
			// 空属性
			if (valueNow == null) {
				continue;
			}
			// 保存开始值
			if (Std.instance(valueNow, Array) == null) {
				valueNow *= 1.0; // 确定是数值
			}
			// [创建A]
			if (_valuesA == null) {
				_valuesA = {};
			}
			untyped _valuesA[property] = valueNow;
			// [创建R]
			if (_valuesR == null) {
				_valuesR = {};
			}
			if (untyped valueNow != null) {
				untyped _valuesR[property] = valueNow;
			} else {
				untyped _valuesR[property] = 0;
			}
		}
		_initedTarget = true;
	}

	/**
	 * 更新对象.
	**/
	private function updateTarget(percent:Float, ignoreCallback:Bool = false):Void {
		if (_target == null) {
			return;
		}
		var fn:Float->Float = _easingFunction;
		var newValue:Float = fn(percent);
		var fields = Reflect.fields(_valuesA);
		var property:String;
		for (property in fields) {
			var valueA:Dynamic = untyped _valuesA[property];
			if (valueA == null) {
				continue;
			}
			var start = valueA;
			var end = untyped _valuesB[property];
			if (Std.is(end, Array) == true) {
				if (_target.set_attr == null) {
					untyped _target[property] = _interpolationFunction(end, newValue);
				} else {
					_target.set_attr(property, _interpolationFunction(end, newValue));
				}
			} else if (Std.is(end, Float) == true) {
				var endFloat:Float = untyped end;
				var finValue:Float;
				if (percent >= 1) {
					finValue = endFloat;
				} else {
					finValue = start + (endFloat - start) * newValue;
				}
				if (_target.set_attr == null) {
					untyped _target[property] = finValue;
				} else {
					_target.set_attr(property, finValue);
				}
			}
		}
		// 更新回调
		if (ignoreCallback == false && _onUpdateCallback != null) {
			var fn = _onUpdateCallback;
			Reflect.callMethod(null, fn, [percent, newValue]);
		}
	}

	/**
	 * [更新]
	 */
	public function update(frameMs:Float):Bool {
		ElapsedMs += frameMs;
		if (_repeatOverMs != 0) {
			if (ElapsedMs >= _repeatOverMs) {
				_repeatOverMs = 0;
				if (_yoyo == false) {
					updateTarget(0);
				}
			}
		}
		if (ElapsedMs < _startMs) {
			return true;
		}
		// 初始化TARGET属性
		if (_target != null && _initedTarget == false) {
			initTarget();
		}
		// 1a.开始回调
		if (_onStartCallbackFired == false) {
			_onStartCallbackFired = true;
			if (_onStartCallback != null) {
				var fn = _onStartCallback;
				Reflect.callMethod(null, fn, null);
			}
		}
		// 1b.已运行比率
		ElapsedPercent = (ElapsedMs - _startMs) / _durationMs;
		ElapsedPercent = ElapsedPercent > 1 ? 1 : ElapsedPercent;
		// 2.更新对象属性
		updateTarget(ElapsedPercent);
		// 3.结束处理
		if (ElapsedPercent == 1) {
			if (_repeatTimes1 > 0) {
				_repeatedTimes++;
				if (Math.isFinite(_repeatTimes1) == true) {
					_repeatTimes1--;
				}
				// 更新对象属性
				if (_target != null) {
					var fields = Reflect.fields(_valuesR);
					for (property in fields) {
						var valueB = untyped _valuesB[property];
						if (Std.is(valueB, String) == true) {
							#if lua
							untyped _valuesR[property] = untyped _valuesR[property] + Afx.str2num(valueB);
							#else
							untyped _valuesR[property] = untyped _valuesR[property] + Std.parseFloat(valueB);
							#end
						}
						if (_yoyo == true) {
							var tmp = untyped _valuesR[property];
							untyped _valuesR[property] = valueB;
							untyped _valuesB[property] = tmp;
						}
						untyped _valuesA[property] = untyped _valuesR[property];
					}
				}
				// 重置数值
				_repeatOverMs = ElapsedMs + _repeatDelayMs;
				_startMs = ElapsedMs + _repeatDelayMs + _delayMs;
				// [重复回调]
				if (_onRepeatCallback != null) {
					if (_onRepeatCallback(_repeatedTimes) == false) {
						_repeatTimes1 = 0;
					}
				}
			}
			if (_repeatTimes1 <= 0) {
				this._isCompleted = true;
				// [结束回调]
				if (_onCompleteCallback != null) {
					var fn = _onCompleteCallback;
					#if lua
					var rzl = lua.Lua.xpcall(function() {
						Reflect.callMethod(null, fn, _onCompleteParams);
					}, untyped __G__TRACKBACK__);
					#else
					Reflect.callMethod(null, fn, _onCompleteParams);
					#end
				}
				return false;
			}
			return true;
		}
		return true;
	}

	/**
	 * [取消]
	 */
	public function cancel(complete:Bool = false) {
		if (_isCompleted == true || _retain == true) {
			return this;
		}
		if (complete == true) {
			this.update(_startMs + _delayMs + _durationMs);
		}
		ATimer._del(this);
		_isCompleted = true;
		// [取消回调]
		if (_onCancelCallback != null) {
			var fn = _onCancelCallback;
			Reflect.callMethod(null, fn, null);
		}
		return this;
	}

	/**
	 * [取消]
	 */
	public function pause(v:Bool) {
		this._pause = v;
	}

	/**
	 * TO属性.
	 */
	public function to(properties:Dynamic):ATimer {
		_valuesB = properties;
		return this;
	}

	/**
	 * TO属性.
	 */
	inline public function toAlpha(v:Float):ATimer {
		return to({alpha: v});
	}

	inline public function toX(v:Float):ATimer {
		return to({x: v});
	}

	inline public function toY(v:Float):ATimer {
		return to({y: v});
	}

	inline public function toXY(a:Float, b:Float):ATimer {
		return to({x: a, y: b});
	}

	public function repeat(times:Int, yoyo:Bool = false, delayMs:Float = 0):ATimer {
		_yoyo = yoyo;
		_repeatTimes0 = times;
		_repeatTimes1 = times;
		_repeatDelayMs = delayMs;
		return this;
	}

	inline public function getRepeatTimes():Int {
		return _repeatTimes0;
	}

	public function easing(v:Float->Float) {
		_easingFunction = cast v;
		return this;
	}

	public function retain():ATimer {
		_retain = true;
		return this;
	}

	inline public function isRetain():Bool {
		return _retain;
	}

	public function release():ATimer {
		_retain = false;
		return this;
	}

	public function interpolation(interpolation) {
		_interpolationFunction = interpolation;
		return this;
	}

	public function onStart(callback:Dynamic):ATimer {
		_onStartCallback = callback;
		return this;
	}

	public function onUpdate(callback:Dynamic):ATimer {
		_onUpdateCallback = callback;
		return this;
	}

	public function onCancel(callback:Dynamic):ATimer {
		_onCancelCallback = callback;
		return this;
	}

	public function onRepeat(callback:Int->Bool):ATimer {
		_onRepeatCallback = callback;
		return this;
	}

	public function callRepeat():ATimer {
		if (_onRepeatCallback(0) == false) {
			this.release().cancel();
		}
		return this;
	}

	public function onComplete(callback:Dynamic, params:Array<Dynamic> = null):ATimer {
		_onCompleteCallback = callback;
		_onCompleteParams = params;
		if (_onCompleteParams != null) {
			_onCompleteParams = _onCompleteParams.concat([]);
		}
		return this;
	}
}

class ATween_Easing_Linear {
	public static function None(k:Float):Float {
		return k;
	}
}

class ATween_Easing_Quadratic {
	public static function In(k:Float):Float {
		return k * k;
	}

	public static function Out(k:Float):Float {
		return k * (2 - k);
	}

	public static function InOut(k:Float):Float {
		if ((k *= 2) < 1) {
			return 0.5 * k * k;
		}
		return -0.5 * (--k * (k - 2) - 1);
	}
}

class ATween_Easing_Cubic {
	public static function In(k:Float):Float {
		return k * k * k;
	}

	public static function Out(k:Float):Float {
		return --k * k * k + 1;
	}

	public static function InOut(k:Float):Float {
		if ((k *= 2) < 1) {
			return 0.5 * k * k * k;
		}
		return 0.5 * ((k -= 2) * k * k + 2);
	}
}

class ATween_Easing_Quartic {
	public static function In(k:Float):Float {
		return k * k * k * k;
	}

	public static function Out(k:Float):Float {
		return 1 - (--k * k * k * k);
	}

	public static function InOut(k:Float):Float {
		if ((k *= 2) < 1) {
			return 0.5 * k * k * k * k;
		}
		return -0.5 * ((k -= 2) * k * k * k - 2);
	}
}

class ATween_Easing_Quintic {
	public static function In(k:Float):Float {
		return k * k * k * k * k;
	}

	public static function Out(k:Float):Float {
		return --k * k * k * k * k + 1;
	}

	public static function InOut(k:Float):Float {
		if ((k *= 2) < 1) {
			return 0.5 * k * k * k * k * k;
		}
		return 0.5 * ((k -= 2) * k * k * k * k + 2);
	}
}

class ATween_Easing_Sinusoidal {
	public static function In(k:Float):Float {
		return 1 - Math.cos(k * Math.PI / 2);
	}

	public static function Out(k:Float):Float {
		return Math.sin(k * Math.PI / 2);
	}

	public static function InOut(k:Float):Float {
		return 0.5 * (1 - Math.cos(Math.PI * k));
	}
}

class ATween_Easing_Exponential {
	public static function In(k:Float):Float {
		return k == 0 ? 0 : Math.pow(1024, k - 1);
	}

	public static function Out(k:Float):Float {
		return k == 1 ? 1 : 1 - Math.pow(2, -10 * k);
	}

	public static function InOut(k:Float):Float {
		if (k == 0) {
			return 0;
		}
		if (k == 1) {
			return 1;
		}
		if ((k *= 2) < 1) {
			return 0.5 * Math.pow(1024, k - 1);
		}
		return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
	}
}

class ATween_Easing_Circular {
	public static function In(k:Float):Float {
		return 1 - Math.sqrt(1 - k * k);
	}

	public static function Out(k:Float):Float {
		return Math.sqrt(1 - (--k * k));
	}

	public static function InOut(k:Float):Float {
		if ((k *= 2) < 1) {
			return -0.5 * (Math.sqrt(1 - k * k) - 1);
		}
		return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
	}
}

class ATween_Easing_Elastic {
	public static function In(k:Float):Float {
		if (k == 0) {
			return 0;
		}
		if (k == 1) {
			return 1;
		}
		return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
	}

	public static function Out(k:Float):Float {
		if (k == 0) {
			return 0;
		}
		if (k == 1) {
			return 1;
		}
		return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
	}

	public static function InOut(k:Float):Float {
		if (k == 0) {
			return 0;
		}
		if (k == 1) {
			return 1;
		}
		k *= 2;
		if (k < 1) {
			return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
		}
		return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
	}
}

class ATween_Easing_Back {
	public static function In(k:Float):Float {
		var s = 1.70158;
		return k * k * ((s + 1) * k - s);
	}

	public static function Out(k:Float):Float {
		var s = 1.70158;
		return --k * k * ((s + 1) * k + s) + 1;
	}

	public static function InOut(k:Float):Float {
		var s = 1.70158 * 1.525;
		if ((k *= 2) < 1) {
			return 0.5 * (k * k * ((s + 1) * k - s));
		}
		return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
	}
}

class ATween_Easing_Bounce {
	public static function In(k:Float):Float {
		return 1 - ATween_Easing_Bounce.Out(1 - k);
	}

	public static function Out(k:Float):Float {
		if (k < (1 / 2.75)) {
			return 7.5625 * k * k;
		} else if (k < (2 / 2.75)) {
			return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
		} else if (k < (2.5 / 2.75)) {
			return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
		} else {
			return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
		}
	}

	public static function InOut(k:Float):Float {
		if (k < 0.5) {
			return ATween_Easing_Bounce.In(k * 2) * 0.5;
		}
		return ATween_Easing_Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
	}
}

class ATween_Interpolation {
	public static function Linear(v:Array<Dynamic>, k:Float):Float {
		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = ATween_Interpolation_Utils.Linear;
		if (k < 0) {
			return fn(v[0], v[1], f);
		}
		if (k > 1) {
			return fn(v[m], v[m - 1], m - f);
		}
		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
	}

	public static function Bezier(v:Array<Dynamic>, k:Float):Float {
		var b:Float = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = ATween_Interpolation_Utils.Bernstein;
		for (i in 0...n) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}
		return b;
	}

	public static function CatmullRom(v:Array<Dynamic>, k:Float):Float {
		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = ATween_Interpolation_Utils.CatmullRom;
		if (v[0] == v[m]) {
			if (k < 0) {
				i = Math.floor(f = m * (1 + k));
			}
			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
		} else {
			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}
			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}
			return fn(v[i != 0 ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
		}
	}
}

class ATween_Interpolation_Utils {
	static private var a = [1];

	public static function Linear(p0:Float, p1:Float, t:Float):Float {
		return (p1 - p0) * t + p0;
	}

	public static function Bernstein(n:Float, i:Float):Float {
		var fc = Factorial;
		return fc(n) / fc(i) / fc(n - i);
	}

	public static function Factorial(n:Float):Float {
		var s:Float = 1;
		if (a[untyped n] != 0) {
			return a[untyped n];
		}
		var i = n;
		while (i > 1) {
			s *= i;
			i--;
		}
		a[untyped n] = untyped s;
		return s;
	}

	public static function CatmullRom(p0:Float, p1:Float, p2:Float, p3:Float, t:Float):Float {
		var v0 = (p2 - p0) * 0.5;
		var v1 = (p3 - p1) * 0.5;
		var t2 = t * t;
		var t3 = t * t2;
		return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
	}
}
