/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * ATween is a easy, fast and tiny tween library.=
 */
class ATween
{
    /**
     * Specifies whether to stop all tweens.
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
     * Elapsed percentage of tween.
     **/
    public elapsedPercentage: number = 0;
    /**
     * Params of tween.
     */
    private _target: any | ATweenInterface;
    private _initedTarget: boolean = false;
    private _srcVals: { [key: string]: number };
    private _dstVals: { [key: string]: number };
    private _revVals: { [key: string]: number };

    private _attachment: HTMLElement = null;
    private _convertor: (curValue: number, startValue: number, endValue: number, percent: number, property: string) => any = null;
    private _data: any = null;

    private _repeatNextStartMs: number = 0;
    private _repeatRefs: number = 0; // references, reference count
    private _repeatSteps: number = 0;
    private _repeatDelayMs: number = 0;
    private _updateSteps: number = 0;
    private _isFirstUpdate: boolean = true;

    private _startMs: number = 0;
    private _delayMs: number = 0;
    private _durationMs: number = 1; // can't be 0
    private _repeatTimes: number = 0;
    private _yoyo: boolean = false;
    private _isCompleted = false;
    private _pause: boolean = false;
    private _isRetained: boolean = false;
    private _easing: (k: number) => number = null;
    /**
     * The callback functions.
     **/
    private _onStartCallback: () => void = null;
    private _isStarted:boolean = false;
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
     * Updates all tweens by the specified time.
     * @param ms millisecond unit
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
	 * WHEN the tween is retain, then it will be ignored.	
     * @param withComplete Specifies whether to call complete function.
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
     * Kill all tweens of specified the target or attachment.
     * @param targetOrAttachment the target or attachment.
     * @param withComplete Specifies whether to call complete function.
     * @return Number of killed instances
     */
    public static killTweens(targetOrAttachment: any, withComplete: boolean = false): number
    {
        var clone = ATween._instances.concat([]);
        var len = clone.length;
        var num = 0;
        for (var i = 0; i < len; i++)
        {
            var ins = clone[i];
            if (ins._target == targetOrAttachment || ins._attachment == targetOrAttachment)
            {
                ins.cancel(withComplete);
                num++;
            }
        }
        return num;
    }
    /**
     * Check the target or attachment is tweening.
     * @param targetOrAttachment the target or attachment.
     */
    public static isTweening(targetOrAttachment: any): boolean
    {
        var instances = ATween._instances;
        var len = instances.length;
        for (var i = 0; i < len; i++)
        {
            var ins = instances[i];
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
    constructor(target: any | ATweenInterface)
    {
        this._target = target;
    }
    /**
     * Checks whether has installed frame trigger in current environment.
     */
    private static checkInstalled(): void
    {
        if (!ATween._isInstalled)
        {
            ATween._isInstalled = true;
            if (window != null && window.requestAnimationFrame != null)
            {
                var lastTime: number = 0;
                var onFrame = function (now: DOMHighResTimeStamp): void
                {
                    var ms = now - lastTime;
                    lastTime = now;
                    ATween.updateAll(ms);
                    window.requestAnimationFrame(onFrame);
                }
                lastTime = window.performance.now();
                onFrame(lastTime);
            }
            else
            {
                console.log('You need to manually call "ATween.updateAll" function update all tweens');
            }
        }
    }
    /**
     * Create a tween.
     * @param target the targer object.
     * @param durationMs set duration, not including any repeats or delays.
     * @param delayMs set initial delay which is the length of time in ms before the tween should begin.
     * @return Tween instance
     */
    public static newTween(target: any, durationMs: number, delayMs: number = 0): ATween
    {
        ATween.checkInstalled();
        var t = new ATween(target);
        if (durationMs < 0)
        {
            durationMs = 1;
        }
        t._durationMs = durationMs;
        t._delayMs = delayMs;
        return t;
    }
    /**
     * Create a once timer.
     * @remarks
	 * It will AUTO start, you don't need to call "start()" function.
     * @param intervalMs interval millisecond
     * @param onCompleteCallback The callback function when completion.
     * @param onCompleteParams The callback parameters when completion.
     * @return Tween instance
     */
    public static newOnce(intervalMs: number, onCompleteCallback: any, onCompleteParams: Array<any> = null): ATween
    {
        ATween.checkInstalled();
        var t = new ATween(null);
        t._delayMs = intervalMs;
        t.onComplete(onCompleteCallback, onCompleteParams);
        t.start();
        return t;
    }
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
    public static newTimer(intervalMs: number, times: number, onRepeatCallback: (steps: number) => boolean, onCompleteCallback: any = null, onCompleteParams: Array<any> = null): ATween
    {
        ATween.checkInstalled();
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
     * @return Tween instance
     */
    public start(): ATween
    {
        if (this._isStarted)
        {
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
        if (this._initedTarget)
        {
            return;
        }
        this._srcVals = {};
        this._revVals = {};
        for (var property in this._dstVals)
        {
            var curVal: any;
            if ((this._target as ATweenInterface).get_tween_prop != null)
            {
                curVal = (this._target as ATweenInterface).get_tween_prop(property);
            }
            else
            {
                curVal = this._target[property];
            }
            var dstVal: any = this._dstVals[property];
            if (typeof (dstVal) != 'number')
            {
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
        var ePercent = percent;
        var fnE = this._easing;
        if (fnE != null)
        {
            ePercent = fnE(percent);
        }
        for (var property in this._srcVals)
        {
            var curVal = this._srcVals[property];
            if (curVal == null)
            {
                continue;
            }
            var startVal = curVal;
            var endVal = this._dstVals[property];
            var newVal: number;
            if (percent >= 1)
            {
                newVal = endVal;
            }
            else
            {
                newVal = startVal + (endVal - startVal) * ePercent;
            }
            if ((this._target as ATweenInterface).set_tween_prop != null)
            {
                (this._target as ATweenInterface).set_tween_prop(property, newVal);
            }
            else
            {
                this._target[property] = newVal;
            }
            // sync value to attachment object
            if (this._attachment != null)
            {
                var syncVal: any;
                var fnC = this._convertor;
                if (fnC != null)
                {
                    syncVal = fnC(newVal, startVal, endVal, ePercent, property);
                }
                else
                {
                    syncVal = Math.floor(newVal);
                }
                this._attachment.style.setProperty(property, syncVal);
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
	 * Update tween by the specified time.
	 * @param ms millisecond unit
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
        // init target
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
        // update percent
        if (this._isFirstUpdate)
        {
            this.elapsedMs = this._startMs; // set unified time
            this._isFirstUpdate = false;
        }
        this.elapsedPercentage = (this.elapsedMs - this._startMs) / this._durationMs;
        if (ms >= 0x7FFFFFFF || this.elapsedPercentage > 1 || this._durationMs == 1)
        {
            this.elapsedPercentage = 1;
        }
        // update target
        this.updateTarget(this.elapsedPercentage);
        // end processing
        if (this.elapsedPercentage == 1)
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
                this._isFirstUpdate = true;
                // [Callback Handler]
                if (this._onRepeatCallback != null)
                {
                    var cbR = this._onRepeatCallback;
                    var rzl = cbR.call(this, this._repeatSteps);
                    if (rzl === false)
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
     * Cancel this tween.
     * @param withComplete Specifies whether to call complete function.
     * @return Tween instance
     */
    public cancel(withComplete: boolean = false): void
    {
        if (this._isCompleted == true || this._isRetained == true)
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
        // [Callback Handler]
        if (this._onCancelCallback != null)
        {
            var cb = this._onCancelCallback;
            cb.call(this);
        }
    }
    /**
     * The destination values that the target wants to achieves.
     * @param endValues destination values.
     * @return Tween instance
     */
    public to(endValues: any): ATween
    {
        this._dstVals = endValues;
        return this;
    }
    /**
     * Attach to HTMLElement element (The tween value will auto sync to this element).
     * @param obj HTMLElement or element id
     * @param convert You can use it to convert the current value to its final form, e.g. convert "int" to "rgb"
     * @return Tween instance
     */
    public attach(obj: HTMLElement | string, convert: (curValue: number, startValue: number, endValue: number, percent: number, property: string) => any = null): ATween
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
        this._attachment = t;
        this._convertor = convert;
        return this;
    }
    /**
     * Store arbitrary data associated with this tween.
     */
    public data(v: any): ATween
    {
        this._data = v;
        return this;
    }
    /**
     * Set repeat execution.
     * @param times the repeat times(-1 is infinity)
     * @param yoyo where true causes the tween to go back and forth, alternating backward and forward on each repeat.
     * @param delayMs delay trigger time
     * @return Tween instance
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
     * Calls the "onRepeat" function immediately(repeat times is 0).
     * @remark
     * IF you need to init the environment, then it's a good choice.
     * @return Tween instance
     */
    public callRepeat(): ATween
    {
        var cb = this._onRepeatCallback;
        var rzl = cb.call(this, 0);
        if (rzl == false)
        {
            this.release().cancel();
        }
        return this;
    }
    /**
     * Set easing function.
     * @return Tween instance
     */
    public easing(func: (v: number) => number): ATween
    {
        this._easing = func
        return this;
    }
    /**
     * Keep this tween, "killAll" has no effect on it.
     * @return Tween instance
     */
    public retain(): ATween
    {
        this._isRetained = true;
        return this;
    }
    /**
     * Release this retained tween.
     * @return Tween instance
     */
    public release(): ATween
    {
        this._isRetained = false;
        return this;
    }
    /**
     * Indicates whether the tween is keeping.
     * @return Tween instance
     */
    public isRetained(): boolean
    {
        return this._isRetained;
    }
    /**
     * Set pause state.
     */
    public setPause(v: boolean)
    {
        this._pause = v;
    }
    /**
     * Get pause state.
     */
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
     * Get attachment.
     */
    public getAttachment(): any
    {
        return this._attachment;
    }
    /**
     * Get data.
     */
    public getData(): any
    {
        return this._data;
    }
    /**
     * Set the callback function when startup.
     * @return Tween instance
     */
    public onStart(callback: () => void): ATween
    {
        this._onStartCallback = callback;
        return this;
    }
    /**
     * Set the callback function when updating.
     * @return Tween instance
     */
    public onUpdate(callback: (percent: number, times: number) => void): ATween
    {
        this._onUpdateCallback = callback;
        return this;
    }
    /**
     * Set the callback function when completion.
     * @return Tween instance
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
     * Set the callback function when canceled.
     * @return Tween instance
     */
    public onCancel(callback: () => void): ATween
    {
        this._onCancelCallback = callback;
        return this;
    }
    /**
     * Set the callback function when repeating.
     * @remarks
     * if return FASLE, then will cancel this timer.
     * @return Tween instance
     */
    public onRepeat(callback: (steps: number) => boolean): ATween
    {
        this._onRepeatCallback = callback;
        return this;
    }
    /**
	 * Simplified function for "to" - set alpha.
	 */
    public toAlpha(v:number):ATween
    {
        return this.to({alpha:v});
    }
    /**
	 * Simplified function for "to" - set crood x.
	 */
    public toX(v:number):ATween
    {
        return this.to({x:v});
    }
    /**
	 * Simplified function for "to" - set crood y.
	 */
    public toY(v:number):ATween
    {
        return this.to({y:v});
    }
    /**
	 * Simplified function for "to" - set crood x and y.
	 */
    public toXY(a:number, b:number):ATween
    {
        return this.to({x:a, y:b});
    }
}