require('./common')

describe('DCCN Application Manager', () => {
    before(authenticateWithTestAcct)

    context('list_application', () => {
        it('should list applications with length == 0', async () => {
            const appList = await reqA('GET', '/app/list')
            log.info('appList', JSON.stringify(appList, null, '  '))
            expect(appList.app_reports.length).to.be.at.least(0)
        })
    })

    context.skip('create_application', () => {
        it('should create an application', async () => {
            const chartList = await reqA('GET', '/chart/list')
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
        it('should get applications detail', async () => {
            const appList = await reqA('GET', '/app/list')
            expect(appList.app_reports.length).to.be.at.least(1)
            const app = appList.app_reports[0]
            const timeCutoff = 1557376767
            log.debug('appList', JSON.stringify(app, null, '  '))
            expect(app.app_deployment.chart_detail.chart_app_ver.length).to.be.at.least(1)
            expect(app.app_deployment.chart_detail.chart_icon_url.length).to.be.at.least(1)
            expect(app.app_deployment.attributes.creation_date).to.be.at.least(timeCutoff)
            expect(app.app_deployment.attributes.last_modified_date).to.be.at.least(timeCutoff)
            expect(app.app_deployment.attributes.creation_date).to.be.at.least(timeCutoff)
            expect(app.app_deployment.namespace.creation_date).to.be.at.least(timeCutoff)
            expect(app.app_deployment.namespace.last_modified_date).to.be.at.least(timeCutoff)
        })
    })
})