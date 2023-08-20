import { Range } from './lib/range.js'
import { AbstractProvider} from './lib/AbstractProvider.js'

export class  FunctionProvider extends AbstractProvider {
    constructor() {
        return FunctionProvider.__super__.constructor.apply(this, arguments);
    }


    /**
     * @inheritdoc
     */

    FunctionProvider.prototype.canProvideForBufferPosition = function(editor, bufferPosition) {
        var classList, classListFollowingBufferPosition, range;
        range = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, ['meta', 'function-call', 'php'], bufferPosition, 0);
        if (range != null) {
            return true;
        }
        classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition);
        if (indexOf.call(classList, 'php') < 0) {
            return false;
        }
        if (indexOf.call(classList, 'support') >= 0 && indexOf.call(classList, 'function') >= 0) {
            return true;
        }
        if (indexOf.call(classList, 'punctuation') >= 0) {
            classListFollowingBufferPosition = this.scopeDescriptorHelper.getClassListFollowingBufferPosition(editor, bufferPosition);
            if (indexOf.call(classListFollowingBufferPosition, 'support') >= 0 && indexOf.call(classListFollowingBufferPosition, 'function') >= 0) {
                return true;
            }
        }
        return false;
    };


    /**
     * @param {TextEditor} editor
     * @param {Point}      bufferPosition
     */

    FunctionProvider.prototype.getRangeForBufferPosition = function(editor, bufferPosition) {
        var classList, functionCallRange, positionAfterBufferPosition, prefixRange, prefixText, range;
        range = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, ['meta', 'function-call', 'php'], bufferPosition, 0);
        if (range == null) {
            classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition);
            range = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, classList, bufferPosition);
            if (indexOf.call(classList, 'punctuation') >= 0) {
                positionAfterBufferPosition = bufferPosition.copy();
                positionAfterBufferPosition.column++;
                classList = this.scopeDescriptorHelper.getClassListFollowingBufferPosition(editor, bufferPosition);
                functionCallRange = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, classList, positionAfterBufferPosition);
                range = range.union(functionCallRange);
            } else {
                prefixRange = new Range(new Point(range.start.row, range.start.column - 1), new Point(range.start.row, range.start.column - 0));
                prefixText = editor.getTextInBufferRange(prefixRange);
                if (prefixText === '\\') {
                    range.start.column--;
                }
            }
        }
        return range;
    };


    /**
     * @param {String} text
     *
     * @return {Promise}
     */

    FunctionProvider.prototype.getInfoFor = function(text) {
        var failureHandler, successHandler;
        successHandler = (function(_this) {
            return function(functions) {
                if ((text != null ? text[0] : void 0) !== '\\') {
                    text = '\\' + text;
                }
                if (!(functions && text in functions)) {
                    return null;
                }
                return functions[text];
            };
        })(this);
        failureHandler = function() {};
        return this.service.getGlobalFunctions().then(successHandler, failureHandler);
    };


    /**
     * @inheritdoc
     */

    

    return FunctionProvider;

}