import { Point} from './lib/point.js'
import { Range } from './lib/range.js'
import { AbstractProvider} from './lib/AbstractProvider.js'

export class PropertyProvider extends AbstractProvider {

    constructor() {
        return PropertyProvider.__super__.constructor.apply(this, arguments);
    }


    /**
     * @inheritdoc
     */

    PropertyProvider.prototype.canProvideForBufferPosition = function(editor, bufferPosition) {
        var classList;
        classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition);
        if (indexOf.call(classList, 'php') < 0) {
            return false;
        }
        if (indexOf.call(classList, 'property') >= 0) {
            return true;
        }
        if (indexOf.call(classList, 'punctuation') >= 0 && indexOf.call(classList, 'definition') >= 0 && indexOf.call(classList, 'variable') >= 0) {
            classList = this.scopeDescriptorHelper.getClassListFollowingBufferPosition(editor, bufferPosition);
        }
        if (indexOf.call(classList, 'variable') >= 0 && indexOf.call(classList, 'other') >= 0 && indexOf.call(classList, 'class') >= 0) {
            return true;
        }
        return false;
    };


    /**
     * @param {TextEditor} editor
     * @param {Point}      bufferPosition
     */

    PropertyProvider.prototype.getRangeForBufferPosition = function(editor, bufferPosition) {
        var classList, positionAfterBufferPosition, prefixRange, prefixText, range, staticPropertyRange;
        classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition);
        range = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, classList, bufferPosition);
        if (indexOf.call(classList, 'punctuation') >= 0 && indexOf.call(classList, 'definition') >= 0 && indexOf.call(classList, 'variable') >= 0) {
            positionAfterBufferPosition = bufferPosition.copy();
            positionAfterBufferPosition.column++;
            classList = this.scopeDescriptorHelper.getClassListFollowingBufferPosition(editor, bufferPosition);
            staticPropertyRange = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, classList, positionAfterBufferPosition);
            range = range.union(staticPropertyRange);
        } else {
            prefixRange = new Range(new Point(range.start.row, range.start.column - 1), new Point(range.start.row, range.start.column - 0));
            prefixText = editor.getTextInBufferRange(prefixRange);
            if (prefixText === '$') {
                range.start.column--;
            }
        }
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

    PropertyProvider.prototype.getInfoFor = function(editor, bufferPosition, term) {
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
        return this.getClassPropertiesAt(editor, bufferPosition, term).then(successHandler, failureHandler);
    };


    /**
     * Returns the class properties used at the specified location.
     *
     * @param {TextEditor} editor         The text editor to use.
     * @param {Point}      bufferPosition The cursor location of the member.
     * @param {String}     name           The name of the member to retrieve information about.
     *
     * @return {Promise}
     */

    PropertyProvider.prototype.getClassPropertiesAt = function(editor, bufferPosition, name) {
        var failureHandler, successHandler;
        if (!this.isUsingProperty(editor, bufferPosition)) {
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
                    promises.push(_this.getClassProperty(type, name));
                }
                return Promise.all(promises);
            };
        })(this);
        failureHandler = function() {};
        return this.service.getResultingTypesAt(editor, bufferPosition, true).then(successHandler, failureHandler);
    };


    /**
     * Retrieves information about the specified property of the specified class.
     *
     * @param {String} className The full name of the class to examine.
     * @param {String} name      The name of the property to retrieve information about.
     *
     * @return {Promise}
     */

    PropertyProvider.prototype.getClassProperty = function(className, name) {
        var failureHandler, successHandler;
        successHandler = (function(_this) {
            return function(classInfo) {
                if (name in classInfo.properties) {
                    return classInfo.properties[name];
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
     * @example When querying "$this->test", using a position inside 'test' will return true.
     *
     * @param {TextEditor} editor
     * @param {Point}      bufferPosition
     *
     * @return {boolean}
     */

    PropertyProvider.prototype.isUsingProperty = function(editor, bufferPosition) {
        var scopeDescriptor;
        scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition).getScopeChain();
        return scopeDescriptor.indexOf('.property') !== -1;
    };

    return PropertyProvider;

}