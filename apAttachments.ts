module ap.attachments {
    'use strict';

    var $sce, $q, $timeout, apDataService, toastr;

    interface IControllerScope {
        changeEvent?();
        listItem: ap.IListItem;
    }

    class APAttachmentsController {
        listItem;
        uploading = false;
        constructor(private $scope:IControllerScope) {
            var vm = this;

            /** Can't manipulate attachments for listItems that haven't been saved to the server */
            if (!$scope.listItem || !$scope.listItem.id) {
                return;
            }

            vm.listItem.attachments = vm.listItem.attachments || [];
        }

        deleteAttachment(attachment) {
            var confirmation = window.confirm("Are you sure you want to delete this file?");
            if (confirmation) {
                toastr.info("Negotiating with the server");
                this.listItem.deleteAttachment(attachment).then(() => {
                    this.syncronizeRemoteChanges();
                    toastr.success("Attachment successfully deleted");
                    if (_.isFunction(this.$scope.changeEvent)) {
                        this.$scope.changeEvent();
                    }
                });
            }
        }

        fileName(attachment) {
            var index = attachment.lastIndexOf("/") + 1;
            return attachment.substr(index);
        }

        getFileBuffer(file) {
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
        }

        /**
         *  Events from the iframe don't automatically sync with the cache so we need to get
         *  the updated list item which will extend the changes to our local referenced list
         *  item.
         */
        syncronizeRemoteChanges() {
            var model = this.listItem.getModel();
            model.getListItemById(this.listItem.id)
                .then((updatedItem) => {
                    if (this.listItem.attachments !== updatedItem.attachments) {
                        this.listItem.attachments = updatedItem.attachments;
                    }
                })
        }

        uploadAttachment() {
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

                    this.uploading = true;

                    apDataService.serviceWrapper({
                        operation: 'AddAttachment',
                        listName: this.listItem.getModel().list.getListId(),
                        listItemID: this.listItem.id,
                        fileName: file.name,
                        attachment: btoa(binary)
                    }).then( () => {
                        this.uploading = false;
                        toastr.success('File successfully uploaded');
                        this.syncronizeRemoteChanges();
                    }, function (err) {
                        this.uploading = false;
                        toastr.error('There was a problem completing the upload.');
                    });
                });
            }
        }

        /**
         * @description Check to ensure file to be uploaded doesn't contain any illegal SharePoint characters.
         * @param {string} fileName The name of the file to be uploaded.
         * @returns {boolean} Is the file name valid?
         */
        validateFileName(fileName) {
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
        }

    }

    export function APAttachments($injector) {
        $q = $injector.get('$q');
        $sce = $injector.get('$sce');
        $timeout = $injector.get('$timeout');
        apDataService = $injector.get('apDataService');
        toastr = $injector.get('toastr');

        return {
            //replace: true,
            //templateUrl: 'src/ap_attachments_tmpl.html',
            scope: {
                listItem: "=",      //List item the attachments belong to
                changeEvent: '='    //Optional - called after an attachment is deleted
            },
            controller: APAttachmentsController,
            controllerAs: 'vm',
            template: `
                <div>
                    <style type="text/css">
                        .ap-attachments-container {
                            min-height: 200px;
                        }

                        .ap-attachments-container .ap-add-attachments {
                            height: 110px;
                        }

                        .ap-attachments-container .ap-add-attachments iframe {
                            height: 95px;
                        }
                    </style>


                    <div class="ap-attachments-container">
                            <div ng-if="!vm.uploading">
                                <div class="input-group">
                                    <input type="file" id="ap-file" name="file" class="form-control">
                                    <span class="input-group-btn">
                                        <button class="btn btn-primary" type="button"
                                                ng-click="uploadAttachment()">Add</button>
                                    </span>
                                </div>
                                <p class="help-block">Select the files you want to upload and then click the Add button.</p>
                            </div>
                            <div ng-show="vm.uploading" class="alert alert-info txt-align-center">
                                <i class="fa fa-spinner fa-spin"></i> processing request...
                            </div>

                            <!---==============LIST OF ATTACHMENTS=============-->
                            <div ng-if="listItem.attachments.length > 0">
                                <hr class="hr-sm">
                                <h4>
                                    <small>Attachments</small>
                                </h4>

                                <ul class="list-unstyled">
                                    <li ng-repeat="attachment in listItem.attachments">
                                        <a href="{{ attachment }}" target="_blank">{{ fileName(attachment) }}</a>
                                        <button type="button" class="btn btn-link" ng-click="deleteAttachment(attachment)"
                                                title="Delete this attachment">
                                            <i class="fa fa-times red"></i>
                                        </button>
                                    </li>
                                </ul>

                            </div>


                        </fieldset>

                    </div>
                </div>`
        }
    }

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
        .directive('apAttachments', APAttachments);

}