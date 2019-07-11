require('./common')

describe('DCCN Chart Manager', () => {
    before(authenticateWithTestAcct)

    context('list_charts', () => {
        it('should list stable charts with length > 0', async () => {
            const chartList = await reqA('GET', '/chart/list')
            log.info('chartList', JSON.stringify(chartList, null, '  '))
            expect(chartList.charts.length).to.be.least(1)
        })

        it('should list user charts with length == 0', async () => {
            const chartList = await reqA('GET', '/chart/list', {
                chart_repo: 'user'
            })
            log.info('chartList', JSON.stringify(chartList, null, '  '))
            expect(chartList.charts.length).to.be.equal(1)
        })
    })
})