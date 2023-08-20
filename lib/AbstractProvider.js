
import { Point} from './lib/point.js'
import { Range } from './lib/range.js'

var AbstractProvider = (function() {

    /**
     * @var {Object}
     */
    AbstractProvider.prototype.service = null;


    /**
     * @var {Object}
     */

    AbstractProvider.prototype.scopeDescriptorHelper = null;


    /**
     * @param {Object} scopeDescriptorHelper
     */

    function AbstractProvider(scopeDescriptorHelper) {
        this.scopeDescriptorHelper = scopeDescriptorHelper;
    }


    /**
     * @param {Object} service
     */

    AbstractProvider.prototype.setService = function(service) {
        return this.service = service;
    };


    /**
     * @param {TextEditor} editor
     * @param {Point}      bufferPosition
     *
     * @return {boolean}
     */

    AbstractProvider.prototype.canProvideForBufferPosition = function(editor, bufferPosition) {
        throw new Error("This method is abstract and must be implemented!");
    };


    /**
     * @param {TextEditor} editor
     * @param {Range}      range
     * @param {String}     text
     */

    AbstractProvider.prototype.handleNavigation = function(editor, range, text) {
        if (!this.service) {
            return;
        }
        return this.handleSpecificNavigation(editor, range, text);
    };


    /**
     * @param {TextEditor} editor
     * @param {Range}      range
     * @param {String}     text
     */

    AbstractProvider.prototype.handleSpecificNavigation = function(editor, range, text) {
        throw new Error("This method is abstract and must be implemented!");
    };

    return AbstractProvider;

})();
export {AbstractProvider}