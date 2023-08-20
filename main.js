console.log('Hello World!');
/**
 * TODO: atom fake editor object
 * This editor Object Currently doesn't have much functionality
 * but the functions here Requiring the Original
 * TextEditor Object for doing some operations and invocation
 * So this is the problem why some function is
 * returning error like:  editor.scopeDescriptorForBufferPosition
 */
var editor = document.createElement('h4');
editor.innerText = 'IF YOU CAN SEE THIS MESSAGE PLEASE TOGGLE THE WEBOUTLINE PANE ON AND OFF TO LOAD CSS STYLES.';

/**
 * Creating a easy fucntion 
 * to pass Text data on my editor object
 * @param {any} t 
 */
editor.setText = function(t) {
  this.element = document.body
  // Create message element

  editor.innerText = editor.innerText.concat('\n').concat(t);
  this.element.appendChild(editor)
  //message.classList.add('message');
}


/** beginnig main function */
editor.setText("Hello")


import Point from './lib/point.js';

import ScopeDescriptorHelper from './lib/ScopeDescriptorHelper.js';

var helper = new ScopeDescriptorHelper();

console.log("Start Operation")

foo();


/**
 * Dummy Testing The Progress 
 * I have did so far on this Project
 * @returns 
 */
function foo() {
  var bufferPosition, classList, endColumn, i, j, line, range, ref, ref1, results, source, startColumn;
  source = '<?php\n\n$test = \'string\';?>';
  editor.setText(source);
  classList = ['meta', 'string-contents', 'quoted', 'single', 'php'];
  line = 2;
  startColumn = 9;
  endColumn = 14;
  results = [];
  helper.say();
  for (i = j = ref = startColumn, ref1 = endColumn; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
    bufferPosition = new Point(2, i);
    //Here's where we run the actual operation
    range = helper.getBufferRangeForClassListAtPosition(editor, classList, bufferPosition, 1);
    console(range.start.row)
    console(range.start.column)
    console.log(range.end.row);
    results.push(range.end.column);
  }
  return results;
}