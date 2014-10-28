'use strict';

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
    .directive('apAttachments', function ($sce, toastr, _) {
        return {
            restrict: "A",
            replace: true,
            templateUrl: 'src/ap_attachments_tmpl.html',
            scope: {
                listItem: "=",      //List item the attachments belong to
                changeEvent: '=',    //Optional - called after an attachment is deleted
                disabled: '='
            },
            link: function (scope, element, attrs) {

                if(!scope.listItem || !scope.listItem.id) {
                    throw 'A valid list item is required.'
                }

                scope.listItem.attachments = scope.listItem.attachments || [];
                scope.deleteAttachment = deleteAttachment;
                scope.fileName = fileName;
                scope.state = { ready: false };
                scope.trustedUrl = constructUrl();

                //Run when the iframe url changes and fully loaded
                element.find('iframe').bind('load', function (event) {
                    scope.state.ready = true;
                    //scope.refresh();
                    var iframe = $(this).contents();

                    if (iframe.find("#CancelButton").length < 1) {
                        //Upload complete, reset iframe
                        toastr.success("File successfully uploaded");
                        resetSrc();
                        syncronizeRemoteChanges();
                        if (_.isFunction(scope.changeEvent)) {
                            scope.changeEvent();
                        }

                    } else {
                        //Hide the standard cancel button
                        iframe.find("#CancelButton").hide();
                        iframe.find(".ms-dialog").css({height: '95px'});

                        //Style OK button
                        iframe.find("input[name$='Ok']").css({float: 'left'}).click(function (event) {
                            //Click handler
                            toastr.info("Please wait while the file is uploaded");
                        });

                        iframe.find("input[name$='$InputFile']").attr({'size': 40});

                        //Style iframe to prevent scroll bars from appearing
                        iframe.find("#s4-workspace").css({
                            'overflow-y': 'hidden',
                            'overflow-x': 'hidden'
                        });

                        console.log("Frame Loaded");
                        refresh();
                    }
                });

                function constructUrl() {
                    var listItemModel = scope.listItem.getModel();
                    var uploadUrl = listItemModel.list.webURL + '/_layouts/Attachfile.aspx?ListId=' +
                        listItemModel.list.getListId() + '&ItemId=' + scope.listItem.id + '&IsDlg=1';
                    return $sce.trustAsResourceUrl(uploadUrl);
                }

                function deleteAttachment (attachment) {
                    var confirmation = window.confirm("Are you sure you want to delete this file?");
                    if (confirmation) {
                        toastr.info("Negotiating with the server");
                        scope.listItem.deleteAttachment(attachment).then(function () {
                            toastr.success("Attachment successfully deleted");
                            syncronizeRemoteChanges();
                            if (_.isFunction(scope.changeEvent)) {
                                scope.changeEvent();
                            }
                        });
                    }
                }

                /**
                 *  Events from the iframe don't automatically sync with the cache so we need to get
                 *  the updated list item which will extend the changes to our local referenced list
                 *  item.
                 */
                function syncronizeRemoteChanges () {
                    var model = scope.listItem.getModel();
                    model.getListItemById(scope.listItem.id);
                    //toastr.info("Checking for attachments");
                    //scope.listItem.getAttachmentCollection()
                    //    .then(function (attachments) {
                    //        scope.attachments = attachments;
                    //    });
                }

                function fileName (attachment) {
                    var index = attachment.lastIndexOf("/") + 1;
                    return attachment.substr(index);
                }

                function refresh() {
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                }

                function resetSrc() {
                    if (_.isFunction(scope.changeEvent)) {
                        scope.changeEvent();
                    }
                    //Reset iframe
                    element.find('iframe').attr('src', element.find('iframe').attr('src'));
                }
            }
        };
    });
