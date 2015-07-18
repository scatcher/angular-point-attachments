/// <reference path="../typings/tsd.d.ts" />
var ap;
(function (ap) {
    var attachments;
    (function (attachments) {
        'use strict';
        var $sce, $q, $timeout, apDataService, toastr;
        var APAttachmentsController = (function () {
            function APAttachmentsController($scope) {
                this.$scope = $scope;
                this.uploading = false;
                var vm = this;
                /** Can't manipulate attachments for listItems that haven't been saved to the server */
                if (!$scope.listItem || !$scope.listItem.id) {
                    return;
                }
                vm.listItem = $scope.listItem;
                vm.listItem.attachments = vm.listItem.attachments || [];
            }
            APAttachmentsController.prototype.deleteAttachment = function (attachment) {
                var _this = this;
                var confirmation = window.confirm("Are you sure you want to delete this file?");
                if (confirmation) {
                    toastr.info("Negotiating with the server");
                    this.listItem.deleteAttachment(attachment).then(function () {
                        _this.syncronizeRemoteChanges();
                        toastr.success("Attachment successfully deleted");
                        if (_.isFunction(_this.$scope.changeEvent)) {
                            _this.$scope.changeEvent();
                        }
                    });
                }
            };
            APAttachmentsController.prototype.fileName = function (attachment) {
                var index = attachment.lastIndexOf("/") + 1;
                return attachment.substr(index);
            };
            APAttachmentsController.prototype.getFileBuffer = function (file) {
                var deferred = $q.defer();
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
                var file = document.getElementById('ap-file').files[0];
                /** Ensure file name contains no illegal characters */
                if (file && this.validateFileName(file.name)) {
                    this.getFileBuffer(file).then(function (buffer) {
                        var binary = "";
                        var bytes = new Uint8Array(buffer);
                        var i = bytes.byteLength;
                        while (i--) {
                            binary = String.fromCharCode(bytes[i]) + binary;
                        }
                        _this.uploading = true;
                        apDataService.serviceWrapper({
                            operation: 'AddAttachment',
                            listName: _this.listItem.getModel().list.getListId(),
                            listItemID: _this.listItem.id,
                            fileName: file.name,
                            attachment: btoa(binary)
                        }).then(function () {
                            _this.uploading = false;
                            toastr.success('File successfully uploaded');
                            _this.syncronizeRemoteChanges();
                        }, function (err) {
                            _this.uploading = false;
                            toastr.error('There was a problem completing the upload.');
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
                _.each(illegalCharacters, function (illegalCharacter) {
                    if (fileName.indexOf(illegalCharacter) > -1) {
                        userMessage = 'The "' + illegalCharacter + '" character isn\'t allowed to be used in a file name.';
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
                    toastr.error(userMessage);
                }
                return isValid;
            };
            return APAttachmentsController;
        })();
        function APAttachmentsDirective($injector) {
            $q = $injector.get('$q');
            $sce = $injector.get('$sce');
            $timeout = $injector.get('$timeout');
            apDataService = $injector.get('apDataService');
            toastr = $injector.get('toastr');
            return {
                scope: {
                    listItem: "=",
                    changeEvent: '=' //Optional - called after an attachment is deleted
                },
                controller: APAttachmentsController,
                controllerAs: 'vm',
                templateUrl: 'src/apAttachments.html'
            };
        }
        attachments.APAttachmentsDirective = APAttachmentsDirective;
        /**
         * @ngdoc directive
         * @name angularPoint.directive:apAttachments
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
         *      data-list-item="verification"
         *      data-change-event="fetchAttachments"></span>
         * </pre>
         */
        angular.module('angularPoint')
            .directive('apAttachments', APAttachmentsDirective);
    })(attachments = ap.attachments || (ap.attachments = {}));
})(ap || (ap = {}));

//# sourceMappingURL=angular-point-attachments.js.map
angular.module("angularPoint").run(["$templateCache", function($templateCache) {$templateCache.put("apAttachments.html","<div>\n	<style type=\"text/css\">\n		.ap-attachments-container {\n            min-height: 200px;\n        }\n\n        .ap-attachments-container .ap-add-attachments {\n            height: 110px;\n        }\n\n        .ap-attachments-container .ap-add-attachments iframe {\n            height: 95px;\n        }\n	</style>\n	<div class=\"ap-attachments-container\">\n		<div ng-if=\"!vm.uploading\">\n			<div class=\"input-group\">\n				<input type=\"file\" id=\"ap-file\" name=\"file\" class=\"form-control\">\n				<span class=\"input-group-btn\">\n					<button class=\"btn btn-primary\" type=\"button\" ng-click=\"vm.uploadAttachment()\">Add</button>\n				</span>\n			</div>\n			<p class=\"help-block\">Select the files you want to upload and then click the Add button.</p>\n		</div>\n		<div ng-show=\"vm.uploading\" class=\"alert alert-info txt-align-center\">\n			<i class=\"fa fa-spinner fa-spin\"></i>processing request...</div>\n			\n		<!---==============LIST OF ATTACHMENTS=============-->\n		<div ng-if=\"vm.listItem.attachments.length > 0\">\n			<hr class=\"hr-sm\">\n			<h4>\n				<small>Attachments</small>\n			</h4>\n			<ul class=\"list-unstyled\">\n				<li ng-repeat=\"attachment in vm.listItem.attachments\">\n					<a href=\"{{ attachment }}\" target=\"_blank\">{{ vm.fileName(attachment) }}</a>\n					<button type=\"button\" class=\"btn btn-link\" ng-click=\"vm.deleteAttachment(attachment)\" title=\"Delete this attachment\">\n						<i class=\"fa fa-times red\"></i>\n					</button>\n				</li>\n			</ul>\n		</div>\n		</fieldset>\n	</div>\n</div>");}]);