/**
 * @author: @AngularClass
 */

const ENV = process.env.ENV;
const baseUrl = ('production' == ENV)? 'http://localhost:3100':'http://localhost:3110';

require('ts-node/register');
var helpers = require('./helpers');

exports.config = {
    baseUrl: baseUrl,

    params: {
        baseUrl: baseUrl
    },

    // use `npm run e2e`
    specs: [
        helpers.root('features/files/*.feature')
    ],
    exclude: [],

    framework: 'custom',

    cucumberOpts: {
        format: "summary",
        resultJsonOutputFile: 'report.json',
        require: [
            "features/support/*.ts",
            "features/step_definitions/**/*.po.ts",
            "features/step_definitions/**/*.e2e.ts"
        ],
        tags: ['@dev']
    },

    allScriptsTimeout: 110000,

    frameworkPath: require.resolve('protractor-cucumber-framework'),

    getPageTimeout: 10000,

    jasmineNodeOpts: {
        showTiming: true,
        showColors: true,
        isVerbose: false,
        includeStackTrace: false,
        defaultTimeoutInterval: 400000
    },
    directConnect: true,

    capabilities: {
        'browserName': 'chrome',
        'chromeOptions': {
            'args': ['show-fps-counter=true','--disable-web-security']
        },
        'loggingPrefs': {
            'browser': 'ALL'
        }
    },

    onPrepare: function () {
        browser.ignoreSynchronization = true;
    },

    /**
     * Angular 2 configuration
     *
     * useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page instead of just the one matching
     * `rootEl`
     */
    useAllAngular2AppRoots: true
};