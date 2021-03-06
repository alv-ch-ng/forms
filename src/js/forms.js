;(function () {
    'use strict';

    var module = angular.module('alv-ch-ng.forms', ['alv-ch-ng.core','ui.bootstrap.typeahead','ui.bootstrap.tooltip']);

    module.directive('formDatepicker', ['$compile','$translate','UiRenderService', function ($compile,$translate,UiRenderService) {
        return {
            priority: 10,
            restrict: 'A',
            scope: {
                ngModel: '=',
                formDatepicker: '='
            },
            link: function (scope, element, attrs) {
                var config = UiRenderService.getDatepickerConfig();
                var extend = scope.formDatepicker || false;
                if (extend){
                    if (angular.isString(extend)) {
                        angular.extend(config, angular.fromJson(extend));
                    } else {
                        angular.extend(config, extend);
                    }
                }

                // update config and element when options change
                scope.$watch('formDatepicker', function() {
                    angular.extend(config, scope.formDatepicker);
                    element.datepicker('remove');
                    element.datepicker(config);
                    element.datepicker('update',scope.ngModel);
                }, true);

                config.language=$translate.use();

                // do layout
                element.addClass("form-control");
                if (attrs['formDatepickerComponent']){
                    var component=angular.element('<span class="pointer input-group-addon" class="pointer" ng-click="showDatepicker()"></span>');
                    if (attrs['formDatepickerComponentInset']){
                        component.addClass('input-group-inset');
                    }
                    if (attrs['formDatepickerComponentIcon']){
                        component.attr('glyph-icon',attrs['formDatepickerComponentIcon']);
                    }
                    else if (attrs['formDatepickerComponentSymbol']){
                        component.attr('admin-symbol',attrs['formDatepickerComponentSymbol']);
                    }
                    else {
                        component.attr('glyph-icon','calendar');
                    }
                    element.wrap(angular.element('<div class="input-group"></div>'));
                    $compile(component)(scope);
                    if (attrs['formDatepickerComponentLeft'] || attrs['formDatepickerComponentInset']){
                        element.before(component);
                    }
                    else {
                        element.after(component);
                    }
                }

                // init datepicker
                element.datepicker(config);

                scope.$root.$on('$translateChangeSuccess', function () {
                    config.language=$translate.use();
                    element.datepicker('remove');
                    element.datepicker(config);
                    element.datepicker('update',scope.ngModel);
                });

                scope.showDatepicker=function(){
                    element.datepicker('show');
                };
            }
        };
    }]);

    module.directive('formPlaceholderLabel', ['$compile', function ($compile) {
        return {
            priority: 10,
            restrict: 'A',
            link: function (scope, element, attrs) {
                var placeholderType = attrs.formPlaceholderLabelType;
                if (placeholderType !== 'label' && placeholderType !== 'inside' && placeholderType !== 'outline') {
                    placeholderType = 'label';
                }
                var fg = angular.element('<div class="form-group"></div>');
                fg.addClass('placeholder-' + placeholderType);

                var placeholder = angular.element('<label class="placeholder-' + placeholderType + '-text" translate="' + attrs.formPlaceholderLabel + '"></label>');
                $compile(placeholder)(scope);

                placeholder.hide();

                if (attrs.id !== undefined) {
                    placeholder.attr("for", attrs.id);
                }

                element.wrap(fg);
                element.after(placeholder);

                scope.$watch(attrs.ngModel, function (newValue) {
                    if (newValue === "" || angular.isUndefined(newValue)) {
                        element.next().fadeOut("fast");
                        element.removeClass('active');
                    }
                    else {
                        element.addClass('active');
                        element.next().fadeIn("fast");
                    }
                });
            }
        };
    }]);

    module.directive('formTextarea', function () {
        return {
            priority: 20,
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.addClass('form-control');
                if (angular.isString(attrs.formTextareaResize)){
                    element.addClass('form-resize-'+attrs.formTextareaResize);
                    if (element.parent().hasClass('form-group') && attrs.formTextareaOverflow!==undefined){
                        element.addClass('form-overflow');
                        element.parent().css('height',element.parent().outerHeight(true));
                    }
                }
            }
        };
    });

    module.directive('formInput', function () {
        return {
            restrict: 'A',
            priority: 10,
            link: function (scope, element) {
                element.addClass("form-control");
            }
        };
    });

    module.directive('formPassword', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            priority: 20,
            link: function (scope, element) {
                element.addClass("form-control").addClass('inset-align-right');

                var inputGroup = angular.element('<div class="input-group"></div>');
                var inputGroupInset = angular.element('<span class="input-group-addon input-group-inset"><a ng-click="formShowPassword()"><span class="glyphicon" ng-class="{\'glyphicon-eye-open\' : !formIsShowPassword(), \'glyphicon-eye-close\' : formIsShowPassword()}"></span></a></span>');

                $compile(inputGroupInset)(scope);

                element.wrap(inputGroup);
                element.after(inputGroupInset);

                scope.formShowPassword = function(){
                    if (element.attr('type')==='password'){
                        element.attr('type', 'text');
                    }
                    else {
                        element.attr('type', 'password');
                    }
                };

                scope.formIsShowPassword=function(){
                    if (element.attr('type')==='password'){
                        return false;
                    }
                    return true;
                };
            }
        };
    }]);

    module.directive('formMailcheck', ['$compile', function($compile) {
        return {
            restrict: 'A',
            priority: 20,
            scope: true,
            controller: function($scope, $parse){
                this.model = null;
                this.suggestion = null;
                this.empty = function() {
                    this.suggested = false;
                    return this.suggestion = null;
                };
                this.suggest = function(suggestion) {
                    this.suggested = true;
                    return this.suggestion = suggestion;
                };
                return this.select = function() {
                    $parse(this.model).assign($scope,this.suggestion.full);
                    return this.empty();
                };
            },
            compile: function(){
                return {
                    pre: function(scope, element, attrs, controller) {
                        return scope.mailcheck = controller;
                    },
                    post: function(scope, element, attrs, controller) {
                        controller.model = attrs['ngModel'];
                        var helpText    = angular.element('<p class="help-block" ng-cloak ng-show="mailcheck.suggested">'+
                        '<span translate="common_i18n_mailcheck_didYouMean"></span>&nbsp;'+
                        '<a ng-click="mailcheck.select()"><span class="address">{{mailcheck.suggestion.address}}</span>@<span class="domain">{{mailcheck.suggestion.domain}}</span></a>?'+
                        '</p>');
                        $compile(helpText)(scope);

                        if (attrs.formMailcheck){
                            var defaultText = angular.element('<p class="help-block" ng-show="!mailcheck.suggested" translate="'+attrs.formMailcheck+'"></p>');
                            $compile(defaultText)(scope);
                            element.before(defaultText);
                            element.before(helpText);
                        }
                        else {
                            element.after(helpText);
                        }

                        return element.on('keyup blur', function() {
                            return element.mailcheck({
                                domains: ['alice.it','ymail.com','aol.com','besonet.ch','bluemail.ch','bluewin.ch','freenet.ch','freenet.de','gmail.com','googlemail.com','gmx.ch','gmx.net','hispeed.ch','hotmail.ch','hotmail.com','sunrise.ch','me.com','msn.ch','outlook.com','seco.admin.ch','yahoo.de','yahoo.com'],
                                topLevelDomains: ['ch','com','net','de','it','fr','at','li','es'],
                                suggested: function(ele, suggestion) {
                                    return controller.suggest(suggestion);
                                },
                                empty: function() {
                                    return scope.$apply(function() {
                                        return controller.empty();
                                    });
                                }
                            });
                        });
                    }
                };
            }
        };
    }]);


    module.directive('formLabel', ['$compile', 'UiRenderService', function ($compile, UiRenderService) {
        return {
            restrict: 'A',
            priority: 10,
            link: function (scope, element, attrs) {
                var labelTranslate=true;
                var helpTextTranslate=true;
                var inlineForm = element.parent().hasClass("form-inline");
                var horizontalForm = element.parent().hasClass("form-horizontal");
                var fg = angular.element('<div class="form-group"></div>');
                var cb = angular.element('<div></div>');
                var horizontalFormLayer = UiRenderService.getFormGridContent();
                if (attrs.type === "checkbox" || attrs.type === "radio") {
                    cb.addClass(attrs.type);
                    cb.addClass(UiRenderService.getClassPrefix('check'));
                }

                // label/helptext i18n Text and compile
                if (attrs.formLabelTranslate === "false") {
                    labelTranslate=false;
                }
                var labelText=angular.element('<span>'+attrs.formLabel + '</span>');
                if (labelTranslate) {
                    labelText = angular.element('<span translate="' + attrs.formLabel + '"></span>');
                    $compile(labelText)(scope);
                }

                if (attrs.formHelpextTranslate==='false'){
                    helpTextTranslate=false;
                }
                var helpText;
                if (attrs.formHelptext !== undefined) {
                    helpText = UiRenderService.getHelptext(attrs.formHelptext,helpTextTranslate);
                    $compile(helpText)(scope);
                }

                // wrap form group
                if (horizontalForm || (attrs.type !== "checkbox" && attrs.type !== "radio")) {
                    element.wrap(fg);
                }
                // wrap checkbox/radio layer
                if (attrs.type === "checkbox" || attrs.type === "radio") {
                    // wrap horizontal form for checkbox/radio
                    if (horizontalForm) {
                        horizontalFormLayer.addClass(UiRenderService.getFormGridLabelClass(true));
                        element.wrap(horizontalFormLayer);
                    }
                    element.wrap(cb);
                }

                // label
                var label = angular.element('<label for="' + attrs.id + '"></label>');
                if (horizontalForm && attrs.type !== "checkbox" && attrs.type !== "radio") {
                    label.addClass(UiRenderService.getFormGridLabelClass()).addClass('control-label');
                }
                if (inlineForm && attrs.type !== "checkbox" && attrs.type !== "radio") {
                    label.addClass('sr-only');
                }
                if (attrs.type !== "checkbox" && attrs.type !== "radio") {
                    label.append(labelText);
                    element.before(label);
                    if (horizontalForm) {
                        element.wrap(horizontalFormLayer);
                    }
                }
                else {
                    labelText.addClass(attrs.type + '-label');
                    label.append(labelText);
                    label.append(angular.element('<span class="box"></span>'));
                    element.after(label);
                }

                if (attrs.formHelptext !== undefined && !horizontalForm && !inlineForm) {
                    element.before(helpText);
                }
                else if (attrs.formHelptext !== undefined && horizontalForm) {
                    element.after(helpText);
                }
                else if (attrs.formHelptext !== undefined && inlineForm) {
                    helpText.addClass('sr-only');
                    element.after(helpText);
                }

                // ng-show
                if (attrs.ngShow !== undefined) {
                    scope.$watch(attrs.ngShow, function (display) {
                        var _element = element.parent();
                        if (horizontalForm || attrs.formPrepend || attrs.formAppend || attrs.formPrependDropdown || attrs.formAppendDropdown) {
                            _element = _element.parent();
                        }

                        if (display === true || display === 'true') {
                            _element.addClass("ng-show");
                            _element.removeClass("ng-hide");
                        }
                        else {
                            _element.addClass("ng-hide");
                            _element.removeClass("ng-show");
                        }
                    });
                }
                // ng-hide
                if (attrs.ngHide !== undefined) {
                    scope.$watch(attrs.ngHide, function (hide) {
                        var _element = element.parent();
                        if (horizontalForm || attrs.formPrepend || attrs.formAppend || attrs.formPrependDropdown || attrs.formAppendDropdown) {
                            _element = _element.parent();
                        }

                        if (hide === true || hide === 'true') {
                            _element.addClass("ng-hide");
                            _element.removeClass("ng-show");
                        }
                        else {
                            _element.addClass("ng-show");
                            _element.removeClass("ng-hide");
                        }
                    });
                }
            }
        };
    }]);

    // todo refactoring
    module.directive('formTag', ['$compile', '$parse', function ($compile, $parse) {
        return {
            restrict: 'A',
            priority: 20,
            link: function (scope, element, attrs) {
                var targetModel = $parse(attrs.formTargetModel)(scope);
                var fg = angular.element('<div class="form-control"></div>');
                var tagLayer = angular.element('<span></span>');
                var tagLayerItem = angular.element('<div class="tag" ng-repeat="item in ' + attrs.formTargetModel + '">{{item.text}}<button type="button" data-dismiss="alert" aria-hidden="true" class="close" ng-click="removeFromModel($index)">&times;</button></div>');
                $compile(tagLayerItem)(scope);
                tagLayer.append(tagLayerItem);
                element.wrap(fg);
                element.before(tagLayer);
                element.addClass("tag-input");
                scope.removeFromModel = function (tagIndex) {
                    targetModel.splice(tagIndex, 1);
                };
                scope.addToTargetModel = function (newObject) {
                    var duplicate = false;
                    angular.forEach(targetModel, function (value) {
                        if (angular.equals(newObject, value)) {
                            duplicate = true;
                        }
                    });
                    if (!duplicate) {
                        targetModel.push(newObject);
                    }
                };
            }
        };
    }]);

    // todo refacroring and simplify > formAddons
    module.directive('formAppendDropdown', ['$compile', '$parse', function ($compile, $parse) {
        return {
            restrict: 'A',
            priority: 10,
            link: function (scope, element, attrs) {
                var targetModel = $parse(attrs.formTargetModel)(scope);

                var inputGroup = angular.element('<div class="input-group"></div>');
                var inputGroupAppend = angular.element('<span class="input-group-btn"></span>');
                var inputGroupDropdown = angular.element('<div class="btn-group"></div>');
                var dropdownTitle = '';
                if (attrs.formAppendDropdownTitle !== undefined) {
                    dropdownTitle = attrs.formAppendDropdownTitle + " ";
                }
                var dropdownButton = angular.element('<button class="dropdown-toggle btn" type="button" data-toggle="dropdown">' + dropdownTitle + '<span class="caret"></span></button>');
                var dropdownList = angular.element('<ul class="dropdown-menu dropdown-menu-right"></ul>');
                var dropdownListItem = angular.element('<li ng-repeat="item in ' + attrs.formAppendDropdown + '"><a ng-click="addToTargetModel(item)" class="pointer">{{item.text}}</a></li>');

                $compile(dropdownListItem)(scope);

                dropdownList.append(dropdownListItem);
                inputGroupDropdown.append(dropdownButton);
                inputGroupDropdown.append(dropdownList);
                inputGroupAppend.append(inputGroupDropdown);

                if (!element.parent().hasClass("input-group")) {
                    element.wrap(inputGroup);
                }
                element.after(inputGroupAppend);

                scope.addToTargetModel = function (newObject) {
                    var duplicate = false;
                    angular.forEach(targetModel, function (value) {
                        if (angular.equals(newObject, value)) {
                            duplicate = true;
                        }
                    });
                    if (!duplicate) {
                        targetModel.push(newObject);
                    }
                };
            }
        };
    }]);

    module.directive('formPrependDropdown', ['$compile', '$parse', function ($compile, $parse) {
        return {
            restrict: 'A',
            priority: 10,
            link: function (scope, element, attrs) {
                var targetModel = $parse(attrs.formTargetModel)(scope);

                var inputGroup = angular.element('<div class="input-group"></div>');
                var inputGroupPrepend = angular.element('<span class="input-group-btn"></span>');
                var inputGroupDropdown = angular.element('<div class="btn-group"></div>');
                var dropdownTitle = '';
                if (attrs.formPrependDropdownTitle !== undefined) {
                    dropdownTitle = attrs.formPrependDropdownTitle + " ";
                }
                var dropdownButton = angular.element('<button class="dropdown-toggle btn" type="button" data-toggle="dropdown">' + dropdownTitle + '<span class="caret"></span></button>');
                var dropdownList = angular.element('<ul class="dropdown-menu dropdown-menu-right"></ul>');
                var dropdownListItem = angular.element('<li ng-repeat="item in ' + attrs.formPrependDropdown + '"><a ng-click="addToTargetModel(item)" class="pointer">{{item.text}}</a></li>');

                $compile(dropdownListItem)(scope);

                dropdownList.append(dropdownListItem);
                inputGroupDropdown.append(dropdownButton);
                inputGroupDropdown.append(dropdownList);
                inputGroupPrepend.append(inputGroupDropdown);

                if (!element.parent().hasClass("input-group")) {
                    element.wrap(inputGroup);
                }
                element.before(inputGroupPrepend);

                scope.addToTargetModel = function (newObject) {
                    var duplicate = false;
                    angular.forEach(targetModel, function (value) {
                        if (angular.equals(newObject, value)) {
                            duplicate = true;
                        }
                    });
                    if (!duplicate) {
                        targetModel.push(newObject);
                    }
                };
            }
        };
    }]);

    module.directive('formAppend', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            priority: 20,
            link: function (scope, element, attrs) {
                var inputGroup = angular.element('<div class="input-group"></div>');
                var inputGroupAppend = angular.element('<span class="input-group-addon"></span>');

                if (attrs.formAppendIcon === undefined && attrs.formAppendBtn === undefined){
                    var appendText = angular.element('<span i18n-msg="' + attrs.formAppend + '"></span>');
                    $compile(appendText)(scope);
                    inputGroupAppend.append(appendText);
                }
                else if (attrs.formAppendIcon === "true" && attrs.formAppendBtn === undefined) {
                    inputGroupAppend.attr('glyph-icon', attrs.formAppend);
                    $compile(inputGroupAppend)(scope);
                }

                if (attrs.formAppendBtn !== undefined) {
                    var appendBtnType="button";
                    if (attrs.formAppendBtnSubmit !== undefined && attrs.formAppendBtnSubmit==="true") {
                        appendBtnType="submit";
                    }
                    var appendBtn = angular.element('<button type="'+appendBtnType+'" ng-click="' + attrs.formAppendBtn + '"></button>');
                    if (attrs.formAppendIcon === "true") {
                        appendBtn.attr('glyph-icon', attrs.formAppend);
                    }
                    else {
                        appendBtn.attr('i18n-msg', attrs.formAppend);
                    }
                    if (element.hasClass('input-sm')){
                        appendBtn.addClass('btn-sm');
                    }
                    if (element.hasClass('input-lg')){
                        appendBtn.addClass('btn-lg');
                    }
                    $compile(appendBtn)(scope);
                    inputGroupAppend = angular.element('<span class="input-group-btn"></span>');
                    inputGroupAppend.append(appendBtn);
                }
                if (!element.parent().hasClass("input-group")) {
                    element.wrap(inputGroup);
                }
                element.after(inputGroupAppend);
            }
        };
    }]);

    module.directive('formPrepend', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            priority: 20,
            link: function (scope, element, attrs) {
                var inputGroup = angular.element('<div class="input-group"></div>');
                var inputGroupPrepend = angular.element('<span class="input-group-addon"></span>');

                if (attrs.formPrependIcon === undefined && attrs.formPrependBtn === undefined){
                    var prependText = angular.element('<span i18n-msg="' + attrs.formPrepend + '"></span>');
                    $compile(prependText)(scope);
                    inputGroupPrepend.append(prependText);
                }
                else if (attrs.formPrependIcon === "true" && attrs.formPrependBtn === undefined) {
                    inputGroupPrepend.attr('glyph-icon', attrs.formPrepend);
                    $compile(inputGroupPrepend)(scope);
                }

                if (attrs.formPrependBtn !== undefined) {
                    var prependBtnType="button";
                    if (attrs.formPrependBtnSubmit !== undefined && attrs.formPrependBtnSubmit==="true") {
                        prependBtnType="submit";
                    }
                    var prependBtn = angular.element('<button type="'+prependBtnType+'" ng-click="' + attrs.formPrependBtn + '"></button>');
                    if (attrs.formPrependIcon === "true"){
                        prependBtn.attr('glyph-icon', attrs.formPrepend);
                    }
                    else {
                        prependBtn.attr('i18n-msg', attrs.formPrepend);
                    }
                    if (element.hasClass('input-sm')){
                        prependBtn.addClass('btn-sm');
                    }
                    if (element.hasClass('input-lg')){
                        prependBtn.addClass('btn-lg');
                    }
                    $compile(prependBtn)(scope);
                    inputGroupPrepend = angular.element('<span class="input-group-btn"></span>');
                    inputGroupPrepend.append(prependBtn);
                }
                if (!element.parent().hasClass("input-group")) {
                    element.wrap(inputGroup);
                }
                element.before(inputGroupPrepend);
            }
        };
    }]);

    module.directive('formInset', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            priority: 20,
            link: function (scope, element, attrs) {
                var inputGroup = angular.element('<div class="input-group"></div>');
                var inputGroupInset = angular.element('<span class="input-group-addon input-group-inset"></span>');

                if (attrs.formInsetAction === undefined && attrs.formInsetBtn === undefined){
                    inputGroupInset.attr('glyph-icon', attrs.formInset);
                    $compile(inputGroupInset)(scope);
                }
                else {
                    var insetAction = angular.element('<a ng-click="' + attrs.formInsetAction + '"></a>');

                    if (attrs.formInsetBtn !== undefined) {
                        var insetBtnType="button";
                        if (attrs.formInsetBtn==="submit") {
                            insetBtnType="submit";
                        }
                        insetAction = angular.element('<button type="'+insetBtnType+'" ng-click="' + attrs.formInsetAction + '"></button>');
                        if (element.hasClass('input-sm')){
                            insetAction.addClass('btn-sm');
                        }
                        if (element.hasClass('input-lg')){
                            insetAction.addClass('btn-lg');
                        }
                    }

                    insetAction.attr('glyph-icon', attrs.formInset);
                    $compile(insetAction)(scope);
                    inputGroupInset.append(insetAction);
                }

                if (!element.parent().hasClass("input-group")) {
                    element.wrap(inputGroup);
                }

                if (attrs.formInsetAlign==='right'){
                    element.addClass("inset-align-right");
                    element.after(inputGroupInset);
                }
                else {
                    element.before(inputGroupInset);
                }
            }
        };
    }]);

    module.directive('formAlert', ['$compile',function($compile){
        return {
            priority: 5,
            restrict: 'A',
            link: function(scope, element, attrs){
                var trigger = attrs.formAlertTrigger || true;
                var severity = attrs.alertSeverity || "info";
                var dismissable = attrs.alertDismissable || false;
                var dismissableText = attrs.alertDismissableText || false;
                var alert=angular.element('<alert ng-show="'+trigger+'" alert-severity="'+severity+'" alert-dismissable="'+dismissable+'"><span translate="'+attrs.formAlert+'"></span></alert>');
                if (dismissableText){
                    alert.attr('alert-dismissable-text',dismissableText);
                }
                alert.addClass('form-alert');
                $compile(alert)(scope);
                element.after(alert);
            }
        };
    }]);
}());
