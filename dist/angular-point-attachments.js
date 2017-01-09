(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("angular-point"), require("lodash"), require("toastr"));
	else if(typeof define === 'function' && define.amd)
		define(["angular-point", "lodash", "toastr"], factory);
	else if(typeof exports === 'object')
		exports["angular-point-attachments"] = factory(require("angular-point"), require("lodash"), require("toastr"));
	else
		root["angular-point-attachments"] = factory(root["angular-point"], root["lodash"], root["toastr"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_toastr__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_toastr___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_toastr__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_lodash__);
/* harmony export (binding) */ __webpack_require__.d(exports, "a", function() { return APAttachmentsComponent; });
// import {ListItem} from '../angular-point/factories/apListItemFactory';


var APAttachmentsController = (function () {
    function APAttachmentsController($scope, $sce, $q, $timeout, apDataService) {
        this.$scope = $scope;
        this.$sce = $sce;
        this.$q = $q;
        this.$timeout = $timeout;
        this.apDataService = apDataService;
        this.uploading = false;
    }
    APAttachmentsController.prototype.$onInit = function () {
        var $ctrl = this;
        /** Can't manipulate attachments for listItems that haven't been saved to the server */
        if (!this.$scope.listItem || !this.$scope.listItem.id) {
            return;
        }
        $ctrl.listItem = this.$scope.listItem;
        $ctrl.listItem.attachments = $ctrl.listItem.attachments || [];
    };
    APAttachmentsController.prototype.deleteAttachment = function (attachment) {
        var _this = this;
        var confirmation = window.confirm('Are you sure you want to delete this file?');
        if (confirmation) {
            __WEBPACK_IMPORTED_MODULE_0_toastr__["info"]('Negotiating with the server');
            this.listItem.deleteAttachment(attachment).then(function () {
                _this.syncronizeRemoteChanges();
                __WEBPACK_IMPORTED_MODULE_0_toastr__["success"]('Attachment successfully deleted');
                if (__WEBPACK_IMPORTED_MODULE_1_lodash__["isFunction"](_this.$scope.changeEvent)) {
                    _this.$scope.changeEvent();
                }
            });
        }
    };
    APAttachmentsController.prototype.fileName = function (attachment) {
        var index = attachment.lastIndexOf('/') + 1;
        return attachment.substr(index);
    };
    APAttachmentsController.prototype.getFileBuffer = function (file) {
        var deferred = this.$q.defer();
        var reader = new FileReader();
        reader.onload = function (e) {
            deferred.resolve(e.target.result);
        };
        reader.onerror = function (e) {
            deferred.reject(e.target.error);
        };
        reader.readAsArrayBuffer(file);
        return deferred.promise;
    };
    /**
     *  Events from the iframe don't automatically sync with the cache so we need to get
     *  the updated list item which will extend the changes to our local referenced list
     *  item.
     */
    APAttachmentsController.prototype.syncronizeRemoteChanges = function () {
        var _this = this;
        var model = this.listItem.getModel();
        model.getListItemById(this.listItem.id)
            .then(function (updatedItem) {
            if (_this.listItem.attachments !== updatedItem.attachments) {
                _this.listItem.attachments = updatedItem.attachments;
            }
        });
    };
    APAttachmentsController.prototype.uploadAttachment = function () {
        var _this = this;
        var el = document.getElementById('ap-file');
        var file = el.files[0];
        /** Ensure file name contains no illegal characters */
        if (file && this.validateFileName(file.name)) {
            this.getFileBuffer(file).then(function (buffer) {
                var binary = '';
                var bytes = new Uint8Array(buffer);
                var i = bytes.byteLength;
                while (i--) {
                    binary = String.fromCharCode(bytes[i]) + binary;
                }
                _this.uploading = true;
                _this.apDataService.serviceWrapper({
                    operation: 'AddAttachment',
                    listName: _this.listItem.getModel().list.getListId(),
                    listItemID: _this.listItem.id,
                    fileName: file.name,
                    attachment: btoa(binary)
                }).then(function () {
                    _this.uploading = false;
                    __WEBPACK_IMPORTED_MODULE_0_toastr__["success"]('File successfully uploaded');
                    _this.syncronizeRemoteChanges();
                }, function (err) {
                    _this.uploading = false;
                    __WEBPACK_IMPORTED_MODULE_0_toastr__["error"]('There was a problem completing the upload.');
                });
            });
        }
    };
    /**
     * @description Check to ensure file to be uploaded doesn't contain any illegal SharePoint characters.
     * @param {string} fileName The name of the file to be uploaded.
     * @returns {boolean} Is the file name valid?
     */
    APAttachmentsController.prototype.validateFileName = function (fileName) {
        var isValid = true;
        var userMessage = '';
        var illegalCharacters = ['~', '#', '%', '&', '*', '{', '}', '\\', '/', ':', '<', '>', '?', '|', '"', '..'];
        __WEBPACK_IMPORTED_MODULE_1_lodash__["each"](illegalCharacters, function (illegalCharacter) {
            if (fileName.indexOf(illegalCharacter) > -1) {
                userMessage = 'The ' + illegalCharacter + ' character isn\'t allowed to be used in a file name.';
                /** Break loop early */
                return isValid = false;
            }
        });
        /** You cannot use the period character at the end of a file name. */
        if (fileName[fileName.length - 1] === '.') {
            userMessage = 'You cannot use the period character at the end of a file name.';
            isValid = false;
        }
        /** You cannot start a file name with the period. */
        if (fileName[0] === '.') {
            userMessage = 'You cannot start a file name with the period.';
            isValid = false;
        }
        /** Don't continue evaluating if a problem has already been found */
        if (!isValid) {
            userMessage += '  Please update the file on your system and upload again.';
            __WEBPACK_IMPORTED_MODULE_0_toastr__["error"](userMessage);
        }
        return isValid;
    };
    return APAttachmentsController;
}());
APAttachmentsController.$inject = ['$scope', '$sce', '$q', '$timeout', 'apDataService'];
/**
 * @ngdoc Component
 * @name angularPoint.Component:apAttachments
 * @element span
 * @function
 *
 * @description
 * Uses an iFrame to hijack the portions of the upload attachment form that we would like to show to the user. Adds
 * event listeners on the form and waits for an upload to complete, then queries for the updated list of attachments
 * to display below the form, and resets the iFrame.  The listed attachments are linked to allow opening and also
 * provide delete functionality to disassociate with the list item.
 *
 *
 * @param {object} listItem The list item that we'd like to view/add attachments.
 * @param {function} [changeEvent] Callback when the attachments have been updated.
 *
 * @example
 * <pre>
 *     <span data-ap-attachments
 *      data-list-item='verification'
 *      data-change-event='fetchAttachments'></span>
 * </pre>
 */
var APAttachmentsComponent = {
    bindings: {
        listItem: '<',
        changeEvent: '<?' // Optional - called after an attachment is deleted
    },
    controller: APAttachmentsController,
    template: __webpack_require__(2)
};


/***/ },
/* 1 */
/***/ function(module, exports) {

module.exports = require("angular-point");

/***/ },
/* 2 */
/***/ function(module, exports) {

module.exports = "<div>\n\t<style type=\"text/css\">\n\t\t.ap-attachments-container {\n            min-height: 200px;\n        }\n\n        .ap-attachments-container .ap-add-attachments {\n            height: 110px;\n        }\n\n        .ap-attachments-container .ap-add-attachments iframe {\n            height: 95px;\n        }\n\t</style>\n\t<div class=\"ap-attachments-container\">\n\t\t<div ng-if=\"!$ctrl.uploading\">\n\t\t\t<div class=\"input-group\">\n\t\t\t\t<input type=\"file\" id=\"ap-file\" name=\"file\" class=\"form-control\">\n\t\t\t\t<span class=\"input-group-btn\">\n\t\t\t\t\t<button class=\"btn btn-primary\" type=\"button\" ng-click=\"$ctrl.uploadAttachment()\">Add</button>\n\t\t\t\t</span>\n\t\t\t</div>\n\t\t\t<p class=\"help-block\">Select the files you want to upload and then click the Add button.</p>\n\t\t</div>\n\t\t<div ng-show=\"$ctrl.uploading\" class=\"alert alert-info txt-align-center\">\n\t\t\t<i class=\"fa fa-spinner fa-spin\"></i>processing request...</div>\n\t\t\t\n\t\t<!---==============LIST OF ATTACHMENTS=============-->\n\t\t<div ng-if=\"$ctrl.listItem.attachments.length > 0\">\n\t\t\t<hr class=\"hr-sm\">\n\t\t\t<h4>\n\t\t\t\t<small>Attachments</small>\n\t\t\t</h4>\n\t\t\t<ul class=\"list-unstyled\">\n\t\t\t\t<li ng-repeat=\"attachment in $ctrl.listItem.attachments\">\n\t\t\t\t\t<a href=\"{{ attachment }}\" target=\"_blank\">{{ $ctrl.fileName(attachment) }}</a>\n\t\t\t\t\t<button type=\"button\" class=\"btn btn-link\" ng-click=\"$ctrl.deleteAttachment(attachment)\" title=\"Delete this attachment\">\n\t\t\t\t\t\t<i class=\"fa fa-times red\"></i>\n\t\t\t\t\t</button>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>\n\t</div>\n</div>"

/***/ },
/* 3 */
/***/ function(module, exports) {

module.exports = require("lodash");

/***/ },
/* 4 */
/***/ function(module, exports) {

module.exports = require("toastr");

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_angular_point__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_angular_point___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_angular_point__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__apAttachments__ = __webpack_require__(0);


__WEBPACK_IMPORTED_MODULE_0_angular_point__["AngularPointModule"]
    .component('apAttachments', __WEBPACK_IMPORTED_MODULE_1__apAttachments__["a" /* APAttachmentsComponent */]);


/***/ }
/******/ ]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAyM2Q1ZGJkNGY1M2E4OTdjNGQ2YSIsIndlYnBhY2s6Ly8vLi9zcmMvYXBBdHRhY2htZW50cy50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJhbmd1bGFyLXBvaW50XCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwQXR0YWNobWVudHMuaHRtbCIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJsb2Rhc2hcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJ0b2FzdHJcIiIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxtREFBMkMsY0FBYzs7QUFFekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzdEQTtBQUFBLHlFQUF5RTtBQUN4QztBQUNMO0FBa0I1QjtJQUtJLGlDQUFvQixNQUF3QixFQUFVLElBQUksRUFBVSxFQUFFLEVBQVUsUUFBUSxFQUFVLGFBQWE7UUFBM0YsV0FBTSxHQUFOLE1BQU0sQ0FBa0I7UUFBVSxTQUFJLEdBQUosSUFBSTtRQUFVLE9BQUUs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Q0FBQyxDQUFDIiwiZmlsZSI6ImFuZ3VsYXItcG9pbnQtYXR0YWNobWVudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJhbmd1bGFyLXBvaW50XCIpLCByZXF1aXJlKFwibG9kYXNoXCIpLCByZXF1aXJlKFwidG9hc3RyXCIpKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtcImFuZ3VsYXItcG9pbnRcIiwgXCJsb2Rhc2hcIiwgXCJ0b2FzdHJcIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiYW5ndWxhci1wb2ludC1hdHRhY2htZW50c1wiXSA9IGZhY3RvcnkocmVxdWlyZShcImFuZ3VsYXItcG9pbnRcIiksIHJlcXVpcmUoXCJsb2Rhc2hcIiksIHJlcXVpcmUoXCJ0b2FzdHJcIikpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImFuZ3VsYXItcG9pbnQtYXR0YWNobWVudHNcIl0gPSBmYWN0b3J5KHJvb3RbXCJhbmd1bGFyLXBvaW50XCJdLCByb290W1wibG9kYXNoXCJdLCByb290W1widG9hc3RyXCJdKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMV9fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzNfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV80X18pIHtcbnJldHVybiBcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vcnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbiBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9yeSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0fSk7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9cIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA1KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAyM2Q1ZGJkNGY1M2E4OTdjNGQ2YSIsImltcG9ydCB7TGlzdEl0ZW19IGZyb20gJ2FuZ3VsYXItcG9pbnQnO1xuLy8gaW1wb3J0IHtMaXN0SXRlbX0gZnJvbSAnLi4vYW5ndWxhci1wb2ludC9mYWN0b3JpZXMvYXBMaXN0SXRlbUZhY3RvcnknO1xuaW1wb3J0ICogYXMgdG9hc3RyIGZyb20gJ3RvYXN0cic7XG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5cbi8vIHZhciAkc2NlLCAkcSwgJHRpbWVvdXQsIGFwRGF0YVNlcnZpY2U7XG5cbi8vIGludGVyZmFjZSBJTGlzdEl0ZW1XaXRoQXR0YWNobWVudHMgZXh0ZW5kcyBMaXN0SXRlbTxhbnk+IHtcbi8vICAgICAuLi5MaXN0SXRlbSxcbi8vICAgICBhdHRhY2htZW50czogc3RyaW5nW107XG4vLyB9XG4vL1xuLy8gdHlwZSBJTGlzdEl0ZW1XaXRoQXR0YWNobWVudHMgZXh0ZW5kcyBMaXN0SXRlbSB7XG4vL1xuLy8gfVxuXG5pbnRlcmZhY2UgSUNvbnRyb2xsZXJTY29wZSB7XG4gICAgY2hhbmdlRXZlbnQ/KCk7XG4gICAgbGlzdEl0ZW06IExpc3RJdGVtO1xufVxuXG5jbGFzcyBBUEF0dGFjaG1lbnRzQ29udHJvbGxlciB7XG4gICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckc2NlJywgJyRxJywgJyR0aW1lb3V0JywgJ2FwRGF0YVNlcnZpY2UnXTtcbiAgICBsaXN0SXRlbTogTGlzdEl0ZW07XG4gICAgdXBsb2FkaW5nID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRzY29wZTogSUNvbnRyb2xsZXJTY29wZSwgcHJpdmF0ZSAkc2NlLCBwcml2YXRlICRxLCBwcml2YXRlICR0aW1lb3V0LCBwcml2YXRlIGFwRGF0YVNlcnZpY2UpIHt9XG5cbiAgICAkb25Jbml0KCkge1xuICAgICAgICBjb25zdCAkY3RybCA9IHRoaXM7XG5cbiAgICAgICAgLyoqIENhbid0IG1hbmlwdWxhdGUgYXR0YWNobWVudHMgZm9yIGxpc3RJdGVtcyB0aGF0IGhhdmVuJ3QgYmVlbiBzYXZlZCB0byB0aGUgc2VydmVyICovXG4gICAgICAgIGlmICghdGhpcy4kc2NvcGUubGlzdEl0ZW0gfHwgIXRoaXMuJHNjb3BlLmxpc3RJdGVtLmlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJGN0cmwubGlzdEl0ZW0gPSB0aGlzLiRzY29wZS5saXN0SXRlbTtcbiAgICAgICAgJGN0cmwubGlzdEl0ZW0uYXR0YWNobWVudHMgPSAkY3RybC5saXN0SXRlbS5hdHRhY2htZW50cyB8fCBbXTtcbiAgICB9XG5cbiAgICBkZWxldGVBdHRhY2htZW50KGF0dGFjaG1lbnQpIHtcbiAgICAgICAgY29uc3QgY29uZmlybWF0aW9uID0gd2luZG93LmNvbmZpcm0oJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBmaWxlPycpO1xuICAgICAgICBpZiAoY29uZmlybWF0aW9uKSB7XG4gICAgICAgICAgICB0b2FzdHIuaW5mbygnTmVnb3RpYXRpbmcgd2l0aCB0aGUgc2VydmVyJyk7XG4gICAgICAgICAgICB0aGlzLmxpc3RJdGVtLmRlbGV0ZUF0dGFjaG1lbnQoYXR0YWNobWVudCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zeW5jcm9uaXplUmVtb3RlQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKCdBdHRhY2htZW50IHN1Y2Nlc3NmdWxseSBkZWxldGVkJyk7XG4gICAgICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLiRzY29wZS5jaGFuZ2VFdmVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuY2hhbmdlRXZlbnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpbGVOYW1lKGF0dGFjaG1lbnQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBhdHRhY2htZW50Lmxhc3RJbmRleE9mKCcvJykgKyAxO1xuICAgICAgICByZXR1cm4gYXR0YWNobWVudC5zdWJzdHIoaW5kZXgpO1xuICAgIH1cblxuICAgIGdldEZpbGVCdWZmZXIoZmlsZSkge1xuICAgICAgICBjb25zdCBkZWZlcnJlZCA9IHRoaXMuJHEuZGVmZXIoKTtcblxuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZTogYW55KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGUudGFyZ2V0LnJlc3VsdCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbiAoZTogYW55KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZS50YXJnZXQuZXJyb3IpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihmaWxlKTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAgRXZlbnRzIGZyb20gdGhlIGlmcmFtZSBkb24ndCBhdXRvbWF0aWNhbGx5IHN5bmMgd2l0aCB0aGUgY2FjaGUgc28gd2UgbmVlZCB0byBnZXRcbiAgICAgKiAgdGhlIHVwZGF0ZWQgbGlzdCBpdGVtIHdoaWNoIHdpbGwgZXh0ZW5kIHRoZSBjaGFuZ2VzIHRvIG91ciBsb2NhbCByZWZlcmVuY2VkIGxpc3RcbiAgICAgKiAgaXRlbS5cbiAgICAgKi9cbiAgICBzeW5jcm9uaXplUmVtb3RlQ2hhbmdlcygpIHtcbiAgICAgICAgY29uc3QgbW9kZWwgPSB0aGlzLmxpc3RJdGVtLmdldE1vZGVsKCk7XG4gICAgICAgIG1vZGVsLmdldExpc3RJdGVtQnlJZCh0aGlzLmxpc3RJdGVtLmlkKVxuICAgICAgICAgICAgLnRoZW4oKHVwZGF0ZWRJdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5saXN0SXRlbS5hdHRhY2htZW50cyAhPT0gdXBkYXRlZEl0ZW0uYXR0YWNobWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0SXRlbS5hdHRhY2htZW50cyA9IHVwZGF0ZWRJdGVtLmF0dGFjaG1lbnRzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVwbG9hZEF0dGFjaG1lbnQoKSB7XG4gICAgICAgIGNvbnN0IGVsOiBhbnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXAtZmlsZScpO1xuICAgICAgICBjb25zdCBmaWxlID0gZWwuZmlsZXNbMF07XG5cbiAgICAgICAgLyoqIEVuc3VyZSBmaWxlIG5hbWUgY29udGFpbnMgbm8gaWxsZWdhbCBjaGFyYWN0ZXJzICovXG4gICAgICAgIGlmIChmaWxlICYmIHRoaXMudmFsaWRhdGVGaWxlTmFtZShmaWxlLm5hbWUpKSB7XG4gICAgICAgICAgICB0aGlzLmdldEZpbGVCdWZmZXIoZmlsZSkudGhlbigoYnVmZmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGJpbmFyeSA9ICcnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgICAgICAgICBsZXQgaSA9IGJ5dGVzLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgICAgICBiaW5hcnkgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKSArIGJpbmFyeTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnVwbG9hZGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFwRGF0YVNlcnZpY2Uuc2VydmljZVdyYXBwZXIoe1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb246ICdBZGRBdHRhY2htZW50JyxcbiAgICAgICAgICAgICAgICAgICAgbGlzdE5hbWU6IHRoaXMubGlzdEl0ZW0uZ2V0TW9kZWwoKS5saXN0LmdldExpc3RJZCgpLFxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbUlEOiB0aGlzLmxpc3RJdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZTogZmlsZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBhdHRhY2htZW50OiBidG9hKGJpbmFyeSlcbiAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MoJ0ZpbGUgc3VjY2Vzc2Z1bGx5IHVwbG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3luY3Jvbml6ZVJlbW90ZUNoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRvYXN0ci5lcnJvcignVGhlcmUgd2FzIGEgcHJvYmxlbSBjb21wbGV0aW5nIHRoZSB1cGxvYWQuJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBDaGVjayB0byBlbnN1cmUgZmlsZSB0byBiZSB1cGxvYWRlZCBkb2Vzbid0IGNvbnRhaW4gYW55IGlsbGVnYWwgU2hhcmVQb2ludCBjaGFyYWN0ZXJzLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlTmFtZSBUaGUgbmFtZSBvZiB0aGUgZmlsZSB0byBiZSB1cGxvYWRlZC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gSXMgdGhlIGZpbGUgbmFtZSB2YWxpZD9cbiAgICAgKi9cbiAgICB2YWxpZGF0ZUZpbGVOYW1lKGZpbGVOYW1lKSB7XG4gICAgICAgIGxldCBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgbGV0IHVzZXJNZXNzYWdlID0gJyc7XG4gICAgICAgIGNvbnN0IGlsbGVnYWxDaGFyYWN0ZXJzID0gWyd+JywgJyMnLCAnJScsICcmJywgJyonLCAneycsICd9JywgJ1xcXFwnLCAnLycsICc6JywgJzwnLCAnPicsICc/JywgJ3wnLCAnXCInLCAnLi4nXTtcbiAgICAgICAgXy5lYWNoKGlsbGVnYWxDaGFyYWN0ZXJzLCBmdW5jdGlvbiAoaWxsZWdhbENoYXJhY3Rlcikge1xuICAgICAgICAgICAgaWYgKGZpbGVOYW1lLmluZGV4T2YoaWxsZWdhbENoYXJhY3RlcikgPiAtMSkge1xuICAgICAgICAgICAgICAgIHVzZXJNZXNzYWdlID0gJ1RoZSAnICsgaWxsZWdhbENoYXJhY3RlciArICcgY2hhcmFjdGVyIGlzblxcJ3QgYWxsb3dlZCB0byBiZSB1c2VkIGluIGEgZmlsZSBuYW1lLic7XG4gICAgICAgICAgICAgICAgLyoqIEJyZWFrIGxvb3AgZWFybHkgKi9cbiAgICAgICAgICAgICAgICByZXR1cm4gaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvKiogWW91IGNhbm5vdCB1c2UgdGhlIHBlcmlvZCBjaGFyYWN0ZXIgYXQgdGhlIGVuZCBvZiBhIGZpbGUgbmFtZS4gKi9cbiAgICAgICAgaWYgKGZpbGVOYW1lW2ZpbGVOYW1lLmxlbmd0aCAtIDFdID09PSAnLicpIHtcbiAgICAgICAgICAgIHVzZXJNZXNzYWdlID0gJ1lvdSBjYW5ub3QgdXNlIHRoZSBwZXJpb2QgY2hhcmFjdGVyIGF0IHRoZSBlbmQgb2YgYSBmaWxlIG5hbWUuJztcbiAgICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLyoqIFlvdSBjYW5ub3Qgc3RhcnQgYSBmaWxlIG5hbWUgd2l0aCB0aGUgcGVyaW9kLiAqL1xuICAgICAgICBpZiAoZmlsZU5hbWVbMF0gPT09ICcuJykge1xuICAgICAgICAgICAgdXNlck1lc3NhZ2UgPSAnWW91IGNhbm5vdCBzdGFydCBhIGZpbGUgbmFtZSB3aXRoIHRoZSBwZXJpb2QuJztcbiAgICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBEb24ndCBjb250aW51ZSBldmFsdWF0aW5nIGlmIGEgcHJvYmxlbSBoYXMgYWxyZWFkeSBiZWVuIGZvdW5kICovXG4gICAgICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICAgICAgdXNlck1lc3NhZ2UgKz0gJyAgUGxlYXNlIHVwZGF0ZSB0aGUgZmlsZSBvbiB5b3VyIHN5c3RlbSBhbmQgdXBsb2FkIGFnYWluLic7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IodXNlck1lc3NhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgfVxuXG59XG5cbi8qKlxuICogQG5nZG9jIENvbXBvbmVudFxuICogQG5hbWUgYW5ndWxhclBvaW50LkNvbXBvbmVudDphcEF0dGFjaG1lbnRzXG4gKiBAZWxlbWVudCBzcGFuXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFVzZXMgYW4gaUZyYW1lIHRvIGhpamFjayB0aGUgcG9ydGlvbnMgb2YgdGhlIHVwbG9hZCBhdHRhY2htZW50IGZvcm0gdGhhdCB3ZSB3b3VsZCBsaWtlIHRvIHNob3cgdG8gdGhlIHVzZXIuIEFkZHNcbiAqIGV2ZW50IGxpc3RlbmVycyBvbiB0aGUgZm9ybSBhbmQgd2FpdHMgZm9yIGFuIHVwbG9hZCB0byBjb21wbGV0ZSwgdGhlbiBxdWVyaWVzIGZvciB0aGUgdXBkYXRlZCBsaXN0IG9mIGF0dGFjaG1lbnRzXG4gKiB0byBkaXNwbGF5IGJlbG93IHRoZSBmb3JtLCBhbmQgcmVzZXRzIHRoZSBpRnJhbWUuICBUaGUgbGlzdGVkIGF0dGFjaG1lbnRzIGFyZSBsaW5rZWQgdG8gYWxsb3cgb3BlbmluZyBhbmQgYWxzb1xuICogcHJvdmlkZSBkZWxldGUgZnVuY3Rpb25hbGl0eSB0byBkaXNhc3NvY2lhdGUgd2l0aCB0aGUgbGlzdCBpdGVtLlxuICpcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gbGlzdEl0ZW0gVGhlIGxpc3QgaXRlbSB0aGF0IHdlJ2QgbGlrZSB0byB2aWV3L2FkZCBhdHRhY2htZW50cy5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjaGFuZ2VFdmVudF0gQ2FsbGJhY2sgd2hlbiB0aGUgYXR0YWNobWVudHMgaGF2ZSBiZWVuIHVwZGF0ZWQuXG4gKlxuICogQGV4YW1wbGVcbiAqIDxwcmU+XG4gKiAgICAgPHNwYW4gZGF0YS1hcC1hdHRhY2htZW50c1xuICogICAgICBkYXRhLWxpc3QtaXRlbT0ndmVyaWZpY2F0aW9uJ1xuICogICAgICBkYXRhLWNoYW5nZS1ldmVudD0nZmV0Y2hBdHRhY2htZW50cyc+PC9zcGFuPlxuICogPC9wcmU+XG4gKi9cbmV4cG9ydCBjb25zdCBBUEF0dGFjaG1lbnRzQ29tcG9uZW50ID0ge1xuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGxpc3RJdGVtOiAnPCcsICAgICAgLy8gTGlzdCBpdGVtIHRoZSBhdHRhY2htZW50cyBiZWxvbmcgdG9cbiAgICAgICAgY2hhbmdlRXZlbnQ6ICc8PycgICAgLy8gT3B0aW9uYWwgLSBjYWxsZWQgYWZ0ZXIgYW4gYXR0YWNobWVudCBpcyBkZWxldGVkXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBBUEF0dGFjaG1lbnRzQ29udHJvbGxlcixcbiAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi9hcEF0dGFjaG1lbnRzLmh0bWwnKVxufTtcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vfi90c2xpbnQtbG9hZGVyIS4vc3JjL2FwQXR0YWNobWVudHMudHMiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJhbmd1bGFyLXBvaW50XCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiYW5ndWxhci1wb2ludFwiXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gXCI8ZGl2PlxcblxcdDxzdHlsZSB0eXBlPVxcXCJ0ZXh0L2Nzc1xcXCI+XFxuXFx0XFx0LmFwLWF0dGFjaG1lbnRzLWNvbnRhaW5lciB7XFxuICAgICAgICAgICAgbWluLWhlaWdodDogMjAwcHg7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuYXAtYXR0YWNobWVudHMtY29udGFpbmVyIC5hcC1hZGQtYXR0YWNobWVudHMge1xcbiAgICAgICAgICAgIGhlaWdodDogMTEwcHg7XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuYXAtYXR0YWNobWVudHMtY29udGFpbmVyIC5hcC1hZGQtYXR0YWNobWVudHMgaWZyYW1lIHtcXG4gICAgICAgICAgICBoZWlnaHQ6IDk1cHg7XFxuICAgICAgICB9XFxuXFx0PC9zdHlsZT5cXG5cXHQ8ZGl2IGNsYXNzPVxcXCJhcC1hdHRhY2htZW50cy1jb250YWluZXJcXFwiPlxcblxcdFxcdDxkaXYgbmctaWY9XFxcIiEkY3RybC51cGxvYWRpbmdcXFwiPlxcblxcdFxcdFxcdDxkaXYgY2xhc3M9XFxcImlucHV0LWdyb3VwXFxcIj5cXG5cXHRcXHRcXHRcXHQ8aW5wdXQgdHlwZT1cXFwiZmlsZVxcXCIgaWQ9XFxcImFwLWZpbGVcXFwiIG5hbWU9XFxcImZpbGVcXFwiIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiPlxcblxcdFxcdFxcdFxcdDxzcGFuIGNsYXNzPVxcXCJpbnB1dC1ncm91cC1idG5cXFwiPlxcblxcdFxcdFxcdFxcdFxcdDxidXR0b24gY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeVxcXCIgdHlwZT1cXFwiYnV0dG9uXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwudXBsb2FkQXR0YWNobWVudCgpXFxcIj5BZGQ8L2J1dHRvbj5cXG5cXHRcXHRcXHRcXHQ8L3NwYW4+XFxuXFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0PHAgY2xhc3M9XFxcImhlbHAtYmxvY2tcXFwiPlNlbGVjdCB0aGUgZmlsZXMgeW91IHdhbnQgdG8gdXBsb2FkIGFuZCB0aGVuIGNsaWNrIHRoZSBBZGQgYnV0dG9uLjwvcD5cXG5cXHRcXHQ8L2Rpdj5cXG5cXHRcXHQ8ZGl2IG5nLXNob3c9XFxcIiRjdHJsLnVwbG9hZGluZ1xcXCIgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LWluZm8gdHh0LWFsaWduLWNlbnRlclxcXCI+XFxuXFx0XFx0XFx0PGkgY2xhc3M9XFxcImZhIGZhLXNwaW5uZXIgZmEtc3BpblxcXCI+PC9pPnByb2Nlc3NpbmcgcmVxdWVzdC4uLjwvZGl2PlxcblxcdFxcdFxcdFxcblxcdFxcdDwhLS0tPT09PT09PT09PT09PT1MSVNUIE9GIEFUVEFDSE1FTlRTPT09PT09PT09PT09PS0tPlxcblxcdFxcdDxkaXYgbmctaWY9XFxcIiRjdHJsLmxpc3RJdGVtLmF0dGFjaG1lbnRzLmxlbmd0aCA+IDBcXFwiPlxcblxcdFxcdFxcdDxociBjbGFzcz1cXFwiaHItc21cXFwiPlxcblxcdFxcdFxcdDxoND5cXG5cXHRcXHRcXHRcXHQ8c21hbGw+QXR0YWNobWVudHM8L3NtYWxsPlxcblxcdFxcdFxcdDwvaDQ+XFxuXFx0XFx0XFx0PHVsIGNsYXNzPVxcXCJsaXN0LXVuc3R5bGVkXFxcIj5cXG5cXHRcXHRcXHRcXHQ8bGkgbmctcmVwZWF0PVxcXCJhdHRhY2htZW50IGluICRjdHJsLmxpc3RJdGVtLmF0dGFjaG1lbnRzXFxcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8YSBocmVmPVxcXCJ7eyBhdHRhY2htZW50IH19XFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+e3sgJGN0cmwuZmlsZU5hbWUoYXR0YWNobWVudCkgfX08L2E+XFxuXFx0XFx0XFx0XFx0XFx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWxpbmtcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5kZWxldGVBdHRhY2htZW50KGF0dGFjaG1lbnQpXFxcIiB0aXRsZT1cXFwiRGVsZXRlIHRoaXMgYXR0YWNobWVudFxcXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGkgY2xhc3M9XFxcImZhIGZhLXRpbWVzIHJlZFxcXCI+PC9pPlxcblxcdFxcdFxcdFxcdFxcdDwvYnV0dG9uPlxcblxcdFxcdFxcdFxcdDwvbGk+XFxuXFx0XFx0XFx0PC91bD5cXG5cXHRcXHQ8L2Rpdj5cXG5cXHQ8L2Rpdj5cXG48L2Rpdj5cIlxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2FwQXR0YWNobWVudHMuaHRtbFxuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJsb2Rhc2hcIlxuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ0b2FzdHJcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJ0b2FzdHJcIlxuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBJTGlzdEZpZWxkTWFwcGluZywgQW5ndWxhclBvaW50TW9kdWxlIH0gZnJvbSAnYW5ndWxhci1wb2ludCc7XG5pbXBvcnQge0FQQXR0YWNobWVudHNDb21wb25lbnR9IGZyb20gJy4vYXBBdHRhY2htZW50cyc7XG5cbkFuZ3VsYXJQb2ludE1vZHVsZVxuICAgIC5jb21wb25lbnQoJ2FwQXR0YWNobWVudHMnLCBBUEF0dGFjaG1lbnRzQ29tcG9uZW50KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL34vdHNsaW50LWxvYWRlciEuL3NyYy9pbmRleC50cyJdLCJzb3VyY2VSb290IjoiIn0=