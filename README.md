## AppMgr & DcMgr Test

### Automatical test

To do all tests automatically, run the following in your terminal:

```
npm test
```

## Use Mocha Framework

Install the Mocha framework，run the following in your terminal:

```
npm install -global mocha
```

To run a specific test file, for example, run this command in your terminal:

```
# just run app.test
mocha app.test.js
```

To run a specific API test（for example, you just want to run the create_application test), run this command in your terminal:

```
# just test create_application API
mocha app.test.js -g 'create_application'
```

In several tests, you can reset the parameters as you want:

```
# Install commander at first
npm install commander

# change the parameters (use create_app_name as an example)
mocha app.test.js -g 'create_application' -options -app_create_name 'app' -app_create_ns_name 'ns' 
```
