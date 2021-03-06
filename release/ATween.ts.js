"use strict";
/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * ATween is a easy, fast and tiny tween library.
 */
var ATween = /** @class */ (function () {
    /**
     * Constructor.
     */
    function ATween(target) {
        /**
         * Elapsed time of tween(unit: millisecond).
         **/
        this.elapsedMs = 0;
        /**
         * Elapsed percentage of tween.
         **/
        this.elapsedPercentage = 0;
        this._initedTarget = false;
        this._attachment = null;
        this._convertor = null;
        this._data = null;
        this._repeatNextStartMs = 0;
        this._repeatRefs = 0; // references, reference count
        this._repeatSteps = 0;
        this._repeatDelayMs = 0;
        this._updateSteps = 0;
        this._isFirstUpdate = true;
        this._startMs = 0;
        this._delayMs = 0;
        this._durationMs = 1; // can't be 0
        this._repeatTimes = 0;
        this._yoyo = false;
        this._isCompleted = false;
        this._pause = false;
        this._isRetained = false;
        this._easing = null;
        /**
         * The callback functions.
         **/
        this._onStartCallback = null;
        this._isStarted = false;
        this._onStartCallbackFired = false;
        this._onUpdateCallback = null;
        this._onCancelCallback = null;
        this._onCompleteCallback = null;
        this._onCompleteParams = null;
        this._onRepeatCallback = null;
        this._target = target;
    }
    /**
     * Add a tween to global manager.
     */
    ATween._add = function (ins) {
        ATween._instances.push(ins);
    };
    /**
     * Delete a tween from global manager.
     */
    ATween._del = function (ins) {
        var i = ATween._instances.indexOf(ins);
        if (i != -1) {
            ATween._instances.splice(i, 1);
        }
    };
    /**
     * Updates all tweens by the specified time.
     * @param ms millisecond unit
     */
    ATween.updateAll = function (ms) {
        if (ATween._instances.length == 0) {
            return;
        }
        if (ATween.stop == true) {
            return;
        }
        var clone = ATween._instances.concat([]);
        var len = clone.length;
        for (var i = 0; i < len; i++) {
            var ins = clone[i];
            if (ins._pause == false && ins.update(ms) == false) {
                ATween._del(ins);
            }
        }
    };
    /**
     * Kill all tweens.
     * @remarks
     * WHEN the tween is retain, then it will be ignored.
     * @param withComplete Specifies whether to call complete function.
     */
    ATween.killAll = function (withComplete) {
        if (withComplete === void 0) { withComplete = false; }
        var clone = ATween._instances.concat([]);
        var len = clone.length;
        for (var i = 0; i < len; i++) {
            var ins = clone[i];
            ins.cancel(withComplete);
        }
    };
    /**
     * Kill all tweens of specified the target or attachment.
     * @param targetOrAttachment the target or attachment.
     * @param withComplete Specifies whether to call complete function.
     * @return Number of killed instances
     */
    ATween.killTweens = function (targetOrAttachment, withComplete) {
        if (withComplete === void 0) { withComplete = false; }
        var clone = ATween._instances.concat([]);
        var len = clone.length;
        var num = 0;
        for (var i = 0; i < len; i++) {
            var ins = clone[i];
            if (ins._target == targetOrAttachment || ins._attachment == targetOrAttachment) {
                ins.cancel(withComplete);
                num++;
            }
        }
        return num;
    };
    /**
     * Check the target or attachment is tweening.
     * @param targetOrAttachment the target or attachment.
     */
    ATween.isTweening = function (targetOrAttachment) {
        var instances = ATween._instances;
        var len = instances.length;
        for (var i = 0; i < len; i++) {
            var ins = instances[i];
            if (ins._target == targetOrAttachment || ins._attachment == targetOrAttachment) {
                return true;
            }
        }
        return false;
    };
    /**
     * Checks whether has installed frame trigger in current environment.
     */
    ATween.checkInstalled = function () {
        if (!ATween._isInstalled) {
            ATween._isInstalled = true;
            if (window != null && window.requestAnimationFrame != null) {
                var lastTime = 0;
                var onFrame = function (now) {
                    var ms = now - lastTime;
                    lastTime = now;
                    ATween.updateAll(ms);
                    window.requestAnimationFrame(onFrame);
                };
                lastTime = window.performance.now();
                onFrame(lastTime);
            }
            else {
                console.log('You need to manually call "ATween.updateAll" function update all tweens');
            }
        }
    };
    /**
     * Create a tween.
     * @param target the targer object.
     * @param durationMs set duration, not including any repeats or delays.
     * @param delayMs set initial delay which is the length of time in ms before the tween should begin.
     * @return Tween instance
     */
    ATween.newTween = function (target, durationMs, delayMs) {
        if (delayMs === void 0) { delayMs = 0; }
        ATween.checkInstalled();
        var t = new ATween(target);
        if (durationMs < 0) {
            durationMs = 1;
        }
        t._durationMs = durationMs;
        t._delayMs = delayMs;
        return t;
    };
    /**
     * Create a once timer.
     * @remarks
     * It will AUTO start, you don't need to call "start()" function.
     * @param intervalMs interval millisecond
     * @param onCompleteCallback The callback function when completion.
     * @param onCompleteParams The callback parameters when completion.
     * @return Tween instance
     */
    ATween.newOnce = function (intervalMs, onCompleteCallback, onCompleteParams) {
        if (onCompleteParams === void 0) { onCompleteParams = null; }
        ATween.checkInstalled();
        var t = new ATween(null);
        t._delayMs = intervalMs;
        t.onComplete(onCompleteCallback, onCompleteParams);
        t.start();
        return t;
    };
    /**
     * Create a timer.
     * @remarks
     * It will AUTO start, you don't need to call "start()" function.
     * @param intervalMs interval millisecond
     * @param times the repeat times(-1 is infinity)
     * @param onRepeatCallback  if return FASLE, then will cancel this timer.
     * @param onCompleteCallback The callback function when completion.
     * @param onCompleteParams The callback parameters when completion.
     * @return Tween instance
     **/
    ATween.newTimer = function (intervalMs, times, onRepeatCallback, onCompleteCallback, onCompleteParams) {
        if (onCompleteCallback === void 0) { onCompleteCallback = null; }
        if (onCompleteParams === void 0) { onCompleteParams = null; }
        ATween.checkInstalled();
        var t = new ATween(null);
        t._delayMs = intervalMs;
        t.repeat(times);
        t.onRepeat(onRepeatCallback);
        t.onComplete(onCompleteCallback, onCompleteParams);
        t.start();
        return t;
    };
    /**
     * Start the tween/timer.
     * @return Tween instance
     */
    ATween.prototype.start = function () {
        if (this._isStarted) {
            return this;
        }
        this._isStarted = true;
        ATween._add(this);
        this.elapsedMs = 0;
        this._isCompleted = false;
        this._onStartCallbackFired = false;
        this._repeatNextStartMs = 0;
        this._startMs = this._delayMs;
        this._isFirstUpdate = true;
        if (this._delayMs == 0 && this._target != null) {
            this.initTarget();
        }
        return this;
    };
    /**
     * Init target.
     */
    ATween.prototype.initTarget = function () {
        if (this._initedTarget) {
            return;
        }
        this._srcVals = {};
        this._revVals = {};
        for (var property in this._dstVals) {
            var curVal;
            if (this._target.get_tween_prop != null) {
                curVal = this._target.get_tween_prop(property);
            }
            else {
                curVal = this._target[property];
            }
            var dstVal = this._dstVals[property];
            if (typeof (dstVal) != 'number') {
                throw "Unknown dest value:" + dstVal;
            }
            // !! Convert Empty value(null, false, '') to 0
            curVal *= 1.0;
            // set source value
            this._srcVals[property] = curVal;
            // set reverse value
            this._revVals[property] = curVal;
        }
        this._initedTarget = true;
    };
    /**
     * Update target.
     **/
    ATween.prototype.updateTarget = function (percent, ignoreCallback) {
        if (ignoreCallback === void 0) { ignoreCallback = false; }
        if (this._target == null) {
            return;
        }
        var ePercent = percent;
        var fnE = this._easing;
        if (fnE != null) {
            ePercent = fnE(percent);
        }
        for (var property in this._srcVals) {
            var curVal = this._srcVals[property];
            if (curVal == null) {
                continue;
            }
            var startVal = curVal;
            var endVal = this._dstVals[property];
            var newVal;
            if (percent >= 1) {
                newVal = endVal;
            }
            else {
                newVal = startVal + (endVal - startVal) * ePercent;
            }
            if (this._target.set_tween_prop != null) {
                this._target.set_tween_prop(property, newVal);
            }
            else {
                this._target[property] = newVal;
            }
            // sync value to attachment object
            if (this._attachment != null) {
                var syncVal;
                var fnC = this._convertor;
                if (fnC != null) {
                    syncVal = fnC(newVal, startVal, endVal, ePercent, property);
                }
                else {
                    syncVal = Math.floor(newVal);
                }
                this._attachment.style.setProperty(property, syncVal);
            }
        }
        // [Callback Handler]
        if (ignoreCallback == false && this._onUpdateCallback != null) {
            this._updateSteps++;
            var cb = this._onUpdateCallback;
            cb.call(this, percent, this._updateSteps);
        }
    };
    /**
     * Update tween by the specified time.
     * @param ms millisecond unit
     */
    ATween.prototype.update = function (ms) {
        this.elapsedMs += ms;
        if (this._repeatNextStartMs != 0) {
            if (this.elapsedMs >= this._repeatNextStartMs) {
                this._repeatNextStartMs = 0;
                if (this._yoyo == false) {
                    this.updateTarget(0);
                }
            }
        }
        if (this.elapsedMs < this._startMs) {
            return true;
        }
        // init target
        if (this._target != null && this._initedTarget == false) {
            this.initTarget();
        }
        // [Callback Handler]
        if (this._onStartCallbackFired == false) {
            this._onStartCallbackFired = true;
            if (this._onStartCallback != null) {
                var cbS = this._onStartCallback;
                cbS.call(this);
            }
        }
        // update percent
        if (this._isFirstUpdate) {
            this.elapsedMs = this._startMs; // set unified time
            this._isFirstUpdate = false;
        }
        this.elapsedPercentage = (this.elapsedMs - this._startMs) / this._durationMs;
        if (ms >= 0x7FFFFFFF || this.elapsedPercentage > 1 || this._durationMs == 1) {
            this.elapsedPercentage = 1;
        }
        // update target
        this.updateTarget(this.elapsedPercentage);
        // end processing
        if (this.elapsedPercentage == 1) {
            if (this._repeatRefs != 0) {
                this._repeatSteps++;
                this._repeatRefs--;
                // reset target properties
                if (this._target != null) {
                    for (var property in this._revVals) {
                        var valueB = this._dstVals[property];
                        if (this._yoyo == true) {
                            var tmp = this._revVals[property];
                            this._revVals[property] = valueB;
                            this._dstVals[property] = tmp;
                        }
                        this._srcVals[property] = this._revVals[property];
                    }
                }
                // reset time
                this._repeatNextStartMs = this.elapsedMs + this._repeatDelayMs;
                this._startMs = this._repeatNextStartMs + this._delayMs;
                this._isFirstUpdate = true;
                // [Callback Handler]
                if (this._onRepeatCallback != null) {
                    var cbR = this._onRepeatCallback;
                    var rzl = cbR.call(this, this._repeatSteps);
                    if (rzl === false) {
                        this._repeatRefs = 0;
                    }
                }
            }
            if (this._repeatRefs == 0) {
                this._isCompleted = true;
                // [Callback Handler]
                if (this._onCompleteCallback != null) {
                    var cbC = this._onCompleteCallback;
                    cbC.apply(this, this._onCompleteParams);
                }
                return false;
            }
            return true;
        }
        return true;
    };
    /**
     * Cancel this tween.
     * @param withComplete Specifies whether to call complete function.
     * @return Tween instance
     */
    ATween.prototype.cancel = function (withComplete) {
        if (withComplete === void 0) { withComplete = false; }
        if (this._isCompleted == true || this._isRetained == true) {
            return;
        }
        this._repeatRefs = 0;
        if (withComplete == true) {
            this.update(0x7FFFFFFF);
        }
        ATween._del(this);
        this._isCompleted = true;
        // [Callback Handler]
        if (this._onCancelCallback != null) {
            var cb = this._onCancelCallback;
            cb.call(this);
        }
    };
    /**
     * The destination values that the target wants to achieves.
     * @param endValues destination values.
     * @return Tween instance
     */
    ATween.prototype.to = function (endValues) {
        this._dstVals = endValues;
        return this;
    };
    /**
     * Attach to HTMLElement element (The tween value will auto sync to this element).
     * @param obj HTMLElement or element id
     * @param convert You can use it to convert the current value to its final form, e.g. convert "int" to "rgb"
     * @return Tween instance
     */
    ATween.prototype.attach = function (obj, convert) {
        if (convert === void 0) { convert = null; }
        var t;
        if (obj instanceof HTMLElement) {
            t = obj;
        }
        else {
            t = document.getElementById(obj);
        }
        this._attachment = t;
        this._convertor = convert;
        return this;
    };
    /**
     * Store arbitrary data associated with this tween.
     */
    ATween.prototype.data = function (v) {
        this._data = v;
        return this;
    };
    /**
     * Set repeat execution.
     * @param times the repeat times(-1 is infinity)
     * @param yoyo where true causes the tween to go back and forth, alternating backward and forward on each repeat.
     * @param delayMs delay trigger time
     * @return Tween instance
     */
    ATween.prototype.repeat = function (times, yoyo, delayMs) {
        if (yoyo === void 0) { yoyo = false; }
        if (delayMs === void 0) { delayMs = 0; }
        this._yoyo = yoyo;
        this._repeatTimes = times;
        this._repeatRefs = times;
        this._repeatDelayMs = delayMs;
        return this;
    };
    /**
     * Calls the "onRepeat" function immediately(repeat times is 0).
     * @remark
     * IF you need to init the environment, then it's a good choice.
     * @return Tween instance
     */
    ATween.prototype.callRepeat = function () {
        var cb = this._onRepeatCallback;
        var rzl = cb.call(this, 0);
        if (rzl == false) {
            this.release().cancel();
        }
        return this;
    };
    /**
     * Set easing function.
     * @return Tween instance
     */
    ATween.prototype.easing = function (func) {
        this._easing = func;
        return this;
    };
    /**
     * Keep this tween, "killAll" has no effect on it.
     * @return Tween instance
     */
    ATween.prototype.retain = function () {
        this._isRetained = true;
        return this;
    };
    /**
     * Release this retained tween.
     * @return Tween instance
     */
    ATween.prototype.release = function () {
        this._isRetained = false;
        return this;
    };
    /**
     * Indicates whether the tween is keeping.
     * @return Tween instance
     */
    ATween.prototype.isRetained = function () {
        return this._isRetained;
    };
    /**
     * Set pause state.
     */
    ATween.prototype.setPause = function (v) {
        this._pause = v;
    };
    /**
     * Get pause state.
     */
    ATween.prototype.getPause = function () {
        return this._pause;
    };
    /**
     * Get repeat times.
     */
    ATween.prototype.getRepeatTimes = function () {
        return this._repeatTimes;
    };
    /**
     * Get target.
     */
    ATween.prototype.getTarget = function () {
        return this._target;
    };
    /**
     * Get attachment.
     */
    ATween.prototype.getAttachment = function () {
        return this._attachment;
    };
    /**
     * Get data.
     */
    ATween.prototype.getData = function () {
        return this._data;
    };
    /**
     * Set the callback function when startup.
     * @return Tween instance
     */
    ATween.prototype.onStart = function (callback) {
        this._onStartCallback = callback;
        return this;
    };
    /**
     * Set the callback function when updating.
     * @return Tween instance
     */
    ATween.prototype.onUpdate = function (callback) {
        this._onUpdateCallback = callback;
        return this;
    };
    /**
     * Set the callback function when completion.
     * @return Tween instance
     */
    ATween.prototype.onComplete = function (callback, params) {
        if (params === void 0) { params = null; }
        this._onCompleteCallback = callback;
        this._onCompleteParams = params;
        if (this._onCompleteParams != null) {
            this._onCompleteParams = this._onCompleteParams.concat([]);
        }
        return this;
    };
    /**
     * Set the callback function when canceled.
     * @return Tween instance
     */
    ATween.prototype.onCancel = function (callback) {
        this._onCancelCallback = callback;
        return this;
    };
    /**
     * Set the callback function when repeating.
     * @remarks
     * if return FASLE, then will cancel this timer.
     * @return Tween instance
     */
    ATween.prototype.onRepeat = function (callback) {
        this._onRepeatCallback = callback;
        return this;
    };
    /**
     * Simplified function for "to" - set alpha.
     */
    ATween.prototype.toAlpha = function (v) {
        return this.to({ alpha: v });
    };
    /**
     * Simplified function for "to" - set crood x.
     */
    ATween.prototype.toX = function (v) {
        return this.to({ x: v });
    };
    /**
     * Simplified function for "to" - set crood y.
     */
    ATween.prototype.toY = function (v) {
        return this.to({ y: v });
    };
    /**
     * Simplified function for "to" - set crood x and y.
     */
    ATween.prototype.toXY = function (a, b) {
        return this.to({ x: a, y: b });
    };
    /**
     * Specifies whether to stop all tweens.
     */
    ATween.stop = false;
    /**
     * The manager for all tween instances.
     */
    ATween._instances = new Array();
    /**
     * Indicates whether has installed in current environment.
     */
    ATween._isInstalled = false;
    return ATween;
}());
/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * Tween Convertor.
 *
 * IF you don't need custom conversion feature,
 * you can compile the project without this file.
 */
var ATweenConvertor = /** @class */ (function () {
    function ATweenConvertor() {
    }
    /**
     * css unit function.
     */
    ATweenConvertor.css_unit = function (curValue, startValue, endValue, percent, property) {
        return curValue + 'px';
    };
    /**
     * css gradient convert function
     */
    ATweenConvertor.css_gradient = function (curValue, startValue, endValue, percent, property) {
        var R0 = (startValue & 0xFF0000) >> 16;
        var G0 = (startValue & 0x00FF00) >> 8;
        var B0 = (startValue & 0x0000FF);
        var R1 = (endValue & 0xFF0000) >> 16;
        var G1 = (endValue & 0x00FF00) >> 8;
        var B1 = (endValue & 0x0000FF);
        var R = Math.floor(R1 * percent + (1 - percent) * R0);
        var G = Math.floor(G1 * percent + (1 - percent) * G0);
        var B = Math.floor(B1 * percent + (1 - percent) * B0);
        var color = (R << 16) | (G << 8) | B;
        var s = color.toString(16);
        for (var i = s.length; i < 6; i++) {
            s = '0' + s;
        }
        return "#" + s;
    };
    return ATweenConvertor;
}());
/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * Tween Easing.
 *
 * IF you don't need custom easing feature,
 * you can compile the project without this file.
 */
var ATweenEasing = /** @class */ (function () {
    function ATweenEasing() {
    }
    ATweenEasing.Linear = function (k) {
        return k;
    };
    ATweenEasing.QuadraticIn = function (k) {
        return k * k;
    };
    ATweenEasing.QuadraticOut = function (k) {
        return k * (2 - k);
    };
    ATweenEasing.QuadraticInOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    };
    ATweenEasing.CubicIn = function (k) {
        return k * k * k;
    };
    ATweenEasing.CubicOut = function (k) {
        return --k * k * k + 1;
    };
    ATweenEasing.CubicInOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k + 2);
    };
    ATweenEasing.QuarticIn = function (k) {
        return k * k * k * k;
    };
    ATweenEasing.QuarticOut = function (k) {
        return 1 - (--k * k * k * k);
    };
    ATweenEasing.QuarticInOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k * k;
        }
        return -0.5 * ((k -= 2) * k * k * k - 2);
    };
    ATweenEasing.QuinticIn = function (k) {
        return k * k * k * k * k;
    };
    ATweenEasing.QuinticOut = function (k) {
        return --k * k * k * k * k + 1;
    };
    ATweenEasing.QuinticInOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    };
    ATweenEasing.SinusoidalIn = function (k) {
        return 1 - Math.cos(k * Math.PI / 2);
    };
    ATweenEasing.SinusoidalOut = function (k) {
        return Math.sin(k * Math.PI / 2);
    };
    ATweenEasing.SinusoidalInOut = function (k) {
        return 0.5 * (1 - Math.cos(Math.PI * k));
    };
    ATweenEasing.ExponentialIn = function (k) {
        return k == 0 ? 0 : Math.pow(1024, k - 1);
    };
    ATweenEasing.ExponentialOut = function (k) {
        return k == 1 ? 1 : 1 - Math.pow(2, -10 * k);
    };
    ATweenEasing.ExponentialInOut = function (k) {
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
    };
    ATweenEasing.CircularIn = function (k) {
        return 1 - Math.sqrt(1 - k * k);
    };
    ATweenEasing.CircularOut = function (k) {
        return Math.sqrt(1 - (--k * k));
    };
    ATweenEasing.CircularInOut = function (k) {
        if ((k *= 2) < 1) {
            return -0.5 * (Math.sqrt(1 - k * k) - 1);
        }
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    };
    ATweenEasing.ElasticIn = function (k) {
        if (k == 0) {
            return 0;
        }
        if (k == 1) {
            return 1;
        }
        return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
    };
    ATweenEasing.ElasticOut = function (k) {
        if (k == 0) {
            return 0;
        }
        if (k == 1) {
            return 1;
        }
        return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
    };
    ATweenEasing.ElasticInOut = function (k) {
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
    };
    ATweenEasing.BackIn = function (k) {
        var s = 1.70158;
        return k * k * ((s + 1) * k - s);
    };
    ATweenEasing.BackOut = function (k) {
        var s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;
    };
    ATweenEasing.BackInOut = function (k) {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1) {
            return 0.5 * (k * k * ((s + 1) * k - s));
        }
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    };
    ATweenEasing.BounceIn = function (k) {
        return 1 - ATweenEasing.BounceOut(1 - k);
    };
    ATweenEasing.BounceOut = function (k) {
        if (k < (1 / 2.75)) {
            return 7.5625 * k * k;
        }
        else if (k < (2 / 2.75)) {
            return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
        }
        else if (k < (2.5 / 2.75)) {
            return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
        }
        else {
            return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
        }
    };
    ATweenEasing.BounceInOut = function (k) {
        if (k < 0.5) {
            return ATweenEasing.BounceIn(k * 2) * 0.5;
        }
        return ATweenEasing.BounceOut(k * 2 - 1) * 0.5 + 0.5;
    };
    return ATweenEasing;
}());
