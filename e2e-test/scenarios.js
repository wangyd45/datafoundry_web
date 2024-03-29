'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('my app', function () {


    it('should automatically redirect to /home when location hash/fragment is empty', function () {
        browser.get('index.html');
        expect(browser.getLocationAbsUrl()).toMatch("/home");
    });


    describe('home', function () {

        beforeEach(function () {
            browser.get('index.html#/home');
        });


        it('should render home when user navigates to /home', function () {
            expect(element.all(by.css('[ui-view] p')).first().getText()).toMatch(/partial for view 1/);
        });

    });


    describe('view2', function () {

        beforeEach(function () {
            browser.get('index.html#/view2');
        });


        it('should render view2 when user navigates to /view2', function () {
            expect(element.all(by.css('[ui-view] p')).first().getText()).toMatch(/partial for view 2/);
        });

    });
});
