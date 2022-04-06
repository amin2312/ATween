package ;
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
@:expose
class ATweenEasing
{
    /**
	 * Linear
	 */
    public static function Linear(k:Float):Float
    {
        return k;
    }
    /**
	 * Quadratic
	 */
    public static function QuadraticIn(k:Float):Float
    {
        return k * k;
    }
    public static function QuadraticOut(k:Float):Float
    {
        return k * (2 - k);
    }
    public static function QuadraticInOut(k:Float):Float
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
    public static function CubicIn(k:Float):Float
    {
        return k * k * k;
    }
    public static function CubicOut(k:Float):Float
    {
        return --k * k * k + 1;
    }
    public static function CubicInOut(k:Float):Float
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
    public static function QuarticIn(k:Float):Float
    {
        return k * k * k * k;
    }
    public static function QuarticOut(k:Float):Float
    {
        return 1 - (--k * k * k * k);
    }
    public static function QuarticInOut(k:Float):Float
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
    public static function QuinticIn(k:Float):Float
    {
        return k * k * k * k * k;
    }
    public static function QuinticOut(k:Float):Float
    {
        return --k * k * k * k * k + 1;
    }
    public static function QuinticInOut(k:Float):Float
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
    public static function SinusoidalIn(k:Float):Float
    {
        return 1 - Math.cos(k * Math.PI / 2);
    }
    public static function SinusoidalOut(k:Float):Float
    {
        return Math.sin(k * Math.PI / 2);
    }
    public static function SinusoidalInOut(k:Float):Float
    {
        return 0.5 * (1 - Math.cos(Math.PI * k));
    }
    /**
	 * Exponential.
	 */
    public static function ExponentialIn(k:Float):Float
    {
        return k == 0 ? 0 : Math.pow(1024, k - 1);
    }
    public static function ExponentialOut(k:Float):Float
    {
        return k == 1 ? 1 : 1 - Math.pow(2, -10 * k);
    }
    public static function ExponentialInOut(k:Float):Float
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
    public static function CircularIn(k:Float):Float
    {
        return 1 - Math.sqrt(1 - k * k);
    }
    public static function CircularOut(k:Float):Float
    {
        return Math.sqrt(1 - (--k * k));
    }
    public static function CircularInOut(k:Float):Float
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
    public static function ElasticIn(k:Float):Float
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
    public static function ElasticOut(k:Float):Float
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
    public static function ElasticInOut(k:Float):Float
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
    public static function BackIn(k:Float):Float
    {
        var s = 1.70158;
        return k * k * ((s + 1) * k - s);
    }
    public static function BackOut(k:Float):Float
    {
        var s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;
    }
    public static function BackInOut(k:Float):Float
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
    public static function BounceIn(k:Float):Float
    {
        return 1 - ATweenEasing.BounceOut(1 - k);
    }
    public static function BounceOut(k:Float):Float
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
    public static function BounceInOut(k:Float):Float
    {
        if (k < 0.5)
        {
            return ATweenEasing.BounceIn(k * 2) * 0.5;
        }
        return ATweenEasing.BounceOut(k * 2 - 1) * 0.5 + 0.5;
    }
}