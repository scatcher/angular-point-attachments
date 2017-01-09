import {ListItem} from 'angular-point';
// import {ListItem} from '../angular-point/factories/apListItemFactory';
import * as toastr from 'toastr';
import * as _ from 'lodash';

// var $sce, $q, $timeout, apDataService;

interface IListItemWithAttachments extends ListItem<any> {
    attachments: string[];
}

interface IControllerScope {
    changeEvent?();
    listItem: IListItemWithAttachments;
}

class APAttachmentsController {
    static $inject = ['$scope', '$sce', '$q', '$timeout', 'apDataService'];
    listItem: IListItemWithAttachments;
    uploading = false;

    constructor(private $scope: IControllerScope, private $sce, private $q, private $timeout, private apDataService) {}

    $onInit() {
        const $ctrl = this;

        /** Can't manipulate attachments for listItems that haven't been saved to the server */
        if (!this.$scope.listItem || !this.$scope.listItem.id) {
            return;
        }
        $ctrl.listItem = this.$scope.listItem;
        $ctrl.listItem.attachments = $ctrl.listItem.attachments || [];
    }

    deleteAttachment(attachment) {
        const confirmation = window.confirm('Are you sure you want to delete this file?');
        if (confirmation) {
            toastr.info('Negotiating with the server');
            this.listItem.deleteAttachment(attachment).then(() => {
                this.syncronizeRemoteChanges();
                toastr.success('Attachment successfully deleted');
                if (_.isFunction(this.$scope.changeEvent)) {
                    this.$scope.changeEvent();
                }
            });
        }
    }

    fileName(attachment) {
        const index = attachment.lastIndexOf('/') + 1;
        return attachment.substr(index);
    }

    getFileBuffer(file) {
        const deferred = this.$q.defer();

        const reader = new FileReader();

        reader.onload = function (e: any) {
            deferred.resolve(e.target.result);
        };

        reader.onerror = function (e: any) {
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
        const model = this.listItem.getModel();
        model.getListItemById(this.listItem.id)
            .then((updatedItem: any) => {
                if (this.listItem.attachments !== updatedItem.attachments) {
                    this.listItem.attachments = updatedItem.attachments;
                }
            });
    }

    uploadAttachment() {
        const el: any = document.getElementById('ap-file');
        const file = el.files[0];

        /** Ensure file name contains no illegal characters */
        if (file && this.validateFileName(file.name)) {
            this.getFileBuffer(file).then((buffer) => {
                let binary = '';
                const bytes = new Uint8Array(buffer);
                let i = bytes.byteLength;
                while (i--) {
                    binary = String.fromCharCode(bytes[i]) + binary;
                }

                this.uploading = true;

                this.apDataService.serviceWrapper({
                    operation: 'AddAttachment',
                    listName: this.listItem.getModel().list.getListId(),
                    listItemID: this.listItem.id,
                    fileName: file.name,
                    attachment: btoa(binary)
                }).then(() => {
                    this.uploading = false;
                    toastr.success('File successfully uploaded');
                    this.syncronizeRemoteChanges();
                }, (err) => {
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
        let isValid = true;
        let userMessage = '';
        const illegalCharacters = ['~', '#', '%', '&', '*', '{', '}', '\\', '/', ':', '<', '>', '?', '|', '"', '..'];
        _.each(illegalCharacters, function (illegalCharacter) {
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
            toastr.error(userMessage);
        }

        return isValid;
    }

}

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
export const APAttachmentsComponent = {
    bindings: {
        listItem: '<',      // List item the attachments belong to
        changeEvent: '<?'    // Optional - called after an attachment is deleted
    },
    controller: APAttachmentsController,
    template: require('./apAttachments.html')
};

