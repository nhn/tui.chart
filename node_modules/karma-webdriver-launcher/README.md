# karma-webdriver-launcher

A plugin for Karma 0.12 to launch WebDriver instances

also, you can use remote WebDriver instance by setting true the "remoteHost" options.

see below.

## Usage

```bash
$ npm install karma-webdriver-launcher
```

In your karma.conf.js file (e.g. using SauceLabs Connect - you need to have a scout tunnel open for this to work!):

### SauceLabs Example

```js
module.exports = function(karma) {

  var webdriverConfig = {
    hostname: 'ondemand.saucelabs.com',
    port: 80,
    user: 'USERNAME',
    pwd: 'APIKEY'
  }


  ...

    config.set({

      ...

      customLaunchers: {
        'IE7': {
          base: 'WebDriver',
          config: webdriverConfig,
          browserName: 'internet explorer',
          platform: 'Windows XP',
          version: '10',
          'x-ua-compatible': 'IE=EmulateIE7',
          name: 'Karma',
          pseudoActivityInterval: 30000
        }
      },

      browsers: ['IE7'],

      ...

    });


```

### pseudoActivityInterval

Interval in ms to do some activity to avoid killing session by timeout.

If not set or set to `0` - no activity will be performed.

### Creating private remote test automation system

You can create your private remote test automation system.

![2015-06-16 11 02 07](https://cloud.githubusercontent.com/assets/1061205/8174419/5511e344-1417-11e5-8e41-204e9224d8be.png)

see https://github.com/SeleniumHQ/selenium/wiki/Grid2

#### Tested Environments

- VirtualBox WinXP, Win7 (IE6 ~ IE11, Chrome, FireFox)
- XCode iPhone Simulator (using appium)
- Android Virtual Device Emulator (using appium)

1\. download Selenium Standalone Server and make it work grid mode.

```bash
java jar selenium-standalone-server.jar -role hub &
```

2\. setting VM machine that want to use test environments. (e.g. IE7-VM, IE10-VM)

3\. start Selenium Standalone Server(hub mode) in VM and make it connect to grid server.

#### Desktop

```bash
java jar selenium-standalone-server.jar -role node -nodeConfig DefaultConfig.json
```

DefaultConfig.json (VM Machine. installed IE11, Chrome)

```json
{
    "capabilities": [
        {
            "browserName": "chrome",
            "maxInstances": 10,
            "seleniumProtocol": "WebDriver"
        }, {
            "browserName": "IE11",
            "maxInstances": 10,
            "seleniumProtocol": "WebDriver"
        }
    ],
    "configuration": {
        "maxSession": 5,
        "port": 5555,
        "host": "2.2.2.2"    // VM ip address
        "register": true,
        "hubPort": 4444,
        "hubHost": "1.1.1.1"    // hub server ip address
    }
}
```

#### Mobile

install nodejs upper v0.12, install appium

```bash
npm install -g appium
```

install XCode iPheon Simulator, Android Virtual Device Emulator and prepare testing environments. see [appium](http://appium.io/slate/en/master/?ruby#setting-up-appium)

run appium server

my startup script.

```bash
#!/bin/bash

cd ~
./Android/tools/emulator -avd Nexus_4_5.1.1 &

sleep 30

appium --port 5555 &

sleep 20

appium --nodeconfig /Users/mypc/WebDriver/nodeconfig.json
```

nodeconfig.json

```json
{
    "capabilities": [
        {
            "browserName": "Safari",
                "version": "8.3",
                "maxInstances": 1,
                "platform":"MAC"
        }, {
            "browserName": "Browser",
            "version": "5.1.1",
            "maxInstances": 1,
            "platform": "MAC"
        }
    ],
    "configuration":
    {
        "cleanUpCycle":2000,
        "timeout":30000,
        "proxy": "org.openqa.grid.selenium.proxy.DefaultRemoteProxy",
        "url": "http://2.2.2.2:4723/wd/hub",    // VM ip address
        "host": "2.2.2.2",    // VM ip address
        "port": 4723,
        "maxSession": 1,
        "register": true,
        "registerCycle": 5000,
        "hubPort": 4444,
        "hubHost": "1.1.1.1"    // hub server ip address
    }
}
```

4\. insert grid server's info to karma-webdriver configs.

karma.conf.js

```js
var webdriverConfig = {
    remoteHost: true,
    host: "1.1.1.1",
    port: 4444
};

...

config.set({
    browsers: [
        'Android',
        'iOS'
    ],

    ...

    customLaunchers: {
        'Android': {
            base: 'WebDriver',
            config: webdriverConfig,
            browserName: 'Browser',
            platformName: 'Android',
            platformVersion: '5.1.1',    // avd device version
            deviceName: 'emulator-5554'    // avd device id
        },
        'iOS': {
            base: 'WebDriver',
            config: webdriverConfig,
            browserName: 'Safari',
            platformName: 'iOS',
            platformVersion: '8.3',
            deviceName: 'iPhone 4s'
        }
    }
});
```

you can apply this javascript project CI server.