package ;
/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * ATween helper library - Convertor.
 *
 * IF you don't need custom conversion feature,
 * you can compile the project without this file.
 */
@:expose
class ATweenConvertor
{
    /**
     * css unit function.
     */
     public static function css_unit(curValue: Float, startValue: Float, endValue: Float, percent: Float, property: String): Dynamic
     {
         return curValue + 'px';
     }
    /**
     * css gradient convert function
     */
    public static function css_gradient(curValue:Float, startValue:Float, endValue:Float, percent:Float, property:String):Dynamic
    {
        var R0 = ((untyped startValue) & 0xFF0000) >> 16;
        var G0 = ((untyped startValue) & 0x00FF00) >> 8;
        var B0 = ((untyped startValue) & 0x0000FF);
        var R1 = ((untyped endValue) & 0xFF0000) >> 16;
        var G1 = ((untyped endValue) & 0x00FF00) >> 8;
        var B1 = ((untyped endValue) & 0x0000FF);
        var R = Math.floor(R1 * percent + (1 - percent) * R0);
        var G = Math.floor(G1 * percent + (1 - percent) * G0);
        var B = Math.floor(B1 * percent + (1 - percent) * B0);

        var color = (R << 16) | (G << 8) | B;
        var s = StringTools.hex(color);
        for (i in s.length...6)
        {
            s = '0' + s;
        }
        return "#" + s;
    }
}