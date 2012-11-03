/**
 * @module lang
 * @description add sugar to language. This module based on dojo lang module
 * @author Maksim Ryzhikov
 * @platform browser, node.js, rhino, v8
 * 2012-04-01
 */

(function() {
		'use strict';

		var lang, arrayPrototype = Array.prototype,
				objectPrototypeToString = Object.prototype.toString,
				functionPrototype = Function.prototype,
				call = functionPrototype.call,
				defaultPatter = /\{([^\}]+)\}/g,
				_undefined = (function(_) {
						return _;
				}()),
				/**
				 * get reference on global object
				 * it works in ECMA3 and ECMA5
				 */
				global = (function() {
						return this || eval.call(null, 'this');
				}()),
				/**
				 * @param {Any} it any type
				 * @return {Boolea} return true if it is a function
				 */
				isFunction = function(it) {
						return objectPrototypeToString.call(it) === '[object Function]';
				},
				/**
				 * @param {Any} it any type
				 * @return {Boolea} if type of it is string then return true
				 */
				isString = function(it) {
						return typeof it === 'string';
				},
				/**
				 * @param {Any} it any type
				 * @return {Boolea} if type of it is a Array then return true
				 */
				isArray = isFunction(Array.isArray) ? Array.isArray : function(it) {
						return it && (it instanceof Array || typeof it === 'array');
				},
				/**
				 * @param {Any} it any type
				 * @return {Boolea} return true if it is the undefined
				 */
				isUndefined = function(it) {
						return typeof it === 'undefined';
				},
				/**
				 * @param {Any} it any type
				 * @return {Boolea} if type of it is object then return true
				 */
				isObject = function(it) {
						return objectPrototypeToString.call(it) === '[object Object]';
				},
				/**
				 * @param {Object} arrayLike array like object
				 * @return {Array}
				 */
				toArray = function(obj, offset, startWith) {
						return (startWith || []).concat(arrayPrototype.slice.call(obj, offset || 0));
				},
				/**
				 * @param {Object} scope context of the call
				 * @param {Function|String} method
				 *
				 * @return {Function} currying function
				 */
				hitch = (function() {

						if (isFunction(functionPrototype.bind)) {
								return function(scope, method) {
										var args = toArray(arguments, 2, [scope || global]),
												fn = isString(method) ? scope[method] : method;
										return fn.bind.apply(fn, args);
								};
						}

						return function(scope, method) {
								var args = toArray(arguments, 2),
										_scope = scope || global;
								return function() {
										args = args.length ? args.concat(toArray(arguments)) : toArray(arguments);
										return isString(method) ? _scope[method]() : method.apply(_scope, args);
								};
						};
				}()),
				/**
				 * @description Add properties to dest object from source object
				 * @private
				 *
				 * @param {Object} dest destination object
				 * @param {Object} source object from which will be copied properties
				 * @param {[Function]} copyFunc function which will be called every time a property is copied
				 * @return {Object} return destination object
				 */
				_mixin = function(dest, source, copyFunc) {
						var name, s, i, empty = {};
						for (name in source) {
								s = source[name];
								if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
										dest[name] = copyFunc ? copyFunc(s) : s;
								}
						}
						return dest;
				},
				/**
				 * @param {Object|Any} dest destination object
				 * @param {Object...} sources source object. All subsequent arguments should be sources objects (subsequent from left to right)
				 * @return {Object}
				 */
				mixin = function(dest, sources) {
						var i, l, _dest = isObject(dest) ? dest : {};

						for (i = 1, l = arguments.length; i < l; i++) {
								_mixin(_dest, arguments[i]);
						}

						return _dest;
				},
				/**
				 * @description extend constructor prototype
				 *
				 * @param {Function} constructor function constructor
				 * @param {Object...} props object from which will be copied properties to constructor prototype object
				 * @return {Function} return passed function constructor
				 */
				extend = function(constructor, props) {
						var i, l;
						if (constructor && isObject(constructor.prototype)) {
								for (i = 1, l = arguments.length; i < l; i++) {
										_mixin(constructor.prototype, arguments[i]);
								}
						}
						return constructor;
				},
				/**
				 * @description clone object
				 * don't clone functions for performance reasons
				 *
				 * @param {Any} src source object from which we will be cloned properties
				 * @return {Any}
				 */
				clone = function(src) {
						var r, i, l;
						// null, undefined, any non-object, or function
						if (!src || typeof src !== 'object' || lang.isFunction(src)) {
								return src;
						}
						// DOM Node
						if (src.nodeType && isFunction(src.cloneNode)) {
								return src.cloneNode(true);
						}
						//Date
						if (src instanceof Date) {
								return new Date(src.getTime());
						}
						// RegExp
						if (src instanceof RegExp) {
								return new RegExp(src); // RegExp
						}
						// Array
						if (isArray(src)) {
								r = [];
								for (i = 0, l = src.length; i < l; ++i) {
										if (i in src) {
												r.push(clone(src[i]));
										}
								}
								// generic objects
						} else {
								r = src.constructor ? new src.constructor() : {};
						}
						return _mixin(r, src, clone);
				},
				/**
				 * @description boodman/crockford delegation with cornford optimization
				 *
				 * @param {Object} obj object which will be delegated
				 * @param {[Object]} props additional properties which will be mixed in new Object
				 * @return {Object} return new object with [prototype] -> obj
				 */
				delegate = (function() {
						function TMP() {}
						return function(obj, props) {
								var tmp;

								TMP.prototype = obj;
								tmp = new TMP();
								TMP.prototype = null;

								if (props) {
										_mixin(tmp, props);
								}

								return tmp;
						};
				}()),
				/**
				 * @description deletes leading and trailing white space in string
				 * @param {String} str
				 * @return {String} string without leading and trailing white space
				 */
				trim = String.prototype.trim ? function(str) {
						return str.trim();
				} : function(str) {
						return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				},
				/**
				 * @description find property in context and return value of property
				 *
				 * @param {Array} parts array which contain parts of path to property
				 * @param {Boolean} create creates new object for any empty part
				 * @param {[Object]} context context in which will be lookup property. If context not passed then property will be matched in global context
				 *
				 * @return {Any} return value of property
				 */
				getProp = function(parts, create, context) {
						var p, i = 0;

						if (!context) {
								//try find context in global scope
								//assuming that first element in array parts is name of context in
								//global scope
								if (!parts.length) {
										return global;
								}
								p = parts[i++];

								try {
										context = global[p];
								} catch (e) {}
						}

						for (i; context && (p = parts[i++]); p) {
								if (isUndefined(context[p])) {
										context = create ? context[p] = {} : _undefined;
								} else {
										context = context[p];
								}
						}

						return context;
				},
				/**
				 * @description create namespace
				 *
				 * @param {String} name name of namespace separated by dot (name.space.foo.bar)
				 * @param {[Any]} value value of namespace
				 * @param {[Object]} context context in which will be created namespace
				 * @return {Any} return passed value or undefined
				 */
				setObject = function(name, value, context) {
						var parts = name.split('.'),
								p = parts.pop(),
								obj = getProp(parts, true, context || global);
						return obj && p ? (obj[p] = value) : _undefined;
				},
				/**
				 * @description get object by name of namespace or create empty object
				 *
				 * @param {String} name name of namespace separated by dot (name.space.foo.bar)
				 * @param {[Object]} context context in which will be matched or created object
				 * @param {[Boolean]} create creates new object if object doesn't exist by the current namespace
				 * @return {Object|Undefined}
				 */
				getObject = function(name, context, create) {
						return getProp(name.split('.'), create, context);
				},
				/**
				 * @description checks exist object by namespace
				 *
				 * @param {String} name namespace
				 * @param {[Object]} obj context in which will be matched object
				 * @return {Boolean}
				 */
				exists = function(name, obj) {
						return getObject(name, obj) !== _undefined;
				},
				/**
				 * @description function which exercise interpolation in passed template
				 *
				 * @param {String} tmpl template
				 * @param {Object|Array|Function} map object in which will be matched special variables located in template or function for replacement
				 * @param {[RegExp]} pattern mask for matching
				 *
				 * @return {String} return string with the substituted values
				 *
				 * @example lang.replace('My name is {name}',{name: 'Maksim'})
				 * @example lang.replace('My name is {0}',['Maksim'])
				 */
				replace = function(tmpl, map, pattern) {
						return tmpl.replace(pattern || defaultPatter, isFunction(map) ? map : function(_, k) {
								/*
								 * 0 - everything feel into regexp
								 * 1 - only that feel in parentheses
								 * 2 - start index
								 * 3 - all template
								 *
								 * function must return what should insert instead of match
								 */
								return getObject(k, map);
						});
				},
				/**
				 * @description simple for-each iterator
				 *
				 * @param {Array|Object} vector
				 * @param {callback} callback
				 */
				forEach = (function() {
						if (isFunction(arrayPrototype.forEach)) {
								return hitch(arrayPrototype.forEach, call);
						}

						return function(vector, callback) {
								var i, l;
								if (vector) {
										for (i = 0, l = vector.length; i < l; i++) {
												callback(vector[i]);
										}
								}
						};
				}()),
				/**
				 * short cut for access to cache of 'has' object
				 * will be refered on has.cache object
				 */
				hasCache = null,
				/**
				 * @param {String} name name of checked feature
				 * @return {Boolea} support feature or not
				 */
				has = function(name) {
						hasCache[name] = isFunction(hasCache[name]) ? hasCache[name](global) : hasCache[name];
						return hasCache[name];
				};
		/**
		 * initialize cache for 'has' object
		 */
		hasCache = has.cache = {};
		/**
		 * @description adds spec for feature
		 * @param {String} name name of feature
		 * @param {Boolean|Function} test you can pass function to test feature or boolean type which say supported this feature or not
		 *
		 * @param {[Boolean]} now calls test for feature immediately and returns result of test
		 * @param {[Boolean]} force rewrites test on feature if he exists
		 *
		 * @return {Undefined|Boolean} return result of test if you pass 'now' equal true
		 */
		has.add = function(name, test, now, force) {
				if (isUndefined(hasCache[name]) || force) {
						hasCache[name] = test;
				}
				return now && has(name);
		};

		has.add('host-browser', typeof global.window === 'object' && typeof global.document === 'object');
		has.add('host-node', (typeof global.process === 'object') && global.process.versions.node && global.process.versions.v8);
		has.add('host-rhino', isFunction(global.load) && (isFunction(global.Packages) || isObject(global.Packages)));
		has.add('host-v8', isFunction(global.load) && isFunction(global.read));
		has.add('amd', global.define && isObject(global.define.amd));

		/**
		 * export module
		 */
		lang = {
				isFunction: isFunction,
				isString: isString,
				isArray: isArray,
				isUndefined: isUndefined,
				isObject: isObject,
				toArray: toArray,
				hitch: hitch,
				mixin: mixin,
				clone: clone,
				extend: extend,
				delegate: delegate,
				trim: trim,
				getProp: getProp,
				setObject: setObject,
				getObject: getObject,
				exists: exists,
				replace: replace,
				forEach: forEach,
				has: has,
				global: global,
				undefined: _undefined
		};

		if (has('amd')) {
				define(lang);
		}

		if (has('host-node')) {
				return (module.exports.lang = lang);
		}

		if (!has('amd')) {
				return global.lang;
		}

}());
