import { Range } from './lib/range.js'
import { AbstractProvider} from './lib/AbstractProvider.js'

export class ConstantProvider extends AbstractProvider {

    constructor() {
        return ConstantProvider.__super__.constructor.apply(this, arguments);
    }


    /**
     * @inheritdoc
     */

    ConstantProvider.prototype.canProvideForBufferPosition = function(editor, bufferPosition) {
        var classList, climbCount, originalClassList;
        classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition);
        if (indexOf.call(classList, 'php') < 0) {
            return false;
        }
        if (indexOf.call(classList, 'constant') >= 0 && indexOf.call(classList, 'class') < 0) {
            return true;
        }
        if (indexOf.call(classList, 'namespace') >= 0 && indexOf.call(this.scopeDescriptorHelper.getClassListFollowingBufferPosition(editor, bufferPosition), 'constant') >= 0) {
            return true;
        }
        if (indexOf.call(classList, 'punctuation') >= 0) {
            originalClassList = classList;
            classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition, 2);
            if (indexOf.call(classList, 'namespace') >= 0) {
                climbCount = 1;
                if (indexOf.call(originalClassList, 'punctuation') >= 0) {
                    climbCount = 2;
                }
                if (indexOf.call(this.scopeDescriptorHelper.getClassListFollowingBufferPosition(editor, bufferPosition, climbCount), 'constant') >= 0) {
                    return true;
                }
            }
        }
        return false;
    };


    /**
     * @inheritdoc
     */

    ConstantProvider.prototype.getRangeForBufferPosition = function(editor, bufferPosition) {
        var classList, climbCount, constantRange, namespaceRange, originalClassList, prefixClassList, prefixRange, prefixText, range, suffixClassList;
        classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition);
        originalClassList = classList;
        if (indexOf.call(classList, 'punctuation') >= 0) {
            classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition, 2);
        }
        range = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, classList, bufferPosition, 0);
        if (indexOf.call(classList, 'constant') >= 0) {
            prefixRange = new Range(new Point(range.start.row, range.start.column - 2), new Point(range.start.row, range.start.column - 0));
            prefixText = editor.getTextInBufferRange(prefixRange);
            if (prefixText.endsWith("\\")) {
                prefixClassList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, prefixRange.start);
                if (indexOf.call(prefixClassList, "namespace") >= 0) {
                    namespaceRange = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, prefixClassList, prefixRange.start, 0);
                } else {
                    namespaceRange = range;
                    namespaceRange.start.column--;
                }
                range = namespaceRange.union(range);
            }
        } else if (indexOf.call(classList, 'namespace') >= 0) {
            climbCount = 1;
            if (indexOf.call(originalClassList, 'punctuation') >= 0) {
                climbCount = 2;
            }
            suffixClassList = this.scopeDescriptorHelper.getClassListFollowingBufferPosition(editor, bufferPosition, climbCount);
            if (indexOf.call(suffixClassList, 'constant') >= 0) {
                constantRange = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, suffixClassList, new Point(range.end.row, range.end.column + 1));
                range = range.union(constantRange);
            }
        } else {
            return null;
        }
        return range;
    };


    /**
     * @param {String} text
     *
     * @return {Promise}
     */

    ConstantProvider.prototype.getInfoFor = function(text) {
        var failureHandler, successHandler;
        successHandler = (function(_this) {
            return function(constants) {
                if ((text != null ? text[0] : void 0) !== '\\') {
                    text = '\\' + text;
                }
                if (!(constants && text in constants)) {
                    return null;
                }
                if (!constants[text].filename) {
                    return null;
                }
                return constants[text];
            };
        })(this);
        failureHandler = function() {};
        return this.service.getGlobalConstants().then(successHandler, failureHandler);
    };


    /**
     * @inheritdoc
     */



    return ConstantProvider;

}
