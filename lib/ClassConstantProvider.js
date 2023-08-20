
import { Point} from './lib/point.js'
import { Range } from './lib/range.js'
import { AbstractProvider} from './lib/AbstractProvider.js'

export class  ClassConstantProvider extends AbstractProvider {
    
    constructor() {
        return ClassConstantProvider.__super__.constructor.apply(this, arguments);
    }


    /**
     * @inheritdoc
     */

    ClassConstantProvider.prototype.canProvideForBufferPosition = function(editor, bufferPosition) {
        var classList;
        classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition);
        if (indexOf.call(classList, 'php') < 0) {
            return false;
        }
        if (indexOf.call(classList, 'other') >= 0 && indexOf.call(classList, 'class') >= 0) {
            return true;
        }
        return false;
    };


    /**
     * @param {TextEditor} editor
     * @param {Point}      bufferPosition
     */

    ClassConstantProvider.prototype.getRangeForBufferPosition = function(editor, bufferPosition) {
        var classList, range;
        classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition);
        range = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, classList, bufferPosition);
        return range;
    };


    /**
     * @param {TextEditor} editor
     * @param {Point}      bufferPosition
     * @param {String}     text
     *
     * @return {Promise}
     */

    ClassConstantProvider.prototype.getInfoFor = function(editor, bufferPosition, text) {
        var failureHandler, successHandler;
        successHandler = (function(_this) {
            return function(members) {
                var member;
                if (!(members.length > 0)) {
                    return null;
                }
                member = members[0];
                if (!member.declaringStructure.filename) {
                    return null;
                }
                return member;
            };
        })(this);
        failureHandler = function() {};
        return this.getClassConstantsAt(editor, bufferPosition, text).then(successHandler, failureHandler);
    };


    /**
     * Returns the class constants used at the specified location.
     *
     * @param {TextEditor} editor         The text editor to use.
     * @param {Point}      bufferPosition The cursor location of the member.
     * @param {String}     name           The name of the member to retrieve information about.
     *
     * @return {Promise}
     */

    ClassConstantProvider.prototype.getClassConstantsAt = function(editor, bufferPosition, name) {
        var failureHandler, successHandler;
        successHandler = (function(_this) {
            return function(types) {
                var i, len, promises, type;
                promises = [];
                for (i = 0, len = types.length; i < len; i++) {
                    type = types[i];
                    promises.push(_this.getClassConstant(type, name));
                }
                return Promise.all(promises);
            };
        })(this);
        failureHandler = function() {};
        return this.service.getResultingTypesAt(editor, bufferPosition, true).then(successHandler, failureHandler);
    };


    /**
     * Retrieves information about the specified constant of the specified class.
     *
     * @param {String} className The full name of the class to examine.
     * @param {String} name      The name of the constant to retrieve information about.
     *
     * @return {Promise}
     */

    ClassConstantProvider.prototype.getClassConstant = function(className, name) {
        var failureHandler, successHandler;
        successHandler = (function(_this) {
            return function(classInfo) {
                if (name in classInfo.constants) {
                    return classInfo.constants[name];
                }
            };
        })(this);
        failureHandler = function() {};
        return this.service.getClassInfo(className).then(successHandler, failureHandler);
    };


    /**
     * @inheritdoc
     */

    
    return ClassConstantProvider;

}


