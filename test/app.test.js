require('./common')

describe('DCCN Application Manager', () => {
    before(authenticateWithTestAcct)

    context('update_application', () => {
        // correct inputs
        it('should update the application name', async () => {
            // create an app for app_update
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
            sleep(8000)

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
                if (e != null){
                    console.log('Please type in a valid app_update_name (a string: at least length 1)')
                }
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
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)

            // check the update results
            path_detail = '/app/detail/' + app.app_id
            app_updated = await reqA('GET', path_detail)
            object_name = app_updated.app_report.app_deployment.app_name
            expect(object_name).to.equal(app_info.app_update_name)
        }).timeout(30000)

        // empty app name
        it('cannot update the application, should throw an error', async () => {
            const appList = await reqA('GET', '/app/list')
            expect(appList.app_reports.length).to.be.at.least(1)
            const app = appList.app_reports[0]
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            const chart = chartList.charts[0]
            const object_id = app.app_deployment.app_id
            path = '/app/update/' + object_id
            try{
                await reqA('POST', path, {
                app_name: '',
                chart_name: chart.chart_name,
                chart_repo: chart.chart_repo,
                chart_ver: chart.chart_latest_version
              })
            }
            catch(e) {
                if (e == null)
                {                   
                    throw e
                }               
            }
        })

        // no exist chart
        it('cannot update the application, should throw an error', async () => {
            const appList = await reqA('GET', '/app/list')
            expect(appList.app_reports.length).to.be.at.least(1)
            const app = appList.app_reports[0]
            const object_id = app.app_deployment.app_id
            path = '/app/update/' + object_id
            try{
                await reqA('POST', path, {
                app_name: '',
                chart_name: None,
                chart_repo: None,
                chart_ver: None
              })
            }
            catch(e) {
                if (e == null)
                {                   
                    throw e
                }               
            }
        })
        
        // delete the app created
        it('delete the app created', async () => {
            const appList_delete = await reqA('GET', '/app/list')
            await Promise.all(appList_delete.app_reports.map(app => reqA('DELETE', `/app/purge/${app.app_deployment.app_id}`)))
        })
    })

    context('create_application', () => {
        
        // No.1 test
        // regular direct inputs
        it('should create an application', async () => {
            const app_info = require('commander')
            app_info
                .option('--app_create_name <string>', 'type in a create app name', 'app_create_test')
                .option('--app_create_ns_name <string>', 'type in a create namespace name', 'app_create_ns_test')
                .option('--app_create_ns_cpu_limit <int>', 'type in a create namespace cpu limit', 1000)
                .option('--app_create_ns_mem_limit <int>', 'type in a create namespace mem limit', 2048)
                .option('--app_create_ns_storage_limit <int>', 'type in a create namespace storage limit', 8)
            app_info.parse(process.argv)
            
            // check the input
            try{
                expect(app_info.app_create_name.length).to.be.at.least(1)
            }
            catch(e){
                if (e != null){
                    console.log('Please type in a valid app_create_name (a string: at least length 1)')
                }
            }

            try{
                expect(app_info.app_create_ns_name.length).to.be.at.least(1)
            }
            catch(e){
                if (e != null){
                    console.log('Please type in a valid app_create_ns_name (a string: at least length 1)')
                }
            }

            try{
                expect(app_info.app_create_ns_cpu_limit).to.be.at.least(100)
            }
            catch(e){
                if (e != null){
                    console.log('Please type in a valid app_create_ns_cpu_limit (an integer: at least 100)')
                }
            }

            try{
                expect(app_info.app_create_ns_mem_limit).to.be.at.least(256)
            }
            catch(e){
                if (e != null){
                    console.log('Please type in a valid app_create_ns_mem_limit (an integer: at least 256)')
                }
            }

            try{
                expect(app_info.app_create_ns_storage_limit).to.be.at.least(2)
            }
            catch(e){
                if (e != null){
                    console.log('Please type in a valid app_create_ns_storage_limit (an integer: at least 2)')
                }
            }


            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
            const chart = chartList.charts[0]
            const app = await reqA('POST', '/app/create', {
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
            expect(app.app_id).to.be.a('string')

            // wait for app status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)

            // purge the app created
            const appList = await reqA('GET', '/app/list')
            await Promise.all(appList.app_reports.map(app => reqA('DELETE', `/app/purge/${app.app_deployment.app_id}`)))
        }).timeout(20000)

        // No.2 test
        // regular inputs with create namespace first
        it('should create an application', async () => {
            const app_info = require('commander')
            app_info
                .option('--app_create_name <string>', 'type in a create app name', 'app_create_test')
            app_info.parse(process.argv)

            try{
                expect(app_info.app_create_name.length).to.be.at.least(1)
            }
            catch(e){
                if (e != null){
                    console.log('Please type in a valid app_create_name (a string: at least length 1)')
                }
            }

            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
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
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)

            const chart = chartList.charts[0]
            const app = await reqA('POST', '/app/create', {
                app_name: app_info.app_create_name,
                chart: {
                    chart_name: chart.chart_name,
                    chart_repo: chart.chart_repo,
                    chart_ver: chart.chart_latest_version
                },
                ns_id: namespace.ns_id   
            })
            expect(app.app_id).to.be.a('string')

            // wait for app status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)

            // purge the app created
            const appList = await reqA('GET', '/app/list')
            await Promise.all(appList.app_reports.map(app => reqA('DELETE', `/app/purge/${app.app_deployment.app_id}`)))
            
            // wait for app status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)

            // delete the namespace created
            path = '/namespace/delete/' + namespace.ns_id
            await reqA('DELETE', path)

        }).timeout(30000)
            
        // No.3 test
        // empty name input
        it('empty name inputs, connot create an application, should throw an error', async () => {
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
            const chart = chartList.charts[0]
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
                if (e == null)
                {                   
                    throw e
                }               
            }
        })

        // No.4 test
        // zero value inputs
        it('zero value inputs, connot create an application, should throw an error', async () => {
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
            const chart = chartList.charts[0]
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
                if (e == null)
                {                   
                    throw e
                }               
            }
        })

        // No.5 test
        // wrong type inputs
        it('wrong type inputs, connot create an application, should throw an error', async () => {
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
            const chart = chartList.charts[0]
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
                if (e == null)
                {                   
                    throw e
                }               
            }
        })

        // No.6 test
        // negative value inputs
        it('negative inputs, connot create an application, should throw an error', async () => {
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
            const chart = chartList.charts[0]
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
                if (e == null)
                {                   
                    throw e
                }               
            }
        })

        // No.7 test
        // no namespace inputs
        it('negative inputs, connot create an application, should throw an error', async () => {
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
            const chart = chartList.charts[0]
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
                if (e == null)
                {                   
                    throw e
                }               
            }
        })

        // No.8 test
        // no chart
        it('no chart, connot create an application, should throw an error', async () => {
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
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
                if (e == null)
                {                   
                    throw e
                }               
            }
        })
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
            await reqA('POST', '/app/create', {
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
            sleep(8000)

            // get app details
            const appList = await reqA('GET', '/app/list')
            expect(appList.app_reports.length).to.be.at.least(1)
            const app = appList.app_reports[0]
            const appDetail = await reqA('GET', `/app/detail/${app.app_deployment.app_id}`)
            const timeCutoff = 1557376767000
            expect(appDetail.app_report.app_deployment.chart_detail.chart_app_ver.length).to.be.at.least(1)
            expect(appDetail.app_report.app_deployment.chart_detail.chart_icon_url.length).to.be.at.least(1)
            expect(toTS(appDetail.app_report.app_deployment.attributes.creation_date)).to.be.at.least(timeCutoff)
            expect(toTS(appDetail.app_report.app_deployment.attributes.last_modified_date)).to.be.at.least(timeCutoff)
            expect(toTS(appDetail.app_report.app_deployment.attributes.creation_date)).to.be.at.least(timeCutoff)
            expect(toTS(appDetail.app_report.app_deployment.namespace.creation_date)).to.be.at.least(timeCutoff)
            expect(toTS(appDetail.app_report.app_deployment.namespace.last_modified_date)).to.be.at.least(timeCutoff)
            
            // delete the app created
            const appList_delete = await reqA('GET', '/app/list')
            await Promise.all(appList_delete.app_reports.map(app => reqA('DELETE', `/app/purge/${app.app_deployment.app_id}`)))
        }).timeout(20000)
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

            // delete the app created
            const appList_delete = await reqA('GET', '/app/list')
            await Promise.all(appList_delete.app_reports.map(app => reqA('DELETE', `/app/purge/${app.app_deployment.app_id}`)))
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
            sleep(8000)

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
            const nsList = await reqA('GET', '/namespace/list')
            for (i = 0; i < nsList.ns_reports.length; i++){
                if(nsList.ns_reports[i].ns_status == 'NS_RUNNING'){
                    namespace_id = nsList.ns_reports[i].namespace.ns_id
                    path = '/namespace/delete/' + namespace_id
                    await reqA('DELETE', path)
                } 
            }
        }).timeout(20000)
    })
})