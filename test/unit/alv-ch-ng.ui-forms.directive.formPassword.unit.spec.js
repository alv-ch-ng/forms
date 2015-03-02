;(function() {

describe("formPassword directive", function() {

    beforeEach(module('alv-ch-ng.forms', function() {}));
        it('renders the html element as required',
            function() {
                inject(function ($compile, $rootScope) {
                    var scope = $rootScope.$new();
                    var elem = angular.element('<div><input type="password" form-password id="password1" ng-model="passwordTest" /></div>');
                    $compile(elem)(scope);
                    scope.$digest();

                    expect(elem.children('.input-group')).toBeTruthy();
                    expect(elem.find('#password1').attr('type')).toBe('password');
                    expect(elem.children('.input-group').children("span.input-group-addon.input-group-inset")).toBeTruthy();
                    expect(elem.children('.input-group').children("span.input-group-addon.input-group-inset").children("a")).toBeTruthy();
                    expect(elem.children('.input-group').children("span.input-group-addon.input-group-inset").children("a").attr("ng-click","formShowPassword()")).toBeTruthy();
                    expect(elem.children('.input-group').children("span.input-group-addon.input-group-inset").children("a").children("span.glyphicon.glyphicon-eye-open")).toBeTruthy();

                    scope.formShowPassword();
                    scope.$digest();

                    expect(elem.find('#password1').attr('type')).toBe('text');
                    expect(elem.children('.input-group').children("span.input-group-addon.input-group-inset").children("a").children("span.glyphicon.glyphicon-eye-close")).toBeTruthy();

                    scope.formShowPassword();
                    scope.$digest();

                    expect(elem.find('#password1').attr('type')).toBe('password');
                    expect(elem.children('.input-group').children("span.input-group-addon.input-group-inset").children("a").children("span.glyphicon.glyphicon-eye-open")).toBeTruthy();
                });
            }
        );
    });

}());
