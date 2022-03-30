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
    private _valuesA: any;
    private _valuesB: any;
    private _valuesR: any;

    private _repeatTimes0: number = 0;
    private _repeatTimes1: number = 0;
    private _repeatDelayMs: number = 0;

    private _startMs: number = 0;
    private _delayMs: number = 0;
    private _durationMs: number = 1;
    private _repeatOverMs: number = 0;
    private _repeatedTimes: number = 0;

    private _onStartCallbackFired: boolean = false;
    private _initedTarget: boolean = false;
    private _yoyo: boolean = false;
    private _isCompleted = false;
    private _pause: boolean = false;
    private _retain: boolean = false;
    private _easing: (k: number) => number = ATweenEasingLinear.None;
    private _interpolation: (v: Array<any>, k: number) => number = ATweenInterpolation.Linear;
    /**
     * The callback functions.
     **/
    private _onStartCallback: () => void = null;
    private _onUpdateCallback: any = null;
    private _onCancelCallback: any = null;
    private _onCompleteCallback: any = null;
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
        var instances: Array<ATween> = ATween._instances.concat([]);
        for (var ins of instances)
        {
            if (ins.pause == false && ins.update(ms) == false)
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
    public static killAll(withComplete: boolean): void
    {
        var instances: Array<ATween> = ATween._instances.concat([]);
        for (var i = 0; i < instances.length; i++)
        {
            instances[i].cancel(withComplete);
        }
    }
    /**
     * Kill all tweens of indicated target.
     * @param target The tween target object. 
     * @param withComplete Indicates whether to call complete function.
     */
    public static killTweens(target: any, withComplete: boolean = false): void
    {
        var clone: Array<ATween> = ATween._instances.concat([]);
        for (var i = 0; i < clone.length; i++)
        {
            var ins = clone[i];
            if (ins._target == target)
            {
                ins.cancel(withComplete);
            }
        }
    }
    /**
     * Check the target is tweening.
     * @param target The tween target object. 
     */
    public static isTweening(target: any): boolean
    {
        for (var i = 0; i < ATween._instances.length; i++)
        {
            var ins = ATween._instances[i];
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
     * Create a tween.
     * @param target It must be a object. 
     * @param durationMs set duration, not including any repeats or delays.
     * @param delayMs set initial delay which is the length of time in ms before the animation should begin.
     */
    public static newTween(target: any, durationMs: number, delayMs: number = 0): ATween
    {
        var t = new ATween(target);
        t._durationMs = durationMs;
        t._delayMs = delayMs;
        return t;
    }
    /**
     * Create a timer.
     * @param delayMs The triggered delay time.
     * @param onCompleteCallback The callback function when complete.
     * @param onCompleteParams The callback parameters(array) when complete.
     */
    public static newTimeout(delayMs: number, onCompleteCallback: any, onCompleteParams: Array<any> = null): ATween
    {
        var t = new ATween(null);
        t._delayMs = delayMs;
        t.onComplete(onCompleteCallback, onCompleteParams);
        t.start();
        return t;
    }
    /**
     * Create a repeat timer.
     * @remarks
     * When you user onRepeatCallback parameter, It wiil take back the time count, if return false, then will cancel this timer.
     * @param delayMs The triggered delay time.
     * @param repeatTimes Repeat Times.
     * @param onRepeatCallback The callback parameters when repeat.
     * @param onCompleteCallback The callback function when complete.
     * @param onCompleteParams The callback parameters(array) when complete.
     **/
    public static newRepeat(delayMs: number, repeatTimes: number, onRepeatCallback: (times: number) => boolean, onCompleteCallback: any = null, onCompleteParams: Array<any> = null): ATween
    {
        var t = new ATween(null);
        t._delayMs = delayMs;
        t.repeat(repeatTimes);
        t.onRepeat(onRepeatCallback);
        t.onComplete(onCompleteCallback, onCompleteParams);
        t.start();
        return t;
    }
    /**
     * Start the tween/timer.
     */
    public start(): ATween
    {
        ATween._add(this);

        this._isCompleted = false;
        this._onStartCallbackFired = false;
        this._repeatOverMs = 0;
        this._startMs = this._delayMs;
        this.elapsedMs = 0;
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
        for (var property in this._valuesB)
        {
            var curVal: any = this._target[property];
            var valueB: any = this._valuesB[property];
            if (valueB instanceof Array)
            {
                if (valueB.length == 0)
                {
                    continue;
                }
                this._valuesB[property] = [curVal].concat(valueB);
            }
            if (curVal == null)
            {
                continue;
            }
            // check current value type
            if (!(curVal instanceof Array))
            {
                curVal *= 1.0; // convert Empty value(null, false, '') to 0
            }
            // create A
            if (this._valuesA == null)
            {
                this._valuesA = {};
            }
            this._valuesA[property] = curVal;
            // create (R))everse
            if (this._valuesR == null)
            {
                this._valuesR = {};
            }
            if (curVal != null)
            {
                this._valuesR[property] = curVal;
            }
            else
            {
                this._valuesR[property] = 0;
            }
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
        var newValue = fn(percent);
        for (var property in this._valuesA)
        {
            var valueA = this._valuesA[property];
            if (valueA == null)
            {
                continue;
            }
            var start = valueA;
            var end = this._valuesB[property];
            if (end instanceof Array)
            {
                this._target[property] = this._interpolation(end, newValue);
            }
            else if ((typeof end) == 'number')
            {
                var endNum: number = end;
                var finVal: number;
                if (percent >= 1)
                {
                    finVal = endNum;
                }
                else
                {
                    finVal = start + (endNum - start) * newValue;
                }
                this._target[property] = finVal;
            }
        }
        // [Callback Handler]
        if (ignoreCallback == false && this._onUpdateCallback != null)
        {
            var cb = this._onUpdateCallback;
            cb.apply(null, [percent, newValue]);
        }
    }
    /**
     * Update tween by ms.
     */
    public update(ms: number): boolean
    {
        this.elapsedMs += ms;
        if (this._repeatOverMs != 0)
        {
            if (this.elapsedMs >= this._repeatOverMs)
            {
                this._repeatOverMs = 0;
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
                cbS.call(null);
            }
        }
        // update values
        this.elapsedPercent = (this.elapsedMs - this._startMs) / this._durationMs;
        this.elapsedPercent = this.elapsedPercent > 1 ? 1 : this.elapsedPercent;
        // update target
        this.updateTarget(this.elapsedPercent);
        // end processing
        if (this.elapsedPercent == 1)
        {
            if (this._repeatTimes1 > 0)
            {
                this._repeatedTimes++;
                if (isFinite(this._repeatTimes1) == true)
                {
                    this._repeatTimes1--;
                }
                // update target properties
                if (this._target != null)
                {
                    for (var property in this._valuesR)
                    {
                        var valueB = this._valuesB[property];
                        if (typeof (valueB) == 'string')
                        {
                            this._valuesR[property] = this._valuesR[property] + parseFloat(valueB);
                        }
                        if (this._yoyo == true)
                        {
                            var tmp = this._valuesR[property];
                            this._valuesR[property] = valueB;
                            this._valuesB[property] = tmp;
                        }
                        this._valuesA[property] = this._valuesR[property];
                    }
                }
                // reset values
                this._repeatOverMs = this.elapsedMs + this._repeatDelayMs;
                this._startMs = this.elapsedMs + this._repeatDelayMs + this._delayMs;
                // [Callback Handler]
                if (this._onRepeatCallback != null)
                {
                    var cbR = this._onRepeatCallback;
                    if (cbR.call(null, this._repeatedTimes) == false)
                    {
                        this._repeatTimes1 = 0;
                    }
                }
            }
            if (this._repeatTimes1 <= 0)
            {
                this._isCompleted = true;
                // [Callback Handler]
                if (this._onCompleteCallback != null)
                {
                    var cbC = this._onCompleteCallback;
                    cbC.apply(null, this._onCompleteParams);
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
     */
    public cancel(withComplete: boolean = false)
    {
        if (this._isCompleted == true || this._retain == true)
        {
            return this;
        }
        if (withComplete == true)
        {
            this.update(this._startMs + this._delayMs + this._durationMs);
        }
        ATween._del(this);
        this._isCompleted = true;
        // [取消回调]
        if (this._onCancelCallback != null)
        {
            var cb = this._onCancelCallback;
            cb.call();
        }
        return this;
    }
    /**
     * Pause.
     */
    public set pause(v: boolean)
    {
        this._pause = v;
    }
    public get pause(): boolean
    {
        return this._pause;
    }
    /**
     * To.
     */
    public to(properties: any): ATween
    {
        this._valuesB = properties;
        return this;
    }
    /**
     * Enhanced To function.
     */
    public toAlpha(v: number): ATween
    {
        return this.to({ alpha: v });
    }
    /**
     * Enhanced To function.
     */
    public toX(v: number): ATween
    {
        return this.to({ x: v });
    }
    /**
     * Enhanced To function.
     */
    public toY(v: number): ATween
    {
        return this.to({ y: v });
    }
    /**
     * Enhanced To function.
     */
    public toXY(a: number, b: number): ATween
    {
        return this.to({ x: a, y: b });
    }
    /**
     * Set repeat times.
     * @param times As name mean
     * @param yoyo where true causes the tween to go back and forth, alternating backward and forward on each repeat.
     * @param delayMs delay trigger(unit ms).
     */
    public repeat(times: number, yoyo: boolean = false, delayMs: number = 0): ATween
    {
        this._yoyo = yoyo;
        this._repeatTimes0 = times;
        this._repeatTimes1 = times;
        this._repeatDelayMs = delayMs;
        return this;
    }
    /**
     * Get repeat times.
     */
    public getRepeatTimes(): number
    {
        return this._repeatTimes0;
    }
    /**
     * Set easing function.
     */
    public easing(func: (v: number) => number)
    {
        this._easing = func;
        return this;
    }
    /**
     * Keep this tween, killAll has no effect on it.
     */
    public retain(): ATween
    {
        this._retain = true;
        return this;
    }
    /**
     * Determine whether the tween is keeping.
     */
    public isRetain(): boolean
    {
        return this._retain;
    }
    /**
     * Release the retain tween.
     */
    public release(): ATween
    {
        this._retain = false;
        return this;
    }
    /**
     * Set interpolation function.
     */
    public interpolation(interpolation)
    {
        this._interpolation = interpolation;
        return this;
    }
    /**
     * Set the callback function when the tween start.
     */
    public onStart(callback: any): ATween
    {
        this._onStartCallback = callback;
        return this;
    }
    /**
     * Set the callback function when the tween's value has updated.
     */
    public onUpdate(callback: any): ATween
    {
        this._onUpdateCallback = callback;
        return this;
    }
    /**
     * Set the callback function when the tween is canceled.
     */
    public onCancel(callback: any): ATween
    {
        this._onCancelCallback = callback;
        return this;
    }
    /**
     * Set the callback function when the tween is repeated.
     */
    public onRepeat(callback: (times: number) => boolean): ATween
    {
        this._onRepeatCallback = callback;
        return this;
    }
    /**
     * Immediate call the repeat function.
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
     * Set the callback function when the tween is completed.
     */
    public onComplete(callback: any, params: Array<any> = null): ATween
    {
        this._onCompleteCallback = callback;
        this._onCompleteParams = params;
        if (this._onCompleteParams != null)
        {
            this._onCompleteParams = this._onCompleteParams.concat([]);
        }
        return this;
    }
}
/**
 * Tween Easing Type - Linear.
 */
class ATweenEasingLinear
{
    public static None(k: number): number
    {
        return k;
    }
}
/**
 * Tween Easing Type - Quadratic.
 */
class ATweenEasingQuadratic
{
    public static In(k: number): number
    {
        return k * k;
    }
    public static Out(k: number): number
    {
        return k * (2 - k);
    }
    public static InOut(k: number): number
    {
        if ((k *= 2) < 1)
        {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    }
}
/**
 * Tween Easing Type - Cubic.
 */
class ATweenEasingCubic
{
    public static In(k: number): number
    {
        return k * k * k;
    }
    public static Out(k: number): number
    {
        return --k * k * k + 1;
    }
    public static InOut(k: number): number
    {
        if ((k *= 2) < 1)
        {
            return 0.5 * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k + 2);
    }
}
/**
 * Tween Easing Type - Quartic.
 */
class ATweenEasingQuartic
{
    public static In(k: number): number
    {
        return k * k * k * k;
    }
    public static Out(k: number): number
    {
        return 1 - (--k * k * k * k);
    }
    public static InOut(k: number): number
    {
        if ((k *= 2) < 1)
        {
            return 0.5 * k * k * k * k;
        }
        return -0.5 * ((k -= 2) * k * k * k - 2);
    }
}
/**
 * Tween Easing Type - Quintic.
 */
class ATweenEasingQuintic
{
    public static In(k: number): number
    {
        return k * k * k * k * k;
    }
    public static Out(k: number): number
    {
        return --k * k * k * k * k + 1;
    }
    public static InOut(k: number): number
    {
        if ((k *= 2) < 1)
        {
            return 0.5 * k * k * k * k * k;
        }
        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    }
}
/**
 * Tween Easing Type - Sinusoidal.
 */
class ATweenEasingSinusoidal
{
    public static In(k: number): number
    {
        return 1 - Math.cos(k * Math.PI / 2);
    }
    public static Out(k: number): number
    {
        return Math.sin(k * Math.PI / 2);
    }
    public static InOut(k: number): number
    {
        return 0.5 * (1 - Math.cos(Math.PI * k));
    }
}
/**
 * Tween Easing Type - Exponential.
 */
class ATweenEasingExponential
{
    public static In(k: number): number
    {
        return k == 0 ? 0 : Math.pow(1024, k - 1);
    }
    public static Out(k: number): number
    {
        return k == 1 ? 1 : 1 - Math.pow(2, -10 * k);
    }
    public static InOut(k: number): number
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
}
/**
 * Tween Easing Type - Circular.
 */
class ATweenEasingCircular
{
    public static In(k: number): number
    {
        return 1 - Math.sqrt(1 - k * k);
    }
    public static Out(k: number): number
    {
        return Math.sqrt(1 - (--k * k));
    }
    public static InOut(k: number): number
    {
        if ((k *= 2) < 1)
        {
            return -0.5 * (Math.sqrt(1 - k * k) - 1);
        }
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    }
}
/**
 * Tween Easing Type - Elastic.
 */
class ATweenEasingElastic
{
    public static In(k: number): number
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
    public static Out(k: number): number
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
    public static InOut(k: number): number
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
}
/**
 * Tween Easing Type - Back.
 */
class ATweenEasingBack
{
    public static In(k: number): number
    {
        var s = 1.70158;
        return k * k * ((s + 1) * k - s);
    }
    public static Out(k: number): number
    {
        var s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;
    }
    public static InOut(k: number): number
    {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1)
        {
            return 0.5 * (k * k * ((s + 1) * k - s));
        }
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    }
}
/**
 * Tween Easing Type - Bounce.
 */
class ATweenEasingBounce
{
    public static In(k: number): number
    {
        return 1 - ATweenEasingBounce.Out(1 - k);
    }
    public static Out(k: number): number
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
    public static InOut(k: number): number
    {
        if (k < 0.5)
        {
            return ATweenEasingBounce.In(k * 2) * 0.5;
        }
        return ATweenEasingBounce.Out(k * 2 - 1) * 0.5 + 0.5;
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
