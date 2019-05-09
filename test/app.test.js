require('./common')

describe('DCCN Application Manager', () => {
    before(authenticateWithTestAcct)

    context.skip('list_application', () => {
        it('should list applications with length == 0', async () => {
            const appList = await reqA('GET', '/app/list')
            log.info('appList', JSON.stringify(appList, null, '  '))
            expect(appList.app_reports.length).to.be.equal(0)
        })
    })

    context('create_application', () => {
        it('should list applications with length == 0', async () => {
            const chartList = await reqA('GET', '/chart/list')
            expect(chartList.charts.length).to.be.at.least(1)
            console.log(chartList.charts[0])
        })
    })
})