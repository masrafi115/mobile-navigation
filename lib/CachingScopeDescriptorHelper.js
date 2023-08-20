
import { Point} from './lib/point.js'
import { Range } from './lib/range.js'

var ScopeDescriptorHelper = (function() {
  function ScopeDescriptorHelper() {

}


  /**
   * @param {TextEditor} editor
   * @param {Point}      bufferPosition
   * @param {Number}     climbCount
   *
   * @return {Array}
   */

  ScopeDescriptorHelper.prototype.getClassListForBufferPosition = function(editor, bufferPosition, climbCount) {
    var classes, scopesArray;
    if (climbCount == null) {
      climbCount = 1;
    }
    scopesArray = editor.scopeDescriptorForBufferPosition(bufferPosition).getScopesArray();
    if (scopesArray == null) {
      return [];
    }
    if (climbCount > scopesArray.length) {
      return [];
    }
    classes = scopesArray[scopesArray.length - climbCount];
    if (classes == null) {
      return [];
    }
    return classes.split('.');
  };


  /**
   * Skips the scope descriptor at the specified location, returning the class list of the next one.
   *
   * @param {TextEditor} editor
   * @param {Point}      bufferPosition
   * @param {Number}     climbCountForPosition
   *
   * @return {Array}
   */

  ScopeDescriptorHelper.prototype.getClassListFollowingBufferPosition = function(editor, bufferPosition, climbCountForPosition) {
    var classList, range;
    classList = this.getClassListForBufferPosition(editor, bufferPosition, climbCountForPosition);
    range = this.getBufferRangeForClassListAtPosition(editor, classList, bufferPosition, 0);
    if (range == null) {
      return [];
    }
    ++range.end.column;
    classList = this.getClassListForBufferPosition(editor, range.end);
    return classList;
  };


  /**
   * Retrieves the (inclusive) start buffer position of the specified class list.
   *
   * @param {TextEditor}  editor
   * @param {Array}       classList
   * @param {Point}       bufferPosition
   * @param {Number}      climbCount
   *
   * @return {Point|null}
   */

  ScopeDescriptorHelper.prototype.getStartOfClassListAtPosition = function(editor, classList, bufferPosition, climbCount) {
    var currentClimbCount, doLoop, exitLoop, position, positionClassList, startPosition;
    if (climbCount == null) {
      climbCount = 1;
    }
    startPosition = null;
    position = bufferPosition.copy();
    while (true) {
      doLoop = false;
      exitLoop = false;
      currentClimbCount = climbCount;
      if (currentClimbCount === 0) {
        doLoop = true;
        currentClimbCount = 1;
      }
      while (true) {
        positionClassList = this.getClassListForBufferPosition(editor, position, currentClimbCount);
        if (positionClassList.length === 0) {
          exitLoop = true;
          break;
        }
        if (this.areArraysEqual(positionClassList, classList)) {
          break;
        }
        if (!doLoop) {
          exitLoop = true;
          break;
        }
        currentClimbCount++;
      }
      if (exitLoop) {
        break;
      }
      startPosition = editor.clipBufferPosition(position.copy());
      if (!this.moveToPreviousValidBufferPosition(editor, position)) {
        break;
      }
    }
    return startPosition;
  };


  /**
   * Retrieves the (exclusive) end buffer position of the specified class list.
   *
   * @param {TextEditor}  editor
   * @param {Array}       classList
   * @param {Point}       bufferPosition
   * @param {Number}      climbCount
   *
   * @return {Point|null}
   */

  ScopeDescriptorHelper.prototype.getEndOfClassListAtPosition = function(editor, classList, bufferPosition, climbCount) {
    var currentClimbCount, doLoop, endPosition, exitLoop, position, positionClassList;
    if (climbCount == null) {
      climbCount = 1;
    }
    endPosition = null;
    position = bufferPosition.copy();
    while (true) {
      doLoop = false;
      exitLoop = false;
      currentClimbCount = climbCount;
      if (currentClimbCount === 0) {
        doLoop = true;
        currentClimbCount = 1;
      }
      while (true) {
        positionClassList = this.getClassListForBufferPosition(editor, position, currentClimbCount);
        if (positionClassList.length === 0) {
          exitLoop = true;
          break;
        }
        if (this.areArraysEqual(positionClassList, classList)) {
          break;
        }
        if (!doLoop) {
          exitLoop = true;
          break;
        }
        currentClimbCount++;
      }
      if (exitLoop) {
        break;
      }
      endPosition = editor.clipBufferPosition(position.copy());
      if (!this.moveToNextValidBufferPosition(editor, position)) {
        break;
      }
    }
    if (endPosition != null) {
      endPosition.column++;
    }
    return endPosition;
  };


  /**
   * @param {TextEditor}  editor
   * @param {Array}       classList
   * @param {Point}       bufferPosition
   * @param {Number}      climbCount
   *
   * @return {Range|null}
   */

  ScopeDescriptorHelper.prototype.getBufferRangeForClassListAtPosition = function(editor, classList, bufferPosition, climbCount) {
    var end, range, start;
    if (climbCount == null) {
      climbCount = 1;
    }
    start = this.getStartOfClassListAtPosition(editor, classList, bufferPosition, climbCount);
    end = this.getEndOfClassListAtPosition(editor, classList, bufferPosition, climbCount);
    if (start == null) {
      return null;
    }
    if (end == null) {
      return null;
    }
    range = new Range(start, end);
    return range;
  };


  /**
   * @param {TextEditor} editor
   * @param {Point}      bufferPosition
   *
   * @return {Boolean}
   */

  ScopeDescriptorHelper.prototype.moveToPreviousValidBufferPosition = function(editor, bufferPosition) {
    var lineText;
    if (bufferPosition.row === 0 && bufferPosition.column === 0) {
      return false;
    }
    if (bufferPosition.column > 0) {
      bufferPosition.column--;
    } else {
      bufferPosition.row--;
      lineText = editor.lineTextForBufferRow(bufferPosition.row);
      if (lineText != null) {
        bufferPosition.column = Math.max(lineText.length - 1, 0);
      } else {
        bufferPosition.column = 0;
      }
    }
    return true;
  };


  /**
   * @param {TextEditor} editor
   * @param {Point}      bufferPosition
   *
   * @return {Boolean}
   */

  ScopeDescriptorHelper.prototype.moveToNextValidBufferPosition = function(editor, bufferPosition) {
    var lastBufferPosition, lineLength, lineText;
    lastBufferPosition = editor.clipBufferPosition([Infinity, Infinity]);
    if (bufferPosition.row === lastBufferPosition.row && bufferPosition.column === lastBufferPosition.column) {
      return false;
    }
    lineText = editor.lineTextForBufferRow(bufferPosition.row);
    if (lineText != null) {
      lineLength = lineText.length;
    } else {
      lineLength = 0;
    }
    if (bufferPosition.column < lineLength) {
      bufferPosition.column++;
    } else {
      bufferPosition.row++;
      bufferPosition.column = 0;
    }
    return true;
  };


  /**
   * @param {Array} left
   * @param {Array} right
   *
   * @return {Boolean}
   */

  ScopeDescriptorHelper.prototype.areArraysEqual = function(left, right) {
    var i, j, ref1;
    if (left.length !== right.length) {
      return false;
    }
    for (i = j = 0, ref1 = left.length - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
      if (left[i] !== right[i]) {
        return false;
      }
    }
    return true;
  };

  return ScopeDescriptorHelper;

})();

export {ScopeDescriptorHelper}
