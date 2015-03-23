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
    .directive('apAttachments', ["$sce", "$q", "$timeout", "apDataService", "toastr", "_", function ($sce, $q, $timeout, apDataService, toastr, _) {
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
                    return;
                }

                scope.listItem.attachments = scope.listItem.attachments || [];
                scope.deleteAttachment = deleteAttachment;
                scope.fileName = fileName;
                scope.state = {
                    legacyBrowser: false,
                    uploading: false
                };
                scope.uploadAttachment = uploadAttachment;

                activate();

                function activate() {
                    if(typeof FileReader !== 'undefined') {
                        scope.state.legacyBrowser = false;
                    } else {
                        /** Outdated browser so use iframe */
                        scope.state.legacyBrowser = true;
                        iframeFallback();
                        scope.trustedUrl = constructUrl();
                    }
                }

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
                            syncronizeRemoteChanges();
                            toastr.success("Attachment successfully deleted");
                            if (_.isFunction(scope.changeEvent)) {
                                scope.changeEvent();
                            }
                        });
                    }
                }

                function fileName (attachment) {
                    var index = attachment.lastIndexOf("/") + 1;
                    return attachment.substr(index);
                }

                function getFileBuffer(file) {
                    var deferred = $q.defer();

                    var reader = new FileReader();

                    reader.onload = function(e) {
                        deferred.resolve(e.target.result);
                    };

                    reader.onerror = function(e) {
                        deferred.reject(e.target.error);
                    };

                    reader.readAsArrayBuffer(file);

                    return deferred.promise;
                }

                function iframeFallback() {
                    //Run when the iframe url changes and fully loaded
                    refresh();
                    element.find('iframe').bind('load', function (event) {
                        var iframe = $(this).contents();
                        refresh();

                        if (iframe.find("#CancelButton").length < 1) {

                            //Upload complete, reset iframe
                            toastr.success("File successfully uploaded");
                            syncronizeRemoteChanges();
                            resetSrc();
                            if (_.isFunction(scope.changeEvent)) {
                                scope.changeEvent();
                            }
                        } else {
                            removeDialogOverlay();

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


                        }
                    });
                }

                /** Ensure no popup dialogs get overlayed on the iframe */
                function removeDialogOverlay() {
                    var maxAttempts = 10;
                    $timeout(function () {
                        try{
                            var iframe = element.find('iframe')[0];
                            iframe.contentWindow.SP.UI.ModalDialog.commonModalDialogClose(function() {
                                maxAttempts = 0;
                            });
                        } catch(err) {};
                        maxAttempts--;
                        if(maxAttempts > 0) {
                            removeDialogOverlay();
                        }
                    }, 1000);
                }


                /**
                 *  Events from the iframe don't automatically sync with the cache so we need to get
                 *  the updated list item which will extend the changes to our local referenced list
                 *  item.
                 */
                function syncronizeRemoteChanges () {
                    var model = scope.listItem.getModel();
                    model.getListItemById(scope.listItem.id)
                        .then(function (updatedItem) {
                            if(scope.listItem.attachments !== updatedItem.attachments) {
                                scope.listItem.attachments = updatedItem.attachments;
                            }
                        })
                }

                function uploadAttachment(){
                    var file = document.getElementById('ap-file').files[0];

                    /** Ensure file name contains no illegal characters */
                    if(file && validateFileName(file.name)) {
                        getFileBuffer(file).then(function(buffer) {
                            var binary = "";
                            var bytes = new Uint8Array(buffer);
                            var i = bytes.byteLength;
                            while (i--) {
                                binary = String.fromCharCode(bytes[i]) + binary;
                            }

                            scope.state.uploading = true;

                            apDataService.serviceWrapper({
                                operation: 'AddAttachment',
                                listName: scope.listItem.getModel().list.getListId(),
                                listItemID: scope.listItem.id,
                                fileName: file.name,
                                attachment: btoa(binary)
                            }).then(function () {
                                scope.state.uploading = false;
                                toastr.success('File successfully uploaded');
                                syncronizeRemoteChanges();
                            }, function (err) {
                                scope.state.uploading = false;
                                toastr.error('There was a problem completing the upload.');
                            });
                        });
                    }
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
                    refresh();
                    element.find('iframe').attr('src', constructUrl());
                }

                /**
                 * @description Check to ensure file to be uploaded doesn't contain any illegal SharePoint characters.
                 * @param {string} fileName The name of the file to be uploaded.
                 * @returns {boolean} Is the file name valid?
                 */
                 function validateFileName(fileName) {
                    var isValid = true;
                    var userMessage = '';
                    var illegalCharacters = ['~', '#', '%', '&', '*', '{', '}' , '\\', '/', ':', '<', '>', '?', '|', '"', '..'];
                    _.each(illegalCharacters, function (illegalCharacter) {
                        if(fileName.indexOf(illegalCharacter) > -1) {
                            userMessage = 'The "' + illegalCharacter + '" character isn\'t allowed to be used in a file name.';
                            /** Break loop early */
                            return isValid = false;
                        }
                    });

                    /** You cannot use the period character at the end of a file name. */
                    if(fileName[fileName.length - 1] === '.') {
                        userMessage = 'You cannot use the period character at the end of a file name.';
                        isValid = false;
                    }


                    /** You cannot start a file name with the period. */
                    if(fileName[0] === '.') {
                        userMessage = 'You cannot start a file name with the period.';
                        isValid = false;
                    }

                    /** Don't continue evaluating if a problem has already been found */
                    if(!isValid) {
                        userMessage += '  Please update the file on your system and upload again.';
                        toastr.error(userMessage);
                    }

                    return isValid;
                }
            }
        };
    }]);
;angular.module('angularPoint').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/ap_attachments_tmpl.html',
    "<div><style>.ap-attachments-container {\r" +
    "\n" +
    "            min-height: 200px;\r" +
    "\n" +
    "        }\r" +
    "\n" +
    "\r" +
    "\n" +
    "        .ap-attachments-container .ap-add-attachments {\r" +
    "\n" +
    "            height: 110px;\r" +
    "\n" +
    "        }\r" +
    "\n" +
    "\r" +
    "\n" +
    "        .ap-attachments-container .ap-add-attachments iframe {\r" +
    "\n" +
    "            height: 95px;\r" +
    "\n" +
    "        }</style><div class=ap-attachments-container><fieldset ng-disabled=disabled><div ng-if=!state.legacyBrowser><div ng-if=!state.uploading><div class=input-group><input type=file id=ap-file name=file class=form-control> <span class=input-group-btn><button class=\"btn btn-primary\" type=button ng-click=uploadAttachment()>Add</button></span></div><p class=help-block>Select the files you want to upload and then click the Add button.</p></div><div ng-show=state.uploading class=\"alert alert-info txt-align-center\"><i class=\"fa fa-spinner fa-spin\"></i> processing request...</div></div><div class=hidden-print ng-if=state.legacyBrowser><div class=ap-add-attachments><h4><small>Add Attachment</small></h4><iframe frameborder=0 seamless width=100% src=\"{{ trustedUrl }}\" id=ap-attachments-iframe scrolling=no></iframe></div></div><div ng-if=\"listItem.attachments.length > 0\"><hr class=hr-sm><h4><small>Attachments</small></h4><ul class=list-unstyled><li ng-repeat=\"attachment in listItem.attachments\"><a href=\"{{ attachment }}\" target=_blank>{{ fileName(attachment) }}</a> <button type=\"button\" class=\"btn btn-link\" ng-click=deleteAttachment(attachment) title=\"Delete this attachment\"><i class=\"fa fa-times red\"></i></button></li></ul></div></fieldset></div></div>"
  );

}]);
