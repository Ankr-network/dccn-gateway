require('./common')

describe('DCCN Application Manager', () => {
    before(authenticateWithTestAcct)

    context('list_namespaces', () => {
        it('should list namespaces', async () => {
            const nsList = await reqA('GET', '/namespace/list')
            log.info('nsList', JSON.stringify(nsList, null, '  '))
            expect(nsList.ns_reports.length).to.be.at.least(0)
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

    context('create_application', () => {
        it('should create an application', async () => {
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'stable'
            })
            expect(chartList.charts.length).to.be.at.least(1)
            const chart = chartList.charts[0]
            const app = await reqA('POST', '/app/create', {
                app_name: 'app1test',
                chart: {
                    chart_name: chart.chart_name,
                    chart_repo: chart.chart_repo,
                    chart_ver: chart.chart_latest_version
                },
                namespace: {
                    ns_name: 'ns1test',
                    ns_cpu_limit: 1000,
                    ns_mem_limit: 2048,
                    ns_storage_limit: 8
                }
            })
            expect(app.app_id).to.be.a('string')
        })
    })

    context('get_application_detail', () => {
        it('should get an application detail', async () => {
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
        })
    })

    context('cancel_application', () => {
        it('should cancel an application', async () => {
            const appList = await reqA('GET', '/app/list')
            expect(appList.app_reports.length).to.be.at.least(1)
            const app = appList.app_reports[0]
            const cancelApp = await reqA('POST', `/app/cancel/${app.app_deployment.app_id}`)
            expect(cancelApp).to.be.an('object')
            const appDetail = await reqA('GET', `/app/detail/${app.app_deployment.app_id}`)
            expect(appDetail.app_report.app_status).to.be.equal('APP_CANCELING' || 'APP_CANCELED')
        })
    })

    context('purge_application', () => {
        it('should purge all applications', async () => {
            const appList = await reqA('GET', '/app/list')
            expect(appList.app_reports.length).to.be.at.least(1)
            const purgeApps = await Promise.all(appList.app_reports.map(app => reqA('DELETE', `/app/purge/${app.app_deployment.app_id}`)))
            expect(purgeApps.length).to.be.at.least(1)
            purgeApps.forEach(purgeApp => {
                expect(purgeApp).to.be.an('object')
            })
            const appListAfter = await reqA('GET', '/app/list')
            expect(appListAfter.app_reports.length).to.be.equal(0)
        })
    })

    /*context('delete_namespace', () => {
        it('should delete all namespace', async () => {
            const nsList = await reqA('GET', '/namespace/list')
            expect(nsList.ns_reports.length).to.be.at.least(1)
            const deleteNSs = await Promise.all(nsList.ns_reports.map(ns => reqA('DELETE', `/namespace/delete/${ns.namespace.ns_id}`)))
            expect(deleteNSs.length).to.be.at.least(1)
            // deleteNSs.forEach(deleteNS => {
            //     expect(deleteNS).to.be.an('object')
            // })
            const nsListAfter = await reqA('GET', '/namespace/list')
            nsListAfter.ns_reports.forEach(r => {
                expect(r.ns_status).to.be.equal('NS_CANCELING')
            })
        })
    })*/
})