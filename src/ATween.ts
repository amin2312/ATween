/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * ATween - a a easy, fast and tiny tween libary.
 * It use chained call.
 */
class ATween
{
    /**
     * Determine whether stop all tweens.
     */
    public static stop: boolean = false;
    /**
     * The manager for all tween instances.
     */
    private static _instances: Array<ATween> = new Array<ATween>();
    /**
     * Indicates whether has installed in current environment.
     */
    private static _isInstalled: boolean = false;
    /**
     * Elapsed time of tween(unit: millisecond).
     **/
    public elapsedMs: number = 0;
    /**
     * Elapsed percent of tween(unit: millisecond).
     **/
    public elapsedPercent: number = 0;
    /**
     * Params of tween.
     */
    private _target: any;
    private _initedTarget: boolean = false;
    private _srcVals: { [key: string]: (number | number[]) };
    private _dstVals: { [key: string]: (number | number[]) };
    private _revVals: any;

    private _syncObj: HTMLElement = null;
    private _syncCnv: (v: number) => any = null;

    private _attachment: any = null;

    private _repeatNextStartMs: number = 0;
    private _repeatRefs: number = 0; // references, reference count
    private _repeatSteps: number = 0;
    private _repeatDelayMs: number = 0;
    private _updateSteps: number = 0;

    private _startMs: number = 0;
    private _delayMs: number = 0;
    private _durationMs: number = 1;
    private _repeatTimes: number = 0;
    private _yoyo: boolean = false;
    private _isCompleted = false;
    private _pause: boolean = false;
    private _retain: boolean = false;
    private _easing: (k: number) => number = ATweenEasing.Linear;
    private _interpolation: (v: Array<any>, k: number) => number = ATweenInterpolation.Linear;
    /**
     * The callback functions.
     **/
    private _onStartCallback: () => void = null;
    private _onStartCallbackFired: boolean = false;
    private _onUpdateCallback: (percent: number, times: number) => void = null;
    private _onCancelCallback: () => void = null;
    private _onCompleteCallback: (...argArray: any[]) => void = null;
    private _onCompleteParams: Array<any> = null;
    private _onRepeatCallback: (times: number) => boolean = null;
    /**
     * Add a tween to global manager.
     */
    private static _add(ins: ATween): void
    {
        ATween._instances.push(ins);
    }
    /**
     * Delete a tween from global manager.
     */
    private static _del(ins: ATween): void
    {
        var i = ATween._instances.indexOf(ins);
        if (i != -1)
        {
            ATween._instances.splice(i, 1);
        }
    }
    /**
     * Updates all tweens by the specified time(unit: millisecond).
     */
    public static updateAll(ms: number): void
    {
        if (ATween._instances.length == 0)
        {
            return;
        }
        if (ATween.stop == true)
        {
            return;
        }
        var clone = ATween._instances.concat([]);
        var len = clone.length;
        for (var i = 0; i < len; i++)
        {
            var ins = clone[i];
            if (ins._pause == false && ins.update(ms) == false)
            {
                ATween._del(ins);
            }
        }
    }
    /**
     * Kill all tweens.
     * @remarks
     * When the tween is retain, then it will be ignored.
     * @param withComplete Indicates whether to call complete function.
     */
    public static killAll(withComplete: boolean = false): void
    {
        var clone = ATween._instances.concat([]);
        var len = clone.length;
        for (var i = 0; i < len; i++)
        {
            var ins = clone[i];
            ins.cancel(withComplete);
        }
    }
    /**
     * Kill all tweens of indicated target or sync object.
     * @param target As name mean.
     * @param withComplete Indicates whether to call complete function.
     * @returns Number of killed instances
     */
    public static killTweens(targetOrSyncObject: any, withComplete: boolean = false): number
    {
        var clone = ATween._instances.concat([]);
        var len = clone.length;
        var num = 0;
        for (var i = 0; i < len; i++)
        {
            var ins = clone[i];
            if (ins._target == targetOrSyncObject || ins._syncObj == targetOrSyncObject)
            {
                ins.cancel(withComplete);
                num++;
            }
        }
        return num;
    }
    /**
     * Check the target is tweening.
     * @param target As name mean. 
     * @returns The result.
     */
    public static isTweening(target: any): boolean
    {
        var instances = ATween._instances;
        var len = instances.length;
        for (var i = 0; i < len; i++)
        {
            var ins = instances[i];
            if (ins._target == target)
            {
                return true;
            }
        }
        return false;
    }
    /**
     * Constructor.
     */
    constructor(target: any)
    {
        this._target = target;
    }
    /**
     * As name mean.
     */
    private static checkInstalled(): void
    {
        if (!ATween._isInstalled)
        {
            ATween._isInstalled = true;
            if (window != null && window.requestAnimationFrame != null)
            {
                var lastTime = 0;
                var onFrame = function (now: DOMHighResTimeStamp): void
                {
                    var ms = now - lastTime;
                    lastTime = now;
                    ATween.updateAll(ms);
                    window.requestAnimationFrame(onFrame);
                }
                lastTime = window.performance.now();
                window.requestAnimationFrame(onFrame);
            }
        }
    }
    /**
     * Create a tween.
     * @remarks
     * Don't reuse the tween instance, it's one-time
     * @param target It must be a object. 
     * @param durationMs set duration, not including any repeats or delays.
     * @param delayMs set initial delay which is the length of time in ms before the animation should begin.
     * @returns Tween instance
     */
    public static newTween(target: any, durationMs: number, delayMs: number = 0): ATween
    {
        ATween.checkInstalled();
        var t = new ATween(target);
        t._durationMs = durationMs;
        t._delayMs = delayMs;
        return t;
    }
    /**
     * Create a once timer.
     * @remarks
     * Don't reuse the tween instance, it's one-time
     * @param intervalMs As name mean(unit:ms)
     * @param onCompleteCallback The callback function when complete.
     * @param onCompleteParams The callback parameters(array) when complete.
     * @returns Tween instance
     */
    public static newOnce(intervalMs: number, onCompleteCallback: any, onCompleteParams: Array<any> = null): ATween
    {
        ATween.checkInstalled();
        var t = new ATween(null);
        t._delayMs = intervalMs;
        t.onComplete(onCompleteCallback, onCompleteParams);
        return t;
    }
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
    public static newTimer(intervalMs: number, times: number, onRepeatCallback: (steps: number) => boolean, onCompleteCallback: any = null, onCompleteParams: Array<any> = null): ATween
    {
        ATween.checkInstalled();
        var t = new ATween(null);
        t._delayMs = intervalMs;
        t.repeat(times);
        t.onRepeat(onRepeatCallback);
        t.onComplete(onCompleteCallback, onCompleteParams);
        return t;
    }
    /**
     * Start the tween/timer.
     * @returns Tween instance
     */
    public start(): ATween
    {
        ATween._add(this);

        this.elapsedMs = 0;
        this._isCompleted = false;
        this._onStartCallbackFired = false;
        this._repeatNextStartMs = 0;
        this._startMs = this._delayMs;
        if (this._delayMs == 0 && this._target != null)
        {
            this.initTarget();
        }
        return this;
    }
    /**
     * Init target.
     */
    private initTarget(): void
    {
        for (var property in this._dstVals)
        {
            var curVal: any = this._target[property];
            var dstVal: any = this._dstVals[property];
            if (dstVal instanceof Array)
            {
                if (dstVal.length == 0)
                {
                    continue;
                }
                this._dstVals[property] = [curVal].concat(dstVal);
            }
            // !! Convert Empty value(null, false, '') to 0
            if (!(curVal instanceof Array))
            {
                curVal *= 1.0;
            }
            // create current values set
            if (this._srcVals == null)
            {
                this._srcVals = {};
            }
            this._srcVals[property] = curVal;
            // create reverse values set
            if (this._revVals == null)
            {
                this._revVals = {};
            }
            this._revVals[property] = curVal;
        }
        this._initedTarget = true;
    }
    /**
     * Update target.
     **/
    private updateTarget(percent: number, ignoreCallback: boolean = false): void
    {
        if (this._target == null)
        {
            return;
        }
        var fn = this._easing;
        var ePercent = fn(percent);
        for (var property in this._srcVals)
        {
            var curVal = this._srcVals[property];
            if (curVal == null)
            {
                continue;
            }
            var valueA = curVal;
            var valueB = this._dstVals[property];
            if (valueB instanceof Array)
            {
                this._target[property] = this._interpolation(valueB, ePercent);
            }
            else if ((typeof valueB) == 'number')
            {
                var startVal: number = valueA as number;
                var endVal: number = valueB;
                var newVal: number;
                if (percent >= 1)
                {
                    newVal = endVal;
                }
                else
                {
                    newVal = startVal + (endVal - startVal) * ePercent;
                }
                this._target[property] = newVal;
                if (this._syncObj != null)
                {
                    var cnvVal: any = newVal;
                    if (this._syncCnv != null)
                    {
                        cnvVal = this._syncCnv(newVal);
                    }
                    this._syncObj.style.setProperty(property, cnvVal);
                }
            }
            else
            {
                throw "Unknown destination value" + valueB;
            }
        }
        // [Callback Handler]
        if (ignoreCallback == false && this._onUpdateCallback != null)
        {
            this._updateSteps++;
            var cb = this._onUpdateCallback;
            cb.call(this, percent, this._updateSteps);
        }
    }
    /**
     * Update tween by ms.
     */
    public update(ms: number): boolean
    {
        this.elapsedMs += ms;
        if (this._repeatNextStartMs != 0)
        {
            if (this.elapsedMs >= this._repeatNextStartMs)
            {
                this._repeatNextStartMs = 0;
                if (this._yoyo == false)
                {
                    this.updateTarget(0);
                }
            }
        }
        if (this.elapsedMs < this._startMs)
        {
            return true;
        }
        // init target properties
        if (this._target != null && this._initedTarget == false)
        {
            this.initTarget();
        }
        // [Callback Handler]
        if (this._onStartCallbackFired == false)
        {
            this._onStartCallbackFired = true;
            if (this._onStartCallback != null)
            {
                var cbS = this._onStartCallback;
                cbS.call(this);
            }
        }
        // update values
        this.elapsedPercent = (this.elapsedMs - this._startMs) / this._durationMs;
        if (this.elapsedPercent > 1)
        {
            this.elapsedPercent = 1;
        }
        // update target
        this.updateTarget(this.elapsedPercent);
        // end processing
        if (this.elapsedPercent == 1)
        {
            if (this._repeatRefs != 0)
            {
                this._repeatSteps++;
                this._repeatRefs--;
                // reset target properties
                if (this._target != null)
                {
                    for (var property in this._revVals)
                    {
                        var valueB = this._dstVals[property];
                        if (this._yoyo == true)
                        {
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
                if (this._onRepeatCallback != null)
                {
                    var cbR = this._onRepeatCallback;
                    if (cbR.call(this, this._repeatSteps) === false)
                    {
                        this._repeatRefs = 0;
                    }
                }
            }
            if (this._repeatRefs == 0)
            {
                this._isCompleted = true;
                // [Callback Handler]
                if (this._onCompleteCallback != null)
                {
                    var cbC = this._onCompleteCallback;
                    cbC.apply(this, this._onCompleteParams);
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
    public cancel(withComplete: boolean = false): void
    {
        if (this._isCompleted == true || this._retain == true)
        {
            return;
        }
        this._repeatRefs = 0;
        if (withComplete == true)
        {
            this.update(0x7FFFFFFF);
        }
        ATween._del(this);
        this._isCompleted = true;
        // [取消回调]
        if (this._onCancelCallback != null)
        {
            var cb = this._onCancelCallback;
            cb.call(this);
        }
    }
    /**
     * The destination value that the target wants to achieve.
     * @param endValus destination values.
     * @returns Tween instance
     */
    public to(endValus: any): ATween
    {
        this._dstVals = endValus;
        return this;
    }
    /**
     * Sync the new value to HTMLElement style property.
     * @remarks
     * This method only adapts to the browser environment.
     * @param obj HTMLElement or element id
     * @param convert the tween value convertor of ojb(like number to RGB, to px unit)
     * @returns Tween instance
     */
    public sync(obj: HTMLElement | string, convert: (v: number) => any = ATweenConvertor.def): ATween
    {
        var t: HTMLElement;
        if (obj instanceof HTMLElement)
        {
            t = obj;
        }
        else
        {
            t = document.getElementById(obj);
        }
        this._syncObj = t;
        this._syncCnv = convert;
        return this;
    }
    /**
     * Attah a object.
     */
    public attah(obj: any): ATween
    {
        this._attachment = obj;
        return this;
    }
    /**
     * Set repeat times.
     * @param times As name mean
     * @param yoyo where true causes the tween to go back and forth, alternating backward and forward on each repeat.
     * @param delayMs delay trigger(unit ms).
     * @returns Tween instance
     */
    public repeat(times: number, yoyo: boolean = false, delayMs: number = 0): ATween
    {
        this._yoyo = yoyo;
        this._repeatTimes = times;
        this._repeatRefs = times;
        this._repeatDelayMs = delayMs;
        return this;
    }
    /**
     * Immediate call the repeat function.
     * @remark
     * You need init the env in sometimes, then it's a good choice.
     * @returns Tween instance
     */
    public callRepeat(): ATween
    {
        if (this._onRepeatCallback(0) == false)
        {
            this.release().cancel();
        }
        return this;
    }
    /**
     * Set easing function.
     * @returns Tween instance
     */
    public easing(func: (v: number) => number): ATween
    {
        this._easing = func;
        return this;
    }
    /**
     * Keep this tween, killAll has no effect on it.
     * @returns Tween instance
     */
    public retain(): ATween
    {
        this._retain = true;
        return this;
    }
    /**
     * Release the retain tween.
     * @returns Tween instance
     */
    public release(): ATween
    {
        this._retain = false;
        return this;
    }
    /**
     * Set interpolation function.
     * @returns Tween instance
     */
    public interpolation(callback: (v: Array<any>, k: number) => number): ATween
    {
        this._interpolation = callback;
        return this;
    }
    /**
     * Determine whether the tween is keeping.
     * @returns Tween instance
     */
    public isRetain(): boolean
    {
        return this._retain;
    }
    /**
     * Pause.
     */
    public setPause(v: boolean)
    {
        this._pause = v;
    }
    public getPause(): boolean
    {
        return this._pause;
    }
    /**
     * Get repeat times.
     */
    public getRepeatTimes(): number
    {
        return this._repeatTimes;
    }
    /**
     * Get target.
     */
    public getTarget(): any
    {
        return this._target;
    }
    /**
     * Get sync object.
     */
    public getSyncObject(): any
    {
        return this._syncObj;
    }
    /**
     * Get attachment.
     */
    public getAttachment(): any
    {
        return this._attachment;
    }
    /**
     * Set the callback function when the tween start.
     * @returns Tween instance
     */
    public onStart(callback: () => void): ATween
    {
        this._onStartCallback = callback;
        return this;
    }
    /**
     * Set the callback function when the tween's value has updated.
     * @returns Tween instance
     */
    public onUpdate(callback: (percent: number, times: number) => void): ATween
    {
        this._onUpdateCallback = callback;
        return this;
    }
    /**
     * Set the callback function when the tween is completed.
     * @returns Tween instance
     */
    public onComplete(callback: (...argArray: any[]) => void, params: Array<any> = null): ATween
    {
        this._onCompleteCallback = callback;
        this._onCompleteParams = params;
        if (this._onCompleteParams != null)
        {
            this._onCompleteParams = this._onCompleteParams.concat([]);
        }
        return this;
    }
    /**
     * Set the callback function when the tween is canceled.
     * @returns Tween instance
     */
    public onCancel(callback: () => void): ATween
    {
        this._onCancelCallback = callback;
        return this;
    }
    /**
     * Set the callback function when the tween is repeated.
     * @returns Tween instance
     */
    public onRepeat(callback: (steps: number) => boolean): ATween
    {
        this._onRepeatCallback = callback;
        return this;
    }
}
/**
 * Tween Sync Value Convertor.
 */
class ATweenConvertor
{
    /**
     * Default convert function
     */
    public static def(v: number): any
    {
        return v + 'px';
    }
    /**
     * RGB convert function
     */
    public static rgb(v: number): any
    {
        var s = Math.round(v).toString(16);
        for (var i = s.length; i < 6; i++)
        {
            s = '0' + s;
        }
        return "#" + s;
    }
}

/**
 * Tween Easing.
 */
class ATweenEasing
{
    /**
     * Linear
     */
    public static Linear(k: number): number
    {
        return k;
    }
    /**
     * Quadratic
     */
    public static QuadraticIn(k: number): number
    {
        return k * k;
    }
    public static QuadraticOut(k: number): number
    {
        return k * (2 - k);
    }
    public static QuadraticInOut(k: number): number
    {
        if ((k *= 2) < 1)
        {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    }
    /**
     * Cubic
     */
    public static CubicIn(k: number): number
    {
        return k * k * k;
    }
    public static CubicOut(k: number): number
    {
        return --k * k * k + 1;
    }
    public static CubicInOut(k: number): number
    {
        if ((k *= 2) < 1)
        {
            return 0.5 * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k + 2);
    }
    /**
     * Quartic.
     */
    public static QuarticIn(k: number): number
    {
        return k * k * k * k;
    }
    public static QuarticOut(k: number): number
    {
        return 1 - (--k * k * k * k);
    }
    public static QuarticInOut(k: number): number
    {
        if ((k *= 2) < 1)
        {
            return 0.5 * k * k * k * k;
        }
        return -0.5 * ((k -= 2) * k * k * k - 2);
    }
    /**
     * Quintic.
     */
    public static QuinticIn(k: number): number
    {
        return k * k * k * k * k;
    }
    public static QuinticOut(k: number): number
    {
        return --k * k * k * k * k + 1;
    }
    public static QuinticInOut(k: number): number
    {
        if ((k *= 2) < 1)
        {
            return 0.5 * k * k * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    }
    /**
     * Sinusoidal.
     */
    public static SinusoidalIn(k: number): number
    {
        return 1 - Math.cos(k * Math.PI / 2);
    }
    public static SinusoidalOut(k: number): number
    {
        return Math.sin(k * Math.PI / 2);
    }
    public static SinusoidalInOut(k: number): number
    {
        return 0.5 * (1 - Math.cos(Math.PI * k));
    }
    /**
     * Exponential.
     */
    public static ExponentialIn(k: number): number
    {
        return k == 0 ? 0 : Math.pow(1024, k - 1);
    }
    public static ExponentialOut(k: number): number
    {
        return k == 1 ? 1 : 1 - Math.pow(2, -10 * k);
    }
    public static ExponentialInOut(k: number): number
    {
        if (k == 0)
        {
            return 0;
        }
        if (k == 1)
        {
            return 1;
        }
        if ((k *= 2) < 1)
        {
            return 0.5 * Math.pow(1024, k - 1);
        }
        return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
    }
    /**
     * Circular.
     */
    public static CircularIn(k: number): number
    {
        return 1 - Math.sqrt(1 - k * k);
    }
    public static CircularOut(k: number): number
    {
        return Math.sqrt(1 - (--k * k));
    }
    public static CircularInOut(k: number): number
    {
        if ((k *= 2) < 1)
        {
            return -0.5 * (Math.sqrt(1 - k * k) - 1);
        }
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    }
    /**
     * Elastic.
     */
    public static ElasticIn(k: number): number
    {
        if (k == 0)
        {
            return 0;
        }
        if (k == 1)
        {
            return 1;
        }
        return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
    }
    public static ElasticOut(k: number): number
    {
        if (k == 0)
        {
            return 0;
        }
        if (k == 1)
        {
            return 1;
        }
        return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
    }
    public static ElasticInOut(k: number): number
    {
        if (k == 0)
        {
            return 0;
        }
        if (k == 1)
        {
            return 1;
        }
        k *= 2;
        if (k < 1)
        {
            return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
        }
        return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
    }
    /**
     * Back.
     */
    public static BackIn(k: number): number
    {
        var s = 1.70158;
        return k * k * ((s + 1) * k - s);
    }
    public static BackOut(k: number): number
    {
        var s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;
    }
    public static BackInOut(k: number): number
    {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1)
        {
            return 0.5 * (k * k * ((s + 1) * k - s));
        }
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    }
    /**
     * Bounce.
     */
    public static BounceIn(k: number): number
    {
        return 1 - ATweenEasing.BounceOut(1 - k);
    }
    public static BounceOut(k: number): number
    {
        if (k < (1 / 2.75))
        {
            return 7.5625 * k * k;
        }
        else if (k < (2 / 2.75))
        {
            return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
        }
        else if (k < (2.5 / 2.75))
        {
            return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
        }
        else
        {
            return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
        }
    }
    public static BounceInOut(k: number): number
    {
        if (k < 0.5)
        {
            return ATweenEasing.BounceIn(k * 2) * 0.5;
        }
        return ATweenEasing.BounceOut(k * 2 - 1) * 0.5 + 0.5;
    }
}
/**
 * Tween Interpolation.
 */
class ATweenInterpolation
{
    public static Linear(v: Array<any>, k: number): number
    {
        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);
        var fn = ATweenInterpolationUtils.Linear;
        if (k < 0)
        {
            return fn(v[0], v[1], f);
        }
        if (k > 1)
        {
            return fn(v[m], v[m - 1], m - f);
        }
        return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
    }
    public static Bezier(v: Array<any>, k: number): number
    {
        var b: number = 0;
        var n = v.length - 1;
        var pw = Math.pow;
        var bn = ATweenInterpolationUtils.Bernstein;
        for (var i = 0; i < n; i++)
        {
            b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
        }
        return b;
    }
    public static CatmullRom(v: Array<any>, k: number): number
    {
        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);
        var fn = ATweenInterpolationUtils.CatmullRom;
        if (v[0] == v[m])
        {
            if (k < 0)
            {
                i = Math.floor(f = m * (1 + k));
            }
            return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
        }
        else
        {
            if (k < 0)
            {
                return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
            }
            if (k > 1)
            {
                return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            }
            return fn(v[i != 0 ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
        }
    }
}
/**
 * Tween Interpolation Utils.
 */
class ATweenInterpolationUtils
{
    private static a = [1];
    public static Linear(p0: number, p1: number, t: number): number
    {
        return (p1 - p0) * t + p0;
    }
    public static Bernstein(n: number, i: number): number
    {
        var fc = ATweenInterpolationUtils.Factorial;
        return fc(n) / fc(i) / fc(n - i);
    }
    public static Factorial(n: number): number
    {
        var s: number = 1;
        if (ATweenInterpolationUtils.a[n] != 0)
        {
            return ATweenInterpolationUtils.a[n];
        }
        var i = n;
        while (i > 1)
        {
            s *= i;
            i--;
        }
        ATweenInterpolationUtils.a[n] = s;
        return s;
    }
    public static CatmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number
    {
        var v0 = (p2 - p0) * 0.5;
        var v1 = (p3 - p1) * 0.5;
        var t2 = t * t;
        var t3 = t * t2;
        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
    }
}
