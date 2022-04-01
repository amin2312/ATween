"use strict";
/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * ATween - a a easy, fast and tiny tween libary.
 * It use chained call.
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
         * Elapsed percent of tween(unit: millisecond).
         **/
        this.elapsedPercent = 0;
        this._repeatNextStartMs = 0;
        this._repeatTimes = 0;
        this._repeatRefs = 0; // references, reference count
        this._repeatSteps = 0;
        this._repeatDelayMs = 0;
        this._startMs = 0;
        this._delayMs = 0;
        this._durationMs = 1;
        this._onStartCallbackFired = false;
        this._initedTarget = false;
        this._synObj = null;
        this._synSfx = null;
        this._updateSteps = 0;
        this._yoyo = false;
        this._isCompleted = false;
        this._pause = false;
        this._retain = false;
        this._easing = ATweenEasingLinear.None;
        this._interpolation = ATweenInterpolation.Linear;
        /**
         * The callback functions.
         **/
        this._onStartCallback = null;
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
     * Updates all tweens by the specified time(unit: millisecond).
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
            if (ins.pause == false && ins.update(ms) == false) {
                ATween._del(ins);
            }
        }
    };
    /**
     * Kill all tweens.
     * @remarks
     * When the tween is retain, then it will be ignored.
     * @param withComplete Indicates whether to call complete function.
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
     * Kill all tweens of indicated target or sync object.
     * @param target As name mean.
     * @param withComplete Indicates whether to call complete function.
     * @returns Number of killed instances
     */
    ATween.killTweens = function (targetOrSyncObject, withComplete) {
        if (withComplete === void 0) { withComplete = false; }
        var clone = ATween._instances.concat([]);
        var len = clone.length;
        var num = 0;
        for (var i = 0; i < len; i++) {
            var ins = clone[i];
            if (ins._target == targetOrSyncObject || ins._synObj == targetOrSyncObject) {
                ins.cancel(withComplete);
                num++;
            }
        }
        return num;
    };
    /**
     * Check the target is tweening.
     * @param target As name mean.
     * @returns The result.
     */
    ATween.isTweening = function (target) {
        var instances = ATween._instances;
        var len = instances.length;
        for (var i = 0; i < len; i++) {
            var ins = instances[i];
            if (ins._target == target) {
                return true;
            }
        }
        return false;
    };
    /**
     * As name mean.
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
                window.requestAnimationFrame(onFrame);
            }
        }
    };
    /**
     * Create a tween.
     * @remarks
     * Don't reuse the tween instance, it's one-time
     * @param target It must be a object.
     * @param durationMs set duration, not including any repeats or delays.
     * @param delayMs set initial delay which is the length of time in ms before the animation should begin.
     * @returns Tween instance
     */
    ATween.newTween = function (target, durationMs, delayMs) {
        if (delayMs === void 0) { delayMs = 0; }
        ATween.checkInstalled();
        var t = new ATween(target);
        t._durationMs = durationMs;
        t._delayMs = delayMs;
        return t;
    };
    /**
     * Create a once timer.
     * @remarks
     * Don't reuse the tween instance, it's one-time
     * @param intervalMs As name mean(unit:ms)
     * @param onCompleteCallback The callback function when complete.
     * @param onCompleteParams The callback parameters(array) when complete.
     * @returns Tween instance
     */
    ATween.newOnce = function (intervalMs, onCompleteCallback, onCompleteParams) {
        if (onCompleteParams === void 0) { onCompleteParams = null; }
        ATween.checkInstalled();
        var t = new ATween(null);
        t._delayMs = intervalMs;
        t.onComplete(onCompleteCallback, onCompleteParams);
        return t;
    };
    /**
     * Create a timer.
     * @remarks
     * Don't reuse the tween instance, it's one-time
     * @param intervalMs As name mean(unit:ms)
     * @param times Repeat Times(-1 is infinity)
     * @param onRepeatCallback  if return false, then will cancel this timer.
     * @param onCompleteCallback The callback function when complete.
     * @param onCompleteParams The callback parameters(array) when complete.
     * @returns Tween instance
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
        return t;
    };
    /**
     * Start the tween/timer.
     * @returns Tween instance
     */
    ATween.prototype.start = function () {
        ATween._add(this);
        this.elapsedMs = 0;
        this._isCompleted = false;
        this._onStartCallbackFired = false;
        this._repeatNextStartMs = 0;
        this._startMs = this._delayMs;
        if (this._delayMs == 0 && this._target != null) {
            this.initTarget();
        }
        return this;
    };
    /**
     * Init target.
     */
    ATween.prototype.initTarget = function () {
        for (var property in this._dstVals) {
            var curVal = this._target[property];
            var dstVal = this._dstVals[property];
            if (dstVal instanceof Array) {
                if (dstVal.length == 0) {
                    continue;
                }
                this._dstVals[property] = [curVal].concat(dstVal);
            }
            // !! Convert Empty value(null, false, '') to 0
            if (!(curVal instanceof Array)) {
                curVal *= 1.0;
            }
            // create current values set
            if (this._srcVals == null) {
                this._srcVals = {};
            }
            this._srcVals[property] = curVal;
            // create reverse values set
            if (this._revVals == null) {
                this._revVals = {};
            }
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
        var fn = this._easing;
        var ePercent = fn(percent);
        for (var property in this._srcVals) {
            var curVal = this._srcVals[property];
            if (curVal == null) {
                continue;
            }
            var valueA = curVal;
            var valueB = this._dstVals[property];
            if (valueB instanceof Array) {
                this._target[property] = this._interpolation(valueB, ePercent);
            }
            else if ((typeof valueB) == 'number') {
                var startVal = valueA;
                var endVal = valueB;
                var newVal;
                if (percent >= 1) {
                    newVal = endVal;
                }
                else {
                    newVal = startVal + (endVal - startVal) * ePercent;
                }
                this._target[property] = newVal;
                if (this._synObj != null) {
                    this._synObj.style.setProperty(property, newVal + this._synSfx);
                }
            }
            else {
                throw "Unknown destination value" + valueB;
            }
        }
        // [Callback Handler]
        if (ignoreCallback == false && this._onUpdateCallback != null) {
            this._updateSteps++;
            var cb = this._onUpdateCallback;
            cb.call(null, percent, this._updateSteps);
        }
    };
    /**
     * Update tween by ms.
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
        // init target properties
        if (this._target != null && this._initedTarget == false) {
            this.initTarget();
        }
        // [Callback Handler]
        if (this._onStartCallbackFired == false) {
            this._onStartCallbackFired = true;
            if (this._onStartCallback != null) {
                var cbS = this._onStartCallback;
                cbS();
            }
        }
        // update values
        this.elapsedPercent = (this.elapsedMs - this._startMs) / this._durationMs;
        if (this.elapsedPercent > 1) {
            this.elapsedPercent = 1;
        }
        // update target
        this.updateTarget(this.elapsedPercent);
        // end processing
        if (this.elapsedPercent == 1) {
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
                // [Callback Handler]
                if (this._onRepeatCallback != null) {
                    var cbR = this._onRepeatCallback;
                    if (cbR.call(null, this._repeatSteps) === false) {
                        this._repeatRefs = 0;
                    }
                }
            }
            if (this._repeatRefs == 0) {
                this._isCompleted = true;
                // [Callback Handler]
                if (this._onCompleteCallback != null) {
                    var cbC = this._onCompleteCallback;
                    cbC.apply(null, this._onCompleteParams);
                }
                return false;
            }
            return true;
        }
        return true;
    };
    /**
     * Cancel.
     * @param withComplete indicate that whether call complete function.
     * @returns Tween instance
     */
    ATween.prototype.cancel = function (withComplete) {
        if (withComplete === void 0) { withComplete = false; }
        if (this._isCompleted == true || this._retain == true) {
            return;
        }
        this._repeatRefs = 0;
        if (withComplete == true) {
            this.update(0x7FFFFFFF);
        }
        ATween._del(this);
        this._isCompleted = true;
        // [取消回调]
        if (this._onCancelCallback != null) {
            var cb = this._onCancelCallback;
            cb();
        }
    };
    Object.defineProperty(ATween.prototype, "pause", {
        get: function () {
            return this._pause;
        },
        /**
         * Pause.
         */
        set: function (v) {
            this._pause = v;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * The destination value that the target wants to achieve.
     * @param endValus destination values.
     * @returns Tween instance
     */
    ATween.prototype.to = function (endValus) {
        this._dstVals = endValus;
        return this;
    };
    /**
     * Sync the new value to HTMLElement style property.
     * @remarks
     * This method only adapts to the browser environment.
     * @param obj HTMLElement or element id
     * @returns Tween instance
     */
    ATween.prototype.sync = function (obj, unit) {
        if (unit === void 0) { unit = 'px'; }
        var t;
        if (obj instanceof HTMLElement) {
            t = obj;
        }
        else {
            t = document.getElementById(obj);
        }
        this._synObj = t;
        this._synSfx = unit;
        return this;
    };
    /**
     * Set repeat times.
     * @param times As name mean
     * @param yoyo where true causes the tween to go back and forth, alternating backward and forward on each repeat.
     * @param delayMs delay trigger(unit ms).
     * @returns Tween instance
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
     * Immediate call the repeat function.
     * @remark
     * You need init the env in sometimes, then it's a good choice.
     * @returns Tween instance
     */
    ATween.prototype.callRepeat = function () {
        if (this._onRepeatCallback(0) == false) {
            this.release().cancel();
        }
        return this;
    };
    /**
     * Get repeat times.
     */
    ATween.prototype.getRepeatTimes = function () {
        return this._repeatTimes;
    };
    /**
     * Set easing function.
     * @returns Tween instance
     */
    ATween.prototype.easing = function (func) {
        this._easing = func;
        return this;
    };
    /**
     * Keep this tween, killAll has no effect on it.
     * @returns Tween instance
     */
    ATween.prototype.retain = function () {
        this._retain = true;
        return this;
    };
    /**
     * Determine whether the tween is keeping.
     * @returns Tween instance
     */
    ATween.prototype.isRetain = function () {
        return this._retain;
    };
    /**
     * Release the retain tween.
     * @returns Tween instance
     */
    ATween.prototype.release = function () {
        this._retain = false;
        return this;
    };
    /**
     * Set interpolation function.
     * @returns Tween instance
     */
    ATween.prototype.interpolation = function (callback) {
        this._interpolation = callback;
        return this;
    };
    /**
     * Set the callback function when the tween start.
     * @returns Tween instance
     */
    ATween.prototype.onStart = function (callback) {
        this._onStartCallback = callback;
        return this;
    };
    /**
     * Set the callback function when the tween's value has updated.
     * @returns Tween instance
     */
    ATween.prototype.onUpdate = function (callback) {
        this._onUpdateCallback = callback;
        return this;
    };
    /**
     * Set the callback function when the tween is completed.
     * @returns Tween instance
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
     * Set the callback function when the tween is canceled.
     * @returns Tween instance
     */
    ATween.prototype.onCancel = function (callback) {
        this._onCancelCallback = callback;
        return this;
    };
    /**
     * Set the callback function when the tween is repeated.
     * @returns Tween instance
     */
    ATween.prototype.onRepeat = function (callback) {
        this._onRepeatCallback = callback;
        return this;
    };
    /**
     * Determine whether stop all tweens.
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
 * Tween Easing Type - Linear.
 */
var ATweenEasingLinear = /** @class */ (function () {
    function ATweenEasingLinear() {
    }
    ATweenEasingLinear.None = function (k) {
        return k;
    };
    return ATweenEasingLinear;
}());
/**
 * Tween Easing Type - Quadratic.
 */
var ATweenEasingQuadratic = /** @class */ (function () {
    function ATweenEasingQuadratic() {
    }
    ATweenEasingQuadratic.In = function (k) {
        return k * k;
    };
    ATweenEasingQuadratic.Out = function (k) {
        return k * (2 - k);
    };
    ATweenEasingQuadratic.InOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    };
    return ATweenEasingQuadratic;
}());
/**
 * Tween Easing Type - Cubic.
 */
var ATweenEasingCubic = /** @class */ (function () {
    function ATweenEasingCubic() {
    }
    ATweenEasingCubic.In = function (k) {
        return k * k * k;
    };
    ATweenEasingCubic.Out = function (k) {
        return --k * k * k + 1;
    };
    ATweenEasingCubic.InOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k + 2);
    };
    return ATweenEasingCubic;
}());
/**
 * Tween Easing Type - Quartic.
 */
var ATweenEasingQuartic = /** @class */ (function () {
    function ATweenEasingQuartic() {
    }
    ATweenEasingQuartic.In = function (k) {
        return k * k * k * k;
    };
    ATweenEasingQuartic.Out = function (k) {
        return 1 - (--k * k * k * k);
    };
    ATweenEasingQuartic.InOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k * k;
        }
        return -0.5 * ((k -= 2) * k * k * k - 2);
    };
    return ATweenEasingQuartic;
}());
/**
 * Tween Easing Type - Quintic.
 */
var ATweenEasingQuintic = /** @class */ (function () {
    function ATweenEasingQuintic() {
    }
    ATweenEasingQuintic.In = function (k) {
        return k * k * k * k * k;
    };
    ATweenEasingQuintic.Out = function (k) {
        return --k * k * k * k * k + 1;
    };
    ATweenEasingQuintic.InOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    };
    return ATweenEasingQuintic;
}());
/**
 * Tween Easing Type - Sinusoidal.
 */
var ATweenEasingSinusoidal = /** @class */ (function () {
    function ATweenEasingSinusoidal() {
    }
    ATweenEasingSinusoidal.In = function (k) {
        return 1 - Math.cos(k * Math.PI / 2);
    };
    ATweenEasingSinusoidal.Out = function (k) {
        return Math.sin(k * Math.PI / 2);
    };
    ATweenEasingSinusoidal.InOut = function (k) {
        return 0.5 * (1 - Math.cos(Math.PI * k));
    };
    return ATweenEasingSinusoidal;
}());
/**
 * Tween Easing Type - Exponential.
 */
var ATweenEasingExponential = /** @class */ (function () {
    function ATweenEasingExponential() {
    }
    ATweenEasingExponential.In = function (k) {
        return k == 0 ? 0 : Math.pow(1024, k - 1);
    };
    ATweenEasingExponential.Out = function (k) {
        return k == 1 ? 1 : 1 - Math.pow(2, -10 * k);
    };
    ATweenEasingExponential.InOut = function (k) {
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
    return ATweenEasingExponential;
}());
/**
 * Tween Easing Type - Circular.
 */
var ATweenEasingCircular = /** @class */ (function () {
    function ATweenEasingCircular() {
    }
    ATweenEasingCircular.In = function (k) {
        return 1 - Math.sqrt(1 - k * k);
    };
    ATweenEasingCircular.Out = function (k) {
        return Math.sqrt(1 - (--k * k));
    };
    ATweenEasingCircular.InOut = function (k) {
        if ((k *= 2) < 1) {
            return -0.5 * (Math.sqrt(1 - k * k) - 1);
        }
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    };
    return ATweenEasingCircular;
}());
/**
 * Tween Easing Type - Elastic.
 */
var ATweenEasingElastic = /** @class */ (function () {
    function ATweenEasingElastic() {
    }
    ATweenEasingElastic.In = function (k) {
        if (k == 0) {
            return 0;
        }
        if (k == 1) {
            return 1;
        }
        return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
    };
    ATweenEasingElastic.Out = function (k) {
        if (k == 0) {
            return 0;
        }
        if (k == 1) {
            return 1;
        }
        return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
    };
    ATweenEasingElastic.InOut = function (k) {
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
    return ATweenEasingElastic;
}());
/**
 * Tween Easing Type - Back.
 */
var ATweenEasingBack = /** @class */ (function () {
    function ATweenEasingBack() {
    }
    ATweenEasingBack.In = function (k) {
        var s = 1.70158;
        return k * k * ((s + 1) * k - s);
    };
    ATweenEasingBack.Out = function (k) {
        var s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;
    };
    ATweenEasingBack.InOut = function (k) {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1) {
            return 0.5 * (k * k * ((s + 1) * k - s));
        }
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    };
    return ATweenEasingBack;
}());
/**
 * Tween Easing Type - Bounce.
 */
var ATweenEasingBounce = /** @class */ (function () {
    function ATweenEasingBounce() {
    }
    ATweenEasingBounce.In = function (k) {
        return 1 - ATweenEasingBounce.Out(1 - k);
    };
    ATweenEasingBounce.Out = function (k) {
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
    ATweenEasingBounce.InOut = function (k) {
        if (k < 0.5) {
            return ATweenEasingBounce.In(k * 2) * 0.5;
        }
        return ATweenEasingBounce.Out(k * 2 - 1) * 0.5 + 0.5;
    };
    return ATweenEasingBounce;
}());
/**
 * Tween Interpolation.
 */
var ATweenInterpolation = /** @class */ (function () {
    function ATweenInterpolation() {
    }
    ATweenInterpolation.Linear = function (v, k) {
        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);
        var fn = ATweenInterpolationUtils.Linear;
        if (k < 0) {
            return fn(v[0], v[1], f);
        }
        if (k > 1) {
            return fn(v[m], v[m - 1], m - f);
        }
        return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
    };
    ATweenInterpolation.Bezier = function (v, k) {
        var b = 0;
        var n = v.length - 1;
        var pw = Math.pow;
        var bn = ATweenInterpolationUtils.Bernstein;
        for (var i = 0; i < n; i++) {
            b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
        }
        return b;
    };
    ATweenInterpolation.CatmullRom = function (v, k) {
        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);
        var fn = ATweenInterpolationUtils.CatmullRom;
        if (v[0] == v[m]) {
            if (k < 0) {
                i = Math.floor(f = m * (1 + k));
            }
            return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
        }
        else {
            if (k < 0) {
                return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
            }
            if (k > 1) {
                return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            }
            return fn(v[i != 0 ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
        }
    };
    return ATweenInterpolation;
}());
/**
 * Tween Interpolation Utils.
 */
var ATweenInterpolationUtils = /** @class */ (function () {
    function ATweenInterpolationUtils() {
    }
    ATweenInterpolationUtils.Linear = function (p0, p1, t) {
        return (p1 - p0) * t + p0;
    };
    ATweenInterpolationUtils.Bernstein = function (n, i) {
        var fc = ATweenInterpolationUtils.Factorial;
        return fc(n) / fc(i) / fc(n - i);
    };
    ATweenInterpolationUtils.Factorial = function (n) {
        var s = 1;
        if (ATweenInterpolationUtils.a[n] != 0) {
            return ATweenInterpolationUtils.a[n];
        }
        var i = n;
        while (i > 1) {
            s *= i;
            i--;
        }
        ATweenInterpolationUtils.a[n] = s;
        return s;
    };
    ATweenInterpolationUtils.CatmullRom = function (p0, p1, p2, p3, t) {
        var v0 = (p2 - p0) * 0.5;
        var v1 = (p3 - p1) * 0.5;
        var t2 = t * t;
        var t3 = t * t2;
        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
    };
    ATweenInterpolationUtils.a = [1];
    return ATweenInterpolationUtils;
}());
