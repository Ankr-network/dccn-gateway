require('./common')

describe('Fees Manager', () => {
    before(authenticateWithTestAcct)

    context('history_biling_list', () => {

        it('should history_biling_list with length > 0', async () => {
            const list = await reqA('GET', '/fees/history_list', {start:"2019-01-01", end:"2019-09-31"})
            log.info('fees List', JSON.stringify(list, null, '  '))
            expect(list.records.length).to.be.at.least(1)

        })

    })

    context('billing detail', () => {
        it('should return the detail of monthly fees', async () => {
            const detail = await reqA('GET', '/fees/month_detail', {month:"2019-06-01"})
            log.info('billing detail', JSON.stringify(detail, null, '  '))
            expect(detail.account).to.be.a('string')
            expect(detail.attn).to.be.a('string')
            expect(detail.total).to.be.a('number')
            expect(detail.issue_date).to.be.a('string')
            expect(detail.start).to.be.a('string')
            expect(detail.end).to.be.a('string')
            expect(detail.charges).be.a('number')
            expect(detail.ns_fees.length).to.at.least(1)

        })

    })





})
