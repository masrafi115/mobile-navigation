
import { Point} from './lib/point.js'
import { Range } from './lib/range.js'
import { AbstractProvider} from './lib/AbstractProvider.js'

export class  ClassProvider extends AbstractProvider {

    constructor() {
        return ClassProvider.__super__.constructor.apply(this, arguments);
    }


    /**
     * A list of all markers that have been placed inside comments to allow code navigation there as well.
     *
     * @var {Object}
     */

    ClassProvider.prototype.markers = null;


    /**
     * @inheritdoc
     */

    ClassProvider.prototype.canProvideForBufferPosition = function(editor, bufferPosition) {
        var classList, classListFollowingBufferPosition, climbCount;
        classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition);
        if (indexOf.call(classList, 'php') < 0) {
            return false;
        }
        climbCount = 1;
        if (indexOf.call(classList, 'punctuation') >= 0 && indexOf.call(classList, 'inheritance') >= 0) {
            classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition, 2);
            climbCount = 2;
        }
        if (indexOf.call(classList, 'class') >= 0 && indexOf.call(classList, 'support') >= 0) {
            return true;
        }
        if (indexOf.call(classList, 'inherited-class') >= 0) {
            return true;
        }
        if (indexOf.call(classList, 'namespace') >= 0 && indexOf.call(classList, 'use') >= 0) {
            return true;
        }
        if (indexOf.call(classList, 'phpdoc') >= 0) {
            return true;
        }
        if (indexOf.call(classList, 'comment') >= 0) {
            return true;
        }
        if (indexOf.call(classList, 'namespace') >= 0) {
            classListFollowingBufferPosition = this.scopeDescriptorHelper.getClassListFollowingBufferPosition(editor, bufferPosition, climbCount);
            if ((indexOf.call(classListFollowingBufferPosition, 'class') >= 0 && indexOf.call(classListFollowingBufferPosition, 'support') >= 0) || indexOf.call(classListFollowingBufferPosition, 'inherited-class') >= 0) {
                return true;
            }
        }
        return false;
    };


    /**
     * @param {TextEditor} editor
     * @param {Point}      bufferPosition
     */

    ClassProvider.prototype.getRangeForBufferPosition = function(editor, bufferPosition) {
        var classList, classNameRange, climbCount, i, len, lineText, namespaceRange, newBufferPosition, prefixClassList, prefixRange, prefixText, range, ranges, suffixClassList;
        classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition);
        climbCount = 1;
        if (indexOf.call(classList, 'punctuation') >= 0 && indexOf.call(classList, 'inheritance') >= 0) {
            classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, bufferPosition, 2);
            climbCount = 2;
        }
        range = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, classList, bufferPosition, 0);
        if (range == null) {
            newBufferPosition = bufferPosition.copy();
            --newBufferPosition.column;
            classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, newBufferPosition);
            if (indexOf.call(classList, 'punctuation') >= 0 && indexOf.call(classList, 'inheritance') >= 0) {
                classList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, newBufferPosition, 2);
            }
            range = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, classList, newBufferPosition);
            ++bufferPosition.column;
        }
        if ((indexOf.call(classList, 'class') >= 0 && indexOf.call(classList, 'support') >= 0) || indexOf.call(classList, 'inherited-class') >= 0) {
            prefixRange = new Range(new Point(range.start.row, range.start.column - 1), new Point(range.start.row, range.start.column - 0));
            prefixText = editor.getTextInBufferRange(prefixRange);
            if (prefixText === "\\") {
                prefixClassList = this.scopeDescriptorHelper.getClassListForBufferPosition(editor, prefixRange.start, 2);
                if (indexOf.call(prefixClassList, "namespace") >= 0) {
                    namespaceRange = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, prefixClassList, prefixRange.start, 0);
                } else {
                    namespaceRange = range;
                    namespaceRange.start.column--;
                }
                if (namespaceRange != null) {
                    range = namespaceRange.union(range);
                }
            }
        } else if (indexOf.call(classList, 'namespace') >= 0) {
            suffixClassList = this.scopeDescriptorHelper.getClassListFollowingBufferPosition(editor, bufferPosition, climbCount);
            if ((indexOf.call(suffixClassList, 'class') >= 0 && indexOf.call(suffixClassList, 'support') >= 0) || indexOf.call(suffixClassList, 'inherited-class') >= 0) {
                classNameRange = this.scopeDescriptorHelper.getBufferRangeForClassListAtPosition(editor, suffixClassList, new Point(range.end.row, range.end.column + 1));
                if (classNameRange != null) {
                    range = range.union(classNameRange);
                }
            }
        } else if (indexOf.call(classList, 'phpdoc') >= 0 || indexOf.call(classList, 'comment') >= 0) {
            lineText = editor.lineTextForBufferRow(bufferPosition.row);
            ranges = [];
            if (/@param|@var|@return|@throws|@see/g.test(lineText)) {
                ranges = this.getRangesForDocblockLine(lineText.split(' '), parseInt(bufferPosition.row), editor, true, 0, 0, false);
            } else if (/@\\?([A-Za-z0-9_]+)\\?([A-Za-zA-Z_\\]*)?/g.test(lineText)) {
                ranges = this.getRangesForDocblockLine(lineText.split(' '), parseInt(bufferPosition.row), editor, true, 0, 0, true);
            }
            for (i = 0, len = ranges.length; i < len; i++) {
                range = ranges[i];
                if (range.containsPoint(bufferPosition)) {
                    return range;
                }
            }
            return null;
        }
        return range;
    };


    /**
     * @param {Array}      words        The array of words to check.
     * @param {Number}     rowIndex     The current row the words are on within the editor.
     * @param {TextEditor} editor       The editor the words are from.
     * @param {bool}       shouldBreak  Flag to say whether the search should break after finding 1 class.
     * @param {Number}     currentIndex The current column index the search is on.
     * @param {Number}     offset       Any offset that should be applied when creating the marker.
     */

    ClassProvider.prototype.getRangesForDocblockLine = function(words, rowIndex, editor, shouldBreak, currentIndex, offset, isAnnotation) {
        var key, newValue, range, ranges, regex, value;
        if (currentIndex == null) {
            currentIndex = 0;
        }
        if (offset == null) {
            offset = 0;
        }
        if (isAnnotation == null) {
            isAnnotation = false;
        }
        if (isAnnotation) {
            regex = /^@(\\?(?:[A-Za-z0-9_]+)\\?(?:[A-Za-zA-Z_\\]*)?)/g;
        } else {
            regex = /^(\\?(?:[A-Za-z0-9_]+)\\?(?:[A-Za-zA-Z_\\]*)?)/g;
        }
        ranges = [];
        for (key in words) {
            value = words[key];
            if (value.length === 0) {
                continue;
            }
            newValue = value.match(regex);
            if ((newValue != null) && this.service.isBasicType(value) === false) {
                newValue = newValue[0];
                if (value.includes('|')) {
                    ranges = ranges.concat(this.getRangesForDocblockLine(value.split('|'), rowIndex, editor, false, currentIndex, parseInt(key)));
                } else {
                    if (isAnnotation) {
                        newValue = newValue.substr(1);
                        currentIndex += 1;
                    }
                    range = new Range(new Point(rowIndex, currentIndex + parseInt(key) + offset), new Point(rowIndex, currentIndex + parseInt(key) + newValue.length + offset));
                    ranges.push(range);
                }
                if (shouldBreak === true) {
                    break;
                }
            }
            currentIndex += value.length;
        }
        return ranges;
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


    return ClassProvider;
};

