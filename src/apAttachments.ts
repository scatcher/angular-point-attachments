import { ListItem } from 'angular-point';
import * as _ from 'lodash';
import * as toastr from 'toastr';

export interface IControllerScope {
  listItem: ListItem<any>;
  changeEvent?();
}

export class APAttachmentsController {
  static $inject = [];
  changeEvent: Function;
  listItem: ListItem<any>;
  uploading = false;

  constructor() {}

  $onInit() {
    /** Can't manipulate attachments for listItems that haven't been saved to the server */
    if (!this.listItem || !this.listItem.id) {
      return;
    }
    this.listItem.attachments = this.listItem.attachments || [];
  }

  deleteAttachment(attachment) {
    const confirmation = window.confirm('Are you sure you want to delete this file?');
    if (confirmation) {
      toastr.info('Negotiating with the server');
      this.listItem.deleteAttachment(attachment).then(() => {
        this.synchronizeRemoteChanges();
        toastr.success('Attachment successfully deleted');
        if (_.isFunction(this.changeEvent)) {
          this.changeEvent();
        }
      });
    }
  }

  fileName(attachment) {
    const index = attachment.lastIndexOf('/') + 1;
    return attachment.substr(index);
  }

  /**
   *  Events don't automatically sync with the cache so we need to get
   *  the updated list item which will extend the changes to our local referenced list
   *  item.
   */
  synchronizeRemoteChanges() {
    const model = this.listItem.getModel();
    model.getListItemById(this.listItem.id).then((updatedItem: any) => {
      if (this.listItem.attachments !== updatedItem.attachments) {
        this.listItem.attachments = updatedItem.attachments;
      }
    });
  }

  uploadAttachment() {
    const el = document.getElementById('ap-file') as HTMLInputElement;
    const file = el.files[0];

    this.uploading = true;
    this.listItem.addAttachment(file).then(
      () => {
        this.uploading = false;
        toastr.success('File successfully uploaded');
        this.synchronizeRemoteChanges();
      },
      err => {
        this.uploading = false;
        if (_.isString(err)) {
          toastr.error(err);
        } else {
          toastr.error('There was a problem completing the upload.');
        }
      },
    );
  }
}

/**
 * @ngdoc Component
 * @name angularPoint.Component:apAttachments
 * @element span
 * @function
 *
 * @description
 * Simple component to let user upload new attachments for a given listitem and view/download existing attachments.
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
    listItem: '<', // List item the attachments belong to
    changeEvent: '<?', // Optional - called after an attachment is deleted
  },
  controller: APAttachmentsController,
  template: require('./apAttachments.html'),
};
