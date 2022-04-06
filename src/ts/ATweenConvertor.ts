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
class ATweenConvertor
{
    /**
     * css unit function.
     */
    public static css_unit(curValue: number, startValue: number, endValue: number, percent: number, property: string): any
    {
        return curValue + 'px';
    }
    /**
     * css gradient convert function
     */
    public static css_gradient(curValue: number, startValue: number, endValue: number, percent: number, property: string): any
    {
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
        for (var i = s.length; i < 6; i++)
        {
            s = '0' + s;
        }
        return "#" + s;
    }
}