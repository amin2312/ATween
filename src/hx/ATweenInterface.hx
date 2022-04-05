package ;
/**
 * 1. Copyright (c) 2022 amin2312
 * 2. Version 1.0.0
 * 3. MIT License
 *
 * ATween - a a easy, fast and tiny tween libary.
 */
/**
 * ATween Property Interface.
 * If the target has implement this interface,
 * Then the tween will use its functions first to update the target.
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