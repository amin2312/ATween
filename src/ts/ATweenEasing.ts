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
class ATweenEasing
{
    public static Linear(k: number): number
    {
        return k;
    }

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