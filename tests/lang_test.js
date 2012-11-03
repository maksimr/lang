/**
 * test lang module
 * 2012-04-01
 */

(function(global) {
		"use strict";
		var wru = require('./wru').wru,
				lang = require('../devlang').lang;

		wru.test([{
				name: 'lang#isFunction',
				test: function() {
						wru.assert('should return true  for Function ', lang.isFunction(function() {}));
						wru.assert('should return false for Object   ', !lang.isFunction({}));
						wru.assert('should return false for Array    ', !lang.isFunction([]));
				}
		}, {
				name: 'lang#isString',
				test: function() {
						wru.assert('should return true  for String ', lang.isString('should be true'));
						wru.assert('should return false for Number ', !lang.isString(1));
						wru.assert('should return false for Boolean', !lang.isString(true));
						wru.assert('should return false for Object ', !lang.isString({}));
						wru.assert('should return false for Array  ', !lang.isString([]));
				}
		}, {
				name: 'lang#isArray',
				test: function() {
						wru.assert('should return true  for Array  ', lang.isArray([]));
						wru.assert('should return false for Number ', !lang.isArray(1));
						wru.assert('should return false for Boolean', !lang.isArray(true));
						wru.assert('should return false for Object ', !lang.isArray({}));
						wru.assert('should return false for String ', !lang.isArray('string'));
				}
		}, {
				name: 'lang#isUndefined',
				test: function() {
						wru.assert('should return true  for Undefined', lang.isUndefined(undefined));
						wru.assert('should return false for Null     ', !lang.isUndefined(null));
						wru.assert('should return false for Boolean  ', !lang.isUndefined(false));
						wru.assert('should return false for Object   ', !lang.isUndefined({}));
						wru.assert('should return false for String   ', !lang.isUndefined(''));
						wru.assert('should return false for Number   ', !lang.isUndefined(0));
						wru.assert('should return false for Array    ', !lang.isUndefined([]));
				}
		}, {
				name: 'lang#isObject',
				test: function() {
						wru.assert('should return true  for Object   ', lang.isObject({}));
						wru.assert('should return false for Array    ', !lang.isObject([]));
						wru.assert('should return false for Functioin', !lang.isObject(function() {}));
				}
		}, {
				name: 'lang#toArray',
				test: function() {
						var arr = lang.toArray({
								'0': 0,
								'1': 1,
								'length': 2
						});
						wru.assert('should convert object to Array           ', lang.isArray(arr));
						wru.assert('should convert array like object to Array', arr.length === 2);
				}
		}, {
				name: 'lang#hitch',
				test: function() {
						var scope = {
								foo: 'foo'
						},
						fn = function(arg) {
								return arg || this.foo;
						};
						wru.assert('should bind scope to function', lang.hitch(scope, fn)() === 'foo');
						wru.assert('should currying function     ', lang.hitch(scope, fn, 'bar')() === 'bar');
				}
		}, {
				name: 'lang#mixin',
				test: function() {
						var dist = {},
						src = {
								foo: 'foo',
								bar: function() {
										return this.foo;
								}
						},
						src2 = {
								foo: 'bar'
						};
						lang.mixin(dist, src);

						wru.assert('should mixin properties', dist.foo === 'foo' && dist.bar === src.bar);
						lang.mixin(dist, src, src2);

						wru.assert('should rewrite property', dist.foo === 'bar' && dist.bar === src.bar);
				}
		}, {
				name: 'lang#extend',
				test: function() {
						var Ctr = function() {},
						props = {
								foo: 'foo'
						},
						inst;
						lang.extend(Ctr, props);
						inst = new Ctr();

						wru.assert('should extend prototype of constructor     ', inst.foo === 'foo');
						wru.assert('should not fail when pass not constructor  ', lang.extend([], props));
						wru.assert('should not fail when pass undefined or null', lang.extend(null, props) || 1);
						wru.assert('should not fail when not pass props        ', lang.extend(Ctr));
				}
		}, {
				name: 'lang#clone',
				test: function() {
						var src = {
								obj: {},
								date: (new Date()),
								regexp: /foo/,
								arr: [1, 2],
								nested: {
										bar: 'bar'
								}
						},
						dist = lang.clone(src);

						wru.assert('should clone property object  ', lang.isObject(dist.obj) && dist.obj !== src.obj);
						wru.assert('should clone date             ', dist.date !== src.date);
						wru.assert('should clone RegExp           ', dist.regexp !== src.regexp);
						wru.assert('should clone Array            ', lang.isArray(dist.arr) && dist.arr !== src.arr);
						wru.assert('should clone Nested attributes', dist.nested !== src.nested && dist.nested.bar === 'bar');
				}
		}, {
				name: 'lang#delegate',
				test: function() {
						var dist = {
								name: 'Bar',
								say: function() {
										return this.name;
								}
						},
						proxy = lang.delegate(dist);
						wru.assert('should delegate properties and method', proxy.name === 'Bar' && lang.isFunction(proxy.say) && proxy.say() === 'Bar');
						proxy = lang.delegate(dist, {
								name: 'Foo'
						});
						wru.assert('should rewrite some properties       ', proxy.name === 'Foo' && lang.isFunction(proxy.say) && proxy.say() === 'Foo');
				}
		}, {
				name: 'lang#trim',
				test: function() {
						wru.assert('should trim string                   ', lang.trim('  foo  ').length === 3);
						wru.assert('should save white space between chars', lang.trim('  f o o  ').length === 5);
				}
		}, {
				name: 'lang#getProp',
				test: function() {
						var context = {
								foo: {
										bar: 1
								}
						};
						wru.assert('should get property in passed context                                             ', lang.getProp(['foo', 'bar'], false, context) === 1);
						wru.assert('should return undefined for not existing property                                 ', lang.isUndefined(lang.getProp(['foo', 'baz'], false, context)));
						wru.assert('should return create object for not existing property if we pass flag for creating', lang.isObject(lang.getProp(['foo', 'baz'], true, context)));
						wru.assert('should return undefined if context does not exist                                 ', lang.isUndefined(lang.getProp(['foo', 'baz'])));
						wru.assert('should return undefined if context does not exist#with create                     ', lang.isUndefined(lang.getProp(['foo', 'baz'], true)));
				}
		}, {
				name: 'lang#setObject',
				test: function() {
						var context = {};
						lang.setObject('foo.bar', {
								say: 'Miu'
						},
						context);

						wru.assert('should create name space in context      ', lang.isObject(context.foo.bar));
						wru.assert('should correct set value                 ', context.foo.bar.say === 'Miu');
						wru.assert('should create name space in global object', lang.setObject('my.namespace', {}) && lang.isObject(lang.global.my.namespace));
				}
		}, {
				name: 'lang#getObject',
				test: function() {
						var context = {
								foo: {
										bar: 'bar'
								}
						};
						lang.setObject('my.namespace', 'foo');

						wru.assert('should get object by name space in passed context                          ', lang.getObject('foo.bar', context) === 'bar');
						wru.assert('should get object by name space in global object if does not passed context', lang.getObject('my.namespace') === 'foo');
						wru.assert('should return undefined if object is not found#in context                  ', lang.isUndefined(lang.getObject('zoo.bar', context)));
						wru.assert('should return undefined if object is not found#global                      ', lang.isUndefined(lang.getObject('zoo.bar')));
				}
		}, {
				name: 'lang#exists',
				test: function() {
						var context = {};
						lang.setObject('foo.bar', 'exists', context);
						lang.setObject('my.namespace', 'exists');

						wru.assert('should return true        ', lang.exists('foo.bar', context));
						wru.assert('should return false       ', !lang.exists('zoo.bar', context));

						wru.assert('should return true#global ', lang.exists('my.namespace'));
						wru.assert('should return false#global', !lang.exists('zoo.namespace.zoo'));
				}
		}, {
				name: 'lang#replace',
				test: function() {
						var pattern = /#\{([^\}]+)\}/g,
								person = {
										name: 'Bob'
								};
						lang.setObject('person.name', 'Big Bob');

						wru.assert('should return replaced string#object               ', lang.replace('My name is {name}', person) === 'My name is Bob');
						wru.assert('should return replaced string#array                ', lang.replace('My name is {0} {1}', ['Bob', 'Bober']) === 'My name is Bob Bober');
						wru.assert('should return replaced string#with custom patterns ', lang.replace('My name is #{0} #{1}', ['Bob', 'Bober'], pattern) === 'My name is Bob Bober');

						wru.assert('should return replaced string#global               ', lang.replace('My name is {person.name}') === 'My name is Big Bob');
				}
		}, {
				name: 'lang#forEach',
				test: function() {
						var vector = [1, 2],
								count = 0,
								increment = function(num) {
										count += 1;
								};
						lang.forEach(vector, increment);

						wru.assert('should return replaced string#object', count === 2);
				}
		}, {
				name: 'lang#has',
				test: function() {
						lang.has.add('passed', true);

						wru.assert('should return true', lang.has('passed'));

						lang.has.add('passed', function() {
								return false;
						},
						true, true);

						wru.assert('should rewrite previeos "has" and retur false', !lang.has('passed'));
						wru.assert('should cached value                          ', lang.has.cache.passed === false);
				}
		}]);
}(this));
