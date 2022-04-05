/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * ATween - a a easy, fast and tiny tween libary.
 */
@:expose
class ATween
{
    /**
	 * Determines whether to stop all tweens.
	 */
    public static var stop:Bool = false;
    /**
	 * The manager for all tween instances.
	 */
    public static var _instances:Array<ATween> = new Array<ATween>();
    /**
	 * Indicates whether has installed in current environment.
	 */
    private static var _isInstalled:Bool = false;
    /**
	 * Elapsed time of tween(unit: millisecond).
	**/
    public var elapsedMs:Float = 0;
    /**
	 * Elapsed percent of tween(unit: millisecond).
	**/
    public var elapsedPercent:Float = 0;
    /**
	 * Params of tween.
	 */
    private var _target:Dynamic;
    private var _initedTarget:Bool = false;
    private var _srcVals:Dynamic;
    private var _dstVals:Dynamic;
    private var _revVals:Dynamic;

    private var _attachment:Dynamic = null;
    private var _convertor:Float -> Float -> Float -> Float -> String -> Dynamic = null;
    private var _data:Dynamic = null;

    private var _repeatNextStartMs:Float = 0;
    private var _repeatRefs:Float = 0;
    private var _repeatSteps:Int = 0;
    private var _repeatDelayMs:Float = 0;
    private var _updateSteps:Float = 0;

    private var _startMs:Float = 0;
    private var _delayMs:Float = 0;
    private var _durationMs:Float = 1;
    private var _repeatTimes:Int = 0;
    private var _yoyo = false;
    private var _isCompleted = false;
    private var _pause:Bool = false;
    private var _retain = false;
    private var _easing:Float -> Float = null;
    /**
	 * The callback functions.
	**/
    private var _onStartCallback:Void -> Void = null;
    private var _isStarted:Bool = false;
    private var _onStartCallbackFired:Bool = false;
    private var _onUpdateCallback:Float -> Float -> Void = null;
    private var _onCancelCallback:Void -> Void = null;
    private var _onCompleteCallback:Void -> Void = null;
    private var _onCompleteParams:Array<Dynamic> = null;
    private var _onRepeatCallback:Int -> Bool = null;
    /**
	 * Add a tween to global manager.
	 */
    public static function _add(ins:ATween):Void
    {
        _instances.push(ins);
    }
    /**
	 * Delete a tween from global manager.
	 */
    public static function _del(ins:ATween):Void
    {
        var i = _instances.indexOf(ins);
        if (i != -1)
        {
            _instances.splice(i, 1);
        }
    }
    /**
	 * Updates all tweens by the specified time
	 * @param ms millisecond unit
	 */
    public static function updateAll(ms:Float):Void
    {
        if (_instances.length == 0)
        {
            return;
        }
        if (stop == true)
        {
            return;
        }
        var instances:Array<ATween> = _instances.concat([]);
        for (ins in instances)
        {
            if (ins._pause == false && ins.update(ms) == false)
            {
                ATween._del(ins);
            }
        }
    }
    /**
	 * Kill all tweens.
	 * ! When the tween is retain, then it will be ignored.	 
	 * @param withComplete Indicates whether to call complete function.
	 */
    public static function killAll(completed:Bool = false):Void
    {
        var instances:Array<ATween> = _instances.concat([]);
        for (i in 0...instances.length)
        {
            instances[i].cancel(completed);
        }
    }
    /**
	 * Kill all tweens of indicated the target or attachment.
	 * @param targetOrAttachment the target or attachment.
	 * @param withComplete Indicates whether to call complete function.
	 * @returns Number of killed instances
	 */
    public static function killTweens(targetOrAttachment:Dynamic, completed:Bool = false):Void
    {
        var instance:Array<ATween> = _instances.concat([]);
        var num = 0;
        for (i in 0...instance.length)
        {
            var ins = instance[i];
            if (ins._target == targetOrAttachment || ins._attachment == targetOrAttachment)
            {
                ins.cancel(completed);
                num++;
            }
        }
    }
    /**
	 * Check the target or attachment is tweening.
	 * @param target As name mean. 
	 */
    public static function isTweening(targetOrAttachment:Dynamic):Bool
    {
        for (i in 0..._instances.length)
        {
            var ins = _instances[i];
            if (ins._target == targetOrAttachment || ins._attachment == targetOrAttachment)
            {
                return true;
            }
        }
        return false;
    }
    /**
	 * Constructor.
	 */
    public function new(target:Dynamic)
    {
        _target = target;
    }
    /**
	 * As name mean.
	 */
    private static function checkInstalled():Void
    {
        #if js
		if (!_isInstalled) {
			_isInstalled = true;
			if (js.Browser.window != null && js.Browser.window.requestAnimationFrame != null) {
				var lastTime:Float = 0;
				var onFrame = function(now:Float):Void {
					var ms = now - lastTime;
					lastTime = now;
					ATween.updateAll(ms);
					js.Browser.window.requestAnimationFrame(untyped onFrame);
				}
				lastTime = js.Browser.window.performance.now();
                onFrame(lastTime);
			}
            else
            {
                js.Browser.console.log('You need to manually call "ATween.updateAll" function update all tweens');
            }
		}
		#end
    }
    /**
	 * Create a tween.
	 * @param target It must be a object. 
	 * @param durationMs set duration, not including any repeats or delays.
	 * @param delayMs set initial delay which is the length of time in ms before the animation should begin.
	 * @returns Tween instance
	 */
    public static function newTween(target:Dynamic, durationMs:Float, delayMs:Float = 0):ATween
    {
        checkInstalled();
        var t = new ATween(target);
        t._durationMs = durationMs;
        t._delayMs = delayMs;
        return t;
    }
    /**
	 * Create a once timer.
	 * It will auto start.
	 * @param intervalMs interval millisecond
	 * @param onCompleteCallback The callback function when complete.
	 * @param onCompleteParams The callback parameters when complete.
	 * @returns Tween instance
	 */
    public static function newOnce(intervalMs:Float, onCompleteCallback:Dynamic, onCompleteParams:Array<Dynamic> = null):ATween
    {
        checkInstalled();
        var t = new ATween(null);
        t._delayMs = intervalMs;
        t.onComplete(onCompleteCallback, onCompleteParams);
        t.start();
        return t;
    }
    /**
	 * Create a timer.
	 * It will auto start.
	 * @param intervalMs interval millisecond
	 * @param times Repeat Times(-1 is infinity)
	 * @param onRepeatCallback  if return false, then will cancel this timer.
	 * @param onCompleteCallback The callback function when complete.
	 * @param onCompleteParams The callback parameters when complete.
	 * @returns Tween instance
	**/
    public static function newTimer(intervalMs:Float, times:Int, onRepeatCallback:Int -> Bool, onCompleteCallback:Dynamic = null, onCompleteParams:Array<Dynamic> = null):ATween
    {
        var t = new ATween(null);
        t._delayMs = intervalMs;
        t.repeat(times);
        t.onRepeat(onRepeatCallback);
        t.onComplete(onCompleteCallback, onCompleteParams);
        t.start();
        return t;
    }
    /**
	 * Start the tween/timer.
	 * @returns Tween instance
	 */
    public function start():ATween
    {
        if (_isStarted)
        {
            return this;
        }
        _isStarted = true;
        ATween._add(this);

        elapsedMs = 0;
        _isCompleted = false;
        _onStartCallbackFired = false;
        _repeatNextStartMs = 0;
        _startMs = _delayMs;
        // 更新对象属性
        if (_delayMs == 0 && _target != null)
        {
            initTarget();
        }
        return this;
    }
    /**
	 * Init target.
	 */
    private function initTarget():Void
    {
        var fields = Reflect.fields(_dstVals);
        for (property in fields)
        {
			var curVal:Dynamic;
			if (_target.get_tween_prop != null)
			{
				curVal = _target.get_tween_prop(property);
			}
			else
			{
				curVal = untyped _target[property];
			}
            var dstVal:Dynamic = untyped _dstVals[property];
            if (!Std.is(dstVal, Float))
            {
                throw "Unknown dest value:" + (untyped dstVal); // add untyped for avoid haxe redundant compilation in some languages.
            }
            // !! Convert Empty value(null, false, '') to 0
            curVal *= 1.0;
            // create source values
            if (this._srcVals == null)
            {
                this._srcVals = {};
            }
            this._srcVals[untyped property] = curVal;
            // create reverse values set
            if (this._revVals == null)
            {
                this._revVals = {};
            }
            this._revVals[untyped property] = curVal;
        }
        _initedTarget = true;
    }

    /**
	 * Update target.
	**/
    private function updateTarget(percent:Float, ignoreCallback:Bool = false):Void
    {
        if (_target == null)
        {
            return;
        }
        var ePercent = percent;
        var fnE = this._easing;
        if (fnE != null)
        {
            ePercent = fnE(percent);
        }
        var fields = Reflect.fields(_srcVals);
        for (property in fields)
        {
            var curVal = _srcVals[untyped property];
            if (curVal == null)
            {
                continue;
            }
            var startVal = curVal;
            var endVal = this._dstVals[untyped property];
            var newVal:Float;
            if (percent >= 1)
            {
                newVal = endVal;
            }
            else
            {
                newVal = startVal + (endVal - startVal) * ePercent;
            }
			if (_target.set_tween_prop != null)
			{
				_target.set_tween_prop(property, newVal);
			}
			else
			{
				this._target[untyped property] = newVal;
			}
            // sync value to bind object
            if (this._attachment != null)
            {
                var syncVal:Dynamic;
                var fnC = this._convertor;
                if (fnC != null)
                {
                    syncVal = fnC(newVal, startVal, endVal, ePercent, property);
                }
                else
                {
                    syncVal = Math.floor(newVal) + 'px';
                }
                #if js
				var e: js.html.Element = cast this._attachment;
				e.style.setProperty(property, syncVal);
				#end
            }
        }
        // [Callback Handler]
        if (ignoreCallback == false && _onUpdateCallback != null)
        {
            this._updateSteps++;
            var cb = _onUpdateCallback;
            #if js
			untyped __js__('cb.call({0},{1},{2})', this, percent, this._updateSteps);
			#else
            cb(percent, _updateSteps);
            #end
        }
    }

    /**
	 * Update tween by the specified time.
	 */
    public function update(ms:Float):Bool
    {
        elapsedMs += ms;
        if (_repeatNextStartMs != 0)
        {
            if (elapsedMs >= _repeatNextStartMs)
            {
                _repeatNextStartMs = 0;
                if (_yoyo == false)
                {
                    updateTarget(0);
                }
            }
        }
        if (elapsedMs < _startMs)
        {
            return true;
        }
        // init target
        if (_target != null && _initedTarget == false)
        {
            initTarget();
        }
        // [Callback Handler]
        if (_onStartCallbackFired == false)
        {
            _onStartCallbackFired = true;
            if (_onStartCallback != null)
            {
                var cbS = _onStartCallback;
                #if js
				untyped __js__('cbS.call({0})', this);
				#else
                cbS();
                #end
            }
        }
        // update values
        elapsedPercent = (elapsedMs - _startMs) / _durationMs;
        if (elapsedPercent > 1)
        {
            elapsedPercent = 1;
        }
        // update target
        updateTarget(elapsedPercent);
        // 3.结束处理
        if (elapsedPercent == 1)
        {
            if (_repeatRefs != 0)
            {
                _repeatSteps++;
                _repeatRefs--;
                // reset target properties
                if (_target != null)
                {
                    var fields = Reflect.fields(_revVals);
                    for (property in fields)
                    {
                        var valueB = _dstVals[untyped property];
                        if (_yoyo == true)
                        {
                            var tmp = _revVals[untyped property];
                            _revVals[untyped property] = valueB;
                            _dstVals[untyped property] = tmp;
                        }
                        _srcVals[untyped property] = _revVals[untyped property];
                    }
                }
                // reset time
                _repeatNextStartMs = elapsedMs + _repeatDelayMs;
                _startMs = _repeatNextStartMs + _delayMs;
                // [Callback Handler]
                if (_onRepeatCallback != null)
                {
                    var cbR = this._onRepeatCallback;
                    var rzl:Bool;
                    #if js
					rzl = untyped __js__('cbR.call({0},{1})', this, _repeatSteps);
					#else
                    rzl = cbR(_repeatSteps);
                    #end
                    if (rzl == false)
                    {
                        _repeatRefs = 0;
                    }
                }
            }
            if (_repeatRefs == 0)
            {
                this._isCompleted = true;
                // [Callback Handler]
                if (_onCompleteCallback != null)
                {
                    var cbC = this._onCompleteCallback;
                    #if js
					untyped __js__('cbC.apply({0},{1})', this, _onCompleteParams);
					#else
                    Reflect.callMethod(null, cbC, _onCompleteParams);
                    #end
                }
                return false;
            }
            return true;
        }
        return true;
    }

    /**
	 * Cancel.
	 * @param withComplete indicate that whether call complete function.
	 * @returns Tween instance
	 */
    public function cancel(complete:Bool = false)
    {
        if (_isCompleted == true || _retain == true)
        {
            return this;
        }
        this._repeatRefs = 0;
        if (complete == true)
        {
            this.update(0x7FFFFFFF);
        }
        ATween._del(this);
        _isCompleted = true;
        // [Callback Handler]
        if (_onCancelCallback != null)
        {
            var cb = _onCancelCallback;
            #if js
			untyped __js__('cb.call({0})', this);
			#else
            cb();
            #end
        }
        return this;
    }

    /**
	 * The destination value that the target wants to achieve.
	 * @param endValus destination values.
	 * @returns Tween instance
	 */
    public function to(properties:Dynamic):ATween
    {
        _dstVals = properties;
        return this;
    }
	#if js
    /**
     * Attach to HTMLElement element(The new tween value will auto sync to it).
     * @param obj HTMLElement or element id
     * @param convert the tween value convertor for obj(like number to RGB)
     * @returns Tween instance
     */
	public function attach(obj:Dynamic, convert:Float->Float->Float->Float->String->Dynamic = null):ATween {
		var t:js.html.Element;
		if (Std.instance(obj, js.html.Element) != null) {
			t = cast obj;
		} else {
			t = cast js.Browser.document.getElementById(obj);
		}
		this._attachment = t;
		this._convertor = convert;
		return this;
	}
	#end
    /**
	 * Store arbitrary data associated with this tween.
	 */
    public function data(v:Dynamic):ATween
    {
        this._data = v;
        return this;
    }

    /**
	 * Set repeat times.
	 * @param times As name mean
	 * @param yoyo where true causes the tween to go back and forth, alternating backward and forward on each repeat.
	 * @param delayMs delay trigger time
	 * @returns Tween instance
	 */
    public function repeat(times:Int, yoyo:Bool = false, delayMs:Float = 0):ATween
    {
        _yoyo = yoyo;
        _repeatTimes = times;
        _repeatRefs = times;
        _repeatDelayMs = delayMs;
        return this;
    }

    /**
	 * Immediate call the repeat function.
	 * @remark
	 * You need init the env in sometimes, then it's a good choice.
	 * @returns Tween instance
	 */
    public function callRepeat():ATween
    {
        var cb = this._onRepeatCallback;
        var rzl:Bool;
        #if js
		rzl = untyped __js__('cb.call({0}, 0)', this);
		#else
        rzl = cb(0);
        #end
        if (rzl == false)
        {
            this.release().cancel();
        }
        return this;
    }

    /**
	 * Set easing function.
	 * @returns Tween instance
	 */
    public function easing(v:Float -> Float):ATween
    {
        _easing = cast v; // add cast for avoid haxe redundant compilation in some languages.
        return this;
    }

    /**
	 * Keep this tween, killAll has no effect on it.
	 * @returns Tween instance
	 */
    inline public function retain():ATween
    {
        _retain = true;
        return this;
    }

    /**
	 * Release the retain tween.
	 * @returns Tween instance
	 */
    inline public function release():ATween
    {
        _retain = false;
        return this;
    }

    /**
	 * Determine whether the tween is keeping.
	 * @returns Tween instance
	 */
    inline public function isRetain():Bool
    {
        return _retain;
    }

    /**
	 * Set pause state.
	 */
    inline public function setPause(v:Bool):Void
    {
        _pause = v;
    }

    /**
	 * Get pause state.
	 */
    inline public function getPause():Bool
    {
        return _pause;
    }

    /**
	 * Get repeat times.
	 */
    inline public function getRepeatTimes():Int
    {
        return _repeatTimes;
    }

    /**
	 * Get target.
	 */
    inline public function getTarget():Dynamic
    {
        return _target;
    }

    /**
	 * Get attachment.
	 */
    inline public function getAttachment():Dynamic
    {
        return _attachment;
    }

    /**
	 * Get data.
	 */
    inline public function getData():Dynamic
    {
        return _data;
    }

    /**
	 * Set the callback function when the tween start.
	 * @returns Tween instance
	 */
    public function onStart(callback:Void -> Void):ATween
    {
        _onStartCallback = cast callback; // add cast for avoid haxe redundant compilation in some languages.
        return this;
    }

    /**
	 * Set the callback function when the tween's value has updated.
	 * @returns Tween instance
	 */
    public function onUpdate(callback:Float -> Float -> Void):ATween
    {
        _onUpdateCallback = cast callback; // add cast for avoid haxe redundant compilation in some languages.
        return this;
    }

    /**
	 * Set the callback function when the tween is completed.
	 * @returns Tween instance
	 */
    public function onComplete(callback:Dynamic, params:Array<Dynamic> = null):ATween
    {
        _onCompleteCallback = cast callback; // add cast for avoid haxe redundant compilation in some languages.
        _onCompleteParams = params;
        if (_onCompleteParams != null)
        {
            _onCompleteParams = _onCompleteParams.concat([]);
        }
        return this;
    }
    /**
	 * Set the callback function when the tween is canceled.
	 * @returns Tween instance
	 */
    public function onCancel(callback:Void -> Void):ATween
    {
        _onCancelCallback = cast callback; // add cast for avoid haxe redundant compilation in some languages.
        return this;
    }

    public function onRepeat(callback:Int -> Bool):ATween
    {
        _onRepeatCallback = cast callback; // add cast for avoid haxe redundant compilation in some languages.
        return this;
    }
    /**
	 * Extend - Common "to" Functions
	 */
    public function toAlpha(v:Float):ATween
    {
        return to({alpha:v});
    }

    public function toX(v:Float):ATween
    {
        return to({x:v});
    }

    public function toY(v:Float):ATween
    {
        return to({y:v});
    }

    public function toXY(a:Float, b:Float):ATween
    {
        return to({x:a, y:b});
    }
}