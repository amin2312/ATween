package ;
/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * ATween Property Interface.
 *
 * IF the target has implement this interface,
 * then the tween will use its interface functions first to update the target.
 */
interface ATweenInterface
{
    /**
	 * Get tween property when needs.
	 **/
    public function get_tween_prop(name:String):Dynamic;
    /**
	 * Set tween property when needs.
	 **/
    public function set_tween_prop(name:String, value:Dynamic):Void;
}