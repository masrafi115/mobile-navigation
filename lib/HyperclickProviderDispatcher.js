import { Point} from './lib/point.js'
import { Range } from './lib/range.js'
import { AbstractProvider} from './lib/AbstractProvider.js'

class HyperclickProviderDispatcher extends AbstractProvider {


    /**
     * @var {Array}
     */

    HyperclickProviderDispatcher.prototype.providers = null;


    /**
     * @var {Object}
     */

    HyperclickProviderDispatcher.prototype.service = null;


    /**
     * @var {Object}
     */

    HyperclickProviderDispatcher.prototype.cachingScopeDescriptorHelper = null;


    /**
     * @var {WeakMap}
     */

    HyperclickProviderDispatcher.prototype.editorChangeSubscriptions = null;


    /**
     * Constructor.
     *
     * @param {Object} cachingScopeDescriptorHelper
     */

    function HyperclickProviderDispatcher(cachingScopeDescriptorHelper) {
        this.cachingScopeDescriptorHelper = cachingScopeDescriptorHelper;
        this.providers = [];
        this.editorChangeSubscriptions = new WeakMap();
    }


    /**
     * @param {AbstractProvider} provider
     */

    HyperclickProviderDispatcher.prototype.addProvider = function(provider) {
        this.providers.push(provider);
        return provider.setService(this.service);
    };


    /**
     * @param {Object} service
     */

    HyperclickProviderDispatcher.prototype.setService = function(service) {
        var i, len, provider, ref1, results;
        this.service = service;
        ref1 = this.providers;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
            provider = ref1[i];
            results.push(provider.setService(service));
        }
        return results;
    };


    /**
     * @param {TextEditor} editor
     * @param {Point}      bufferPosition
     */

    HyperclickProviderDispatcher.prototype.getSuggestion = function(editor, bufferPosition) {
        var i, interestedProviderInfoList, len, provider, range, rangeToHighlight, ref1;
        rangeToHighlight = null;
        interestedProviderInfoList = [];
        this.registerEditorListenersIfNeeded(editor);
        ref1 = this.providers;
        for (i = 0, len = ref1.length; i < len; i++) {
            provider = ref1[i];
            if (provider.canProvideForBufferPosition(editor, bufferPosition)) {
                range = provider.getRangeForBufferPosition(editor, bufferPosition);
                interestedProviderInfoList.push({
range: range,
provider: provider
                });
                rangeToHighlight = range;
            }
        }
        if (rangeToHighlight == null) {
            return null;
        }
        return {
range:
            rangeToHighlight,
callback:
            (function(_this) {
                return function() {
                    var interestedProviderInfo, j, len1, results, text;
                    results = [];
                    for (j = 0, len1 = interestedProviderInfoList.length; j < len1; j++) {
                        interestedProviderInfo = interestedProviderInfoList[j];
                        if (interestedProviderInfo.range == null) {
                            continue;
                        }
                        text = editor.getTextInBufferRange(interestedProviderInfo.range);
                        results.push(interestedProviderInfo.provider.handleNavigation(editor, interestedProviderInfo.range, text));
                    }
                    return results;
                };
            })(this)
        };
    };


    /**
     * @param {TextEditor} editor
     */

    HyperclickProviderDispatcher.prototype.registerEditorListenersIfNeeded = function(editor) {
        if (!this.editorChangeSubscriptions.has(editor)) {
            return this.registerEditorListeners(editor);
        }
    };


    /**
     * @param {TextEditor} editor
     */

    HyperclickProviderDispatcher.prototype.registerEditorListeners = function(editor) {
        var onChangeDisposable;
        onChangeDisposable = editor.onDidStopChanging((function(_this) {
            return function() {
                return _this.cachingScopeDescriptorHelper.clearCache();
            };
        })(this));
        return this.editorChangeSubscriptions.set(editor, onChangeDisposable);
    };

    return HyperclickProviderDispatcher;

}
