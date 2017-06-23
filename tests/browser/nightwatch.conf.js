'use strict'

const seleniumServer = require('selenium-server/package.json')

const configure = (obj) => {
  Object.keys(obj).forEach(key => {
    if (process.env[key] !== undefined) {
      obj[key] = process.env[key]
    }
  })

  return obj
}

const defaults = configure({
  SELENIUM_PORT: 4444,
  SELENIUM_HOST: '127.0.0.1',
  BROWSER: 'chrome',
  PARALLEL: false,
  REPORTS_DIR: '.reports',
  CI: false
})

const config = {
  src_folders: ['tests/browser'],
  output_folder: defaults.REPORTS_DIR,
  page_objects_path: 'tests/browser/pages',
  globals_path: 'tests/browser/globals',
  custom_commands_path: 'tests/browser/commands',
  custom_assertions_path: 'tests/browser/assertions',

  selenium: {
    start_process: true,
    server_path: `./node_modules/selenium-server/lib/runner/selenium-server-standalone-${seleniumServer.version}.jar`,
    host: defaults.SELENIUM_HOST,
    port: defaults.SELENIUM_PORT,
    cli_args: {
      'webdriver.chrome.driver': './node_modules/chromedriver/bin/chromedriver',
      'webdriver.gecko.driver': './node_modules/geckodriver/bin/geckodriver'
    }
  },

  test_settings: {
    default: {
      launch_url: 'http://localhost',
      selenium_port: defaults.SELENIUM_PORT,
      selenium_host: defaults.SELENIUM_HOST,
      silent: true,
      end_session_on_fail: defaults.CI,
      skip_testcases_on_fail: true,
      screenshots: {
        enabled: true,
        on_failure: true,
        on_error: true,
        path: `${defaults.REPORTS_DIR}/browser/screenshots`
      },
      desiredCapabilities: {
        browserName: defaults.BROWSER,
        javascriptEnabled: true,
        acceptSslCerts: true,
        loggingPrefs: {
          browser: 'ALL'
        },
        chromeOptions: {
          args: ['window-size=1440,1024']
        }
      }
    }
  }
}

if (defaults.PARALLEL) {
  config.test_workers = true
}

module.exports = config
