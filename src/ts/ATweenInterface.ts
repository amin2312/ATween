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
    get_tween_prop(name: String): any;
    /**
	 * Set tween property when needs.
	 **/
    set_tween_prop(name: String, value: any): void;
}