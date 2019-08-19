require('./common')

describe('DCCN Application Manager', () => {
    before(authenticateWithTestAcct)
    context('update_application', () => {
        
        it('should update the application', async () => {
            // case 1: correct input
            // create an app for app_update
            console.log("case 1: correct input")
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
            const chart = chartList.charts[0]
            const ns_app_update_test_name = 'ns_app_update_test'
            const ns_app_update_test_cpu_limit = 1000
            const ns_app_update_test_mem_limit = 2048
            const ns_app_update_test_storage_limit = 8
            const app = await reqA('POST', '/app/create', {
                app_name: 'app_update_test',
                chart: {
                    chart_name: chart.chart_name,
                    chart_repo: chart.chart_repo,
                    chart_ver: chart.chart_latest_version
                },
                namespace: {
                    ns_name: ns_app_update_test_name,
                    ns_cpu_limit: ns_app_update_test_cpu_limit,
                    ns_mem_limit: ns_app_update_test_mem_limit,
                    ns_storage_limit: ns_app_update_test_storage_limit
                }
            })

            // wait for app status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(15000)
            
            // app update
            const app_info = require('commander')
            app_info
                .option('--app_update_name <string>', 'type in an update app name', 'app_name_update_test')
            app_info.parse(process.argv)
        
            // check the input
            try{
                expect(app_info.app_update_name.length).to.be.at.least(1)
            }
            catch(e){
                throw new Error("Please type in a valid app_update_name (a string: at least length 1)")
                }

            app_path = '/app/detail/' + app.app_id
            const appDetail = await reqA('GET', app_path)
            const app_chart_name = appDetail.app_report.app_deployment.chart_detail.chart_name
            const app_chart_repo = appDetail.app_report.app_deployment.chart_detail.chart_repo
            const app_chart_ver = appDetail.app_report.app_deployment.chart_detail.chart_ver
            path = '/app/update/' + app.app_id
            await reqA('POST', path, {
                app_name: app_info.app_update_name,
                chart_name: app_chart_name,
                chart_repo: app_chart_repo,
                chart_ver: app_chart_ver
            })
            
            // wait for app status changed
            sleep(10000)

            // check the update results
            path_detail = '/app/detail/' + app.app_id
            app_updated = await reqA('GET', path_detail)
            object_name = app_updated.app_report.app_deployment.app_name
            expect(object_name).to.equal(app_info.app_update_name)
            
            // delete app created
            const delete_path = "/app/purge/" + app.app_id
            reqA('DELETE', delete_path)

            // wait for app status changed
            sleep(10000)            

            // delete namespace created
            const nsList = await reqA('GET', '/namespace/list')
            for (i = 0; i < nsList.ns_reports.length; i++){
                if(nsList.ns_reports[i].ns_status == 'NS_RUNNING'){
                    namespace_id = nsList.ns_reports[i].namespace.ns_id
                    path = '/namespace/delete/' + namespace_id
                    await reqA('DELETE', path)
                } 
            }
            // case 1 done !
            console.log("case 1 pass !")
        }).timeout(50000)
    })

    context('create_application', () => {
        
        it('should create an application', async () => {
            // case 1: regular direct input
            console.log("case 1: regular direct inputs")
            const app_info = require('commander')
            app_info
                .option('--app_create_name <string>', 'type in a create app name', 'app_create_test')
                .option('--app_create_ns_name <string>', 'type in a create namespace name', 'app_create_ns_test')
                .option('--app_create_ns_cpu_limit <int>', 'type in a create namespace cpu limit', 1000)
                .option('--app_create_ns_mem_limit <int>', 'type in a create namespace mem limit', 2048)
                .option('--app_create_ns_storage_limit <int>', 'type in a create namespace storage limit', 8)
                .option('--app_create_customValue_key <string>', 'type in a customValue_key', 'app_create_customValue_key')
                .option('--app_create_customValue_value <string>', 'type in a customValue_key', 'app_create_customValue_value')
            app_info.parse(process.argv)
            // check the input
            try{
                expect(app_info.app_create_name.length).to.be.at.least(1)
            }
            catch(e){
                throw new Error("Please type in a valid app_create_name (a string: at least length 1)")
            }

            try{
                expect(app_info.app_create_ns_name.length).to.be.at.least(1)
            }
            catch(e){
                throw new Error("Please type in a valid app_create_ns_name (a string: at least length 1)")
            }

            try{
                expect(app_info.app_create_ns_cpu_limit).to.be.at.least(100)
            }
            catch(e){
                throw new Error("Please type in a valid app_create_ns_cpu_limit (an integer: at least 100)")
            }

            try{
                expect(app_info.app_create_ns_mem_limit).to.be.at.least(256)
            }
            catch(e){
                throw new Error("Please type in a valid app_create_ns_mem_limit (an integer: at least 256)")
            }

            try{
                expect(app_info.app_create_ns_storage_limit).to.be.at.least(2)
            }
            catch(e){
                throw new Error("Please type in a valid app_create_ns_storage_limit (an integer: at least 2)")
            }

            try{
                expect(app_info.app_create_customValue_key.length).to.be.at.least(1)
            }
            catch(e){
                throw new Error("Please type in a valid app_create_customValue_key (a string: at least length 1)")
            }

            try{
                expect(app_info.app_create_customValue_value.length).to.be.at.least(1)
            }
            catch(e){
                throw new Error("Please type in a valid app_create_customValue_string (a string: at least length 1)")
            }

            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
            const chart = chartList.charts[0]
            
            const app1 = await reqA('POST', '/app/create', {
                app_name: app_info.app_create_name,
                chart: {
                    chart_name: chart.chart_name,
                    chart_repo: chart.chart_repo,
                    chart_ver: chart.chart_latest_version
                },
                namespace: {
                    ns_name: app_info.app_create_ns_name,
                    ns_cpu_limit: app_info.app_create_ns_cpu_limit,
                    ns_mem_limit: app_info.app_create_ns_mem_limit,
                    ns_storage_limit: app_info.app_create_ns_storage_limit
                }
            })
            expect(app1.app_id).to.be.a('string')

            // wait for app status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)
            // purge the app created
            const delete_case1 = "/app/purge/" + app1.app_id
            await reqA('DELETE', delete_case1)

            console.log("case 1 pass !")
            // case 1: done!

            // case 2: regular direct inputs for Zilliqa (plus customValues)
            console.log("casse 2: regular direct inputs for Zilliqa (plus customValues)")
            const app2 = await reqA('POST', '/app/create', {
                app_name: app_info.app_create_name,
                chart: {
                    chart_name: 'zilliqa',
                    chart_repo: 'stable',
                    chart_ver: '0.1.0'
                },
                namespace: {
                    ns_name: app_info.app_create_ns_name,
                    ns_cpu_limit: app_info.app_create_ns_cpu_limit,
                    ns_mem_limit: app_info.app_create_ns_mem_limit,
                    ns_storage_limit: app_info.app_create_ns_storage_limit
                },
                custom_values: [
                    {
                    Key: "ankrCustomValues.seed_port",
                    Value: "32137"},
                    {
                    Key: "ankrCustomValues.pubkey",
                    Value: "03AB2115FA0FF77359B38FD14883B16412C7BF652EAD2C218C4B4F56F1ADFB3B89",
                    },
                    {
                    Key: "ankrCustomValues.prikey",
                    Value: "8F0FA8FD1849DA7A2B6B02404B60D3BC3D723603C4CAEDEE086B57F28B90798C",
                    }]
            })
            expect(app2.app_id).to.be.a('string')
            // wait for app status changed
            sleep(8000)

            // purge the app created
            const delete_case2 = "/app/purge/" + app2.app_id
            await reqA('DELETE', delete_case2)
            
            console.log("case 2 pass !")
            // case 2 done !
            

            // csae 3: regular inputs with create namespace first
            console.log("case 3: regular inputs with create namespace first")
            // create namespace first
            const ns_app_create_test_name = 'ns_app_create_test_namespace_first'
            const ns_app_create_test_cpu_limit = 1000
            const ns_app_create_test_mem_limit = 2048
            const ns_app_create_test_storage_limit = 8
            const namespace = await reqA('POST', '/namespace/create', {
                ns_name: ns_app_create_test_name,
                ns_cpu_limit: ns_app_create_test_cpu_limit,
                ns_mem_limit: ns_app_create_test_mem_limit,
                ns_storage_limit: ns_app_create_test_storage_limit
            })
            // wait for namespace status changed
            sleep(10000)
            const app3 = await reqA('POST', '/app/create', {
                app_name: app_info.app_create_name,
                chart: {
                    chart_name: chart.chart_name,
                    chart_repo: chart.chart_repo,
                    chart_ver: chart.chart_latest_version
                },
                ns_id: namespace.ns_id   
            })

            expect(app3.app_id).to.be.a('string')

            // wait for app status changed
            sleep(15000)

            // purge the app created
            const delete_case3 = "/app/purge/" + app3.app_id
            await reqA('DELETE', delete_case3)

            console.log("case 3 pass !")
            // case 3 done !

            // case 4: empty name input
            console.log("case 4: empty name input")
            var flag = 0
            try{
                await reqA('POST', '/app/create', {
                    app_name: '',
                    chart: {
                        chart_name: chart.chart_name,
                        chart_repo: chart.chart_repo,
                        chart_ver: chart.chart_latest_version
                        },
                    namespace: {
                        ns_name: '',
                        ns_cpu_limit: 200,
                        ns_mem_limit: 512,
                        ns_storage_limit: 16
                        }
                    })
                }
            catch(e) {
                flag = 1           
            }
            if (flag == 0) {
                throw new Error("should not create app for an empty app name")
            }
            console.log("case 4 pass !")
            // case 4 done !

            // csae 5: zero value inputs
            console.log("case 5: zero value inputs")
            flag = 0
            try{
                await reqA('POST', '/app/create', {
                    app_name: 'app1test',
                    chart: {
                        chart_name: chart.chart_name,
                        chart_repo: chart.chart_repo,
                        chart_ver: chart.chart_latest_version
                        },
                    namespace: {
                        ns_name: 'ns1test',
                        ns_cpu_limit: 0,
                        ns_mem_limit: 0,
                        ns_storage_limit: 0
                        }
                    })
                }
            catch(e) {
                flag = 1           
            }
            if (flag == 0) {
                throw new Error("should not create app for zero value input")       
            }
            console.log("case 5 pass !")
            // case 5 done !

            // case 6: wrong type inputs
            console.log("case 6: wrong type inputs")
            flag = 0
            try{
                await reqA('POST', '/app/create', {
                    app_name: 'app1test',
                    chart: {
                        chart_name: chart.chart_name,
                        chart_repo: chart.chart_repo,
                        chart_ver: chart.chart_latest_version
                        },
                    namespace: {
                        ns_name: 'ns1test',
                        ns_cpu_limit: '0',
                        ns_mem_limit: '1',
                        ns_storage_limit: 10.0
                        }
                    })
                }
            catch(e) {
                flag = 1           
            }
            if (flag == 0) {
                throw new Error("should not create app for wrong type input")
            }
            console.log("case 6 pass !")
            // case 6 done !
            
            // case 7: negative value inputs
            console.log("case 7: negative value inputs")
            flag = 0
            try{
                await reqA('POST', '/app/create', {
                    app_name: 'app1test',
                    chart: {
                        chart_name: chart.chart_name,
                        chart_repo: chart.chart_repo,
                        chart_ver: chart.chart_latest_version
                        },
                    namespace: {
                        ns_name: 'ns1test',
                        ns_cpu_limit: -1,
                        ns_mem_limit: -10,
                        ns_storage_limit: -100
                        }
                    })
                }
            catch(e) {
                flag = 1           
            }
            if (flag == 0) {
                throw new Error("should not create app for negative value inputs")         
            }
            console.log("case 7 pass !")
            // csae 7 done !

            // case 8: no namespace inputs
            console.log("case 8: no namespace inputs")
            flag = 0
            try{
                await reqA('POST', '/app/create', {
                    app_name: 'app1test',
                    chart: {
                        chart_name: chart.chart_name,
                        chart_repo: chart.chart_repo,
                        chart_ver: chart.chart_latest_version
                        },
                    namespace: {
                        ns_name: 'ns1test',
                        ns_cpu_limit: None,
                        ns_mem_limit: None,
                        ns_storage_limit: None
                        }
                    })
                }
            catch(e) {
                flag = 1           
            }
            if (flag == 0) {
                throw new Error("should not create app for no namespace inputs")
            }
            console.log("case 8 pass !")
            // case 8 done !

            // case 9: no chart
            console.log("case 9: no chart")
            flag = 0
            try{
                await reqA('POST', '/app/create', {
                    app_name: 'app1test',
                    chart: {
                        chart_name: None,
                        chart_repo: None,
                        chart_ver: None
                        },
                    namespace: {
                        ns_name: 'ns1test',
                        ns_cpu_limit: 800,
                        ns_mem_limit: 512,
                        ns_storage_limit: 16
                        }
                    })
                }
            catch(e) {
                flag = 1           
            }
            if (flag == 0) {
                throw new Error("should not create app for no exist chart")
            }
            console.log("case 9 pass !")
            // case 9 done!
        }).timeout(1200000)
    })


    context('get_application_overview', () => {
        it('should get overview of this user\s application', async () => {
            const appOverview = await reqA('GET', '/app/overview')
            log.info('appOverview', JSON.stringify(appOverview, null, '  '))
            expect(appOverview.cluster_count).to.be.a('number')
            expect(appOverview.namespace_count).to.be.a('number')
            expect(appOverview.network_count).to.be.a('number')
            expect(appOverview.total_app_count).to.be.a('number')
            expect(appOverview.cpu_total).to.be.a('number')
            expect(appOverview.cpu_usage).to.be.a('number')
            expect(appOverview.mem_total).to.be.a('number')
            expect(appOverview.mem_usage).to.be.a('number')
            expect(appOverview.storage_total).to.be.a('number')
            expect(appOverview.storage_usage).to.be.a('number')
        })
    })

    context('list_application', () => {
        it('should list applications', async () => {
            const appList = await reqA('GET', '/app/list')
            log.info('appList', JSON.stringify(appList, null, '  '))
            expect(appList.app_reports.length).to.be.at.least(0)
        })
    })

    context('get_application_detail', () => {
        it('should get an application detail', async () => {
            // create an app for get_detail
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
            const chart = chartList.charts[0]
            const app = await reqA('POST', '/app/create', {
                app_name: 'app_detail_test',
                chart: {
                    chart_name: chart.chart_name,
                    chart_repo: chart.chart_repo,
                    chart_ver: chart.chart_latest_version
                },
                namespace: {
                    ns_name: 'ns_app_detail_test',
                    ns_cpu_limit: 1000,
                    ns_mem_limit: 2048,
                    ns_storage_limit: 8
                }
            })

            // wait for app status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(10000)

            // get app details
            path = "/app/detail/" + app.app_id
            const appDetail = await reqA('GET', path)
            const timeCutoff = 1557376767000
            expect(appDetail.app_report.app_deployment.chart_detail.chart_app_ver.length).to.be.at.least(1)
            expect(appDetail.app_report.app_deployment.chart_detail.chart_icon_url.length).to.be.at.least(1)
            expect(toTS(appDetail.app_report.app_deployment.attributes.creation_date)).to.be.at.least(timeCutoff)
            expect(toTS(appDetail.app_report.app_deployment.attributes.last_modified_date)).to.be.at.least(timeCutoff)
            expect(toTS(appDetail.app_report.app_deployment.attributes.creation_date)).to.be.at.least(timeCutoff)
            expect(toTS(appDetail.app_report.app_deployment.namespace.creation_date)).to.be.at.least(timeCutoff)
            expect(toTS(appDetail.app_report.app_deployment.namespace.last_modified_date)).to.be.at.least(timeCutoff)
            
            // purge the app created
            sleep(10000)
            const delete_case = "/app/purge/" + app.app_id
            await reqA('DELETE', delete_case)
        }).timeout(40000)
    })

    context('cancel_application', () => {
        it('should cancel an application', async () => {
            // create an app for app_cancel
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
            const chart = chartList.charts[0]
            const app = await reqA('POST', '/app/create', {
                app_name: 'app_cancel_test',
                chart: {
                    chart_name: chart.chart_name,
                    chart_repo: chart.chart_repo,
                    chart_ver: chart.chart_latest_version
                },
                namespace: {
                    ns_name: 'ns_app_cancel_test',
                    ns_cpu_limit: 1000,
                    ns_mem_limit: 2048,
                    ns_storage_limit: 8
                }
            })

            // wait for app status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)

            // cancel the app and check
            path_cancel = '/app/cancel/' + app.app_id
            const cancelApp = await reqA('POST', path_cancel)
            expect(cancelApp).to.be.an('object')
            path_detail = '/app/detail/' + app.app_id
            const appDetail = await reqA('GET', path_detail)
            expect(appDetail.app_report.app_status).to.be.oneOf(['APP_CANCELING', 'APP_CANCELED'])

            // purge the app created
            sleep(10000)
            const delete_case = "/app/purge/" + app.app_id
            await reqA('DELETE', delete_case)
        }).timeout(20000)
    })

    context('purge_application', () => {
        it('should purge all applications', async () => {
            // created an app for app_purge
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
            const chart = chartList.charts[0]
            await reqA('POST', '/app/create', {
                app_name: 'app_purge_test',
                chart: {
                    chart_name: chart.chart_name,
                    chart_repo: chart.chart_repo,
                    chart_ver: chart.chart_latest_version
                },
                namespace: {
                    ns_name: 'ns_app_purge_test',
                    ns_cpu_limit: 1000,
                    ns_mem_limit: 2048,
                    ns_storage_limit: 8
                }
            })
            
            // wait for app status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(10000)

            // purge the app created and check
            const appList = await reqA('GET', '/app/list')
            expect(appList.app_reports.length).to.be.at.least(1)
            const purgeApps = await Promise.all(appList.app_reports.map(app => reqA('DELETE', `/app/purge/${app.app_deployment.app_id}`)))
            expect(purgeApps.length).to.be.at.least(1)
            purgeApps.forEach(purgeApp => {
                expect(purgeApp).to.be.an('object')
            })
            const appListAfter = await reqA('GET', '/app/list')
            expect(appListAfter.app_reports.length).to.be.equal(0)
        }).timeout(20000)
    })

    context('delete_all_namespace_created_in_app_test', () => {
        it('should delete a namespace by ns_id', async () => {
            // wait for app status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(15000)

            const nsList = await reqA('GET', '/namespace/list')
            for (i = 0; i < nsList.ns_reports.length; i++){
                if(nsList.ns_reports[i].ns_status == 'NS_RUNNING'){
                    namespace_id = nsList.ns_reports[i].namespace.ns_id
                    path = '/namespace/delete/' + namespace_id
                    await reqA('DELETE', path)
                } 
            }
        }).timeout(30000)
    })
})