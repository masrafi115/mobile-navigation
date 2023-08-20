import { Point} from './lib/point.js'
import { Range } from './lib/range.js'
import { AbstractProvider} from './lib/AbstractProvider.js'

export class MethodProvider extends AbstractProvider {
    extend(MethodProvider, superClass);

    constructor() {
        return MethodProvider.__super__.constructor.apply(this, arguments);
    }


    /**
     * @inheritdoc
     */

    MethodProvider.prototype.canProvideForBufferPosition = function(editor, bufferPosition) {
        var classList;
        classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition);
        if (indexOf.call(classList, 'php') < 0) {
            return false;
        }
        if (indexOf.call(classList, 'function-call') >= 0 && (indexOf.call(classList, 'object') >= 0 || indexOf.call(classList, 'static') >= 0)) {
            return true;
        }
        return false;
    };


    /**
     * @param {TextEditor} editor
     * @param {Point}      bufferPosition
     */

    MethodProvider.prototype.getRangeForBufferPosition = function(editor, bufferPosition) {
        var classList, range;
        classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition);
        range = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, classList, bufferPosition);
        return range;
    };


    /**
     * Convenience method that returns information for the specified term.
     *
     * @param {TextEditor} editor
     * @param {Point}      bufferPosition
     * @param {String}     term
     *
     * @return {Promise}
     */

    MethodProvider.prototype.getInfoFor = function(editor, bufferPosition, term) {
        var failureHandler, successHandler;
        successHandler = (function(_this) {
            return function(members) {
                var member;
                if (!(members.length > 0)) {
                    return null;
                }
                member = members[0];
                return member;
            };
        })(this);
        failureHandler = function() {};
        return this.getClassMethodsAt(editor, bufferPosition, term).then(successHandler, failureHandler);
    };


    /**
     * Returns the class methods used at the specified location.
     *
     * @param {TextEditor} editor         The text editor to use.
     * @param {Point}      bufferPosition The cursor location of the member.
     * @param {String}     name           The name of the member to retrieve information about.
     *
     * @return {Promise}
     */

    MethodProvider.prototype.getClassMethodsAt = function(editor, bufferPosition, name) {
        var failureHandler, successHandler;
        if (!this.isUsingMethod(editor, bufferPosition)) {
            return new Promise(function(resolve, reject) {
                return resolve(null);
            });
        }
        successHandler = (function(_this) {
            return function(types) {
                var i, len, promises, type;
                promises = [];
                for (i = 0, len = types.length; i < len; i++) {
                    type = types[i];
                    promises.push(_this.getClassMethod(type, name));
                }
                return Promise.all(promises);
            };
        })(this);
        failureHandler = function() {};
        return this.service.getResultingTypesAt(editor, bufferPosition, true).then(successHandler, failureHandler);
    };


    /**
     * Retrieves information about the specified method of the specified class.
     *
     * @param {String} className The full name of the class to examine.
     * @param {String} name      The name of the method to retrieve information about.
     *
     * @return {Promise}
     */

    MethodProvider.prototype.getClassMethod = function(className, name) {
        var failureHandler, successHandler;
        successHandler = (function(_this) {
            return function(classInfo) {
                if (name in classInfo.methods) {
                    return classInfo.methods[name];
                }
            };
        })(this);
        failureHandler = function() {};
        return this.service.getClassInfo(className).then(successHandler, failureHandler);
    };


    /**
     * @inheritdoc
     */

    
    /**
     * @example When querying "$this->test()", using a position inside 'test' will return true.
     *
     * @param {TextEditor} editor
     * @param {Point}      bufferPosition
     *
     * @return {boolean}
     */

    MethodProvider.prototype.isUsingMethod = function(editor, bufferPosition) {
        var scopeDescriptor;
        scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition).getScopeChain();
        return scopeDescriptor.indexOf('.property') === -1;
    };

    return MethodProvider;

}