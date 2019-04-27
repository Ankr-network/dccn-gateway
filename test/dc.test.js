require('./common')

describe('DCCN Data Center Manager', () => {
    before(authenticateWithTestAcct)

    context('list_data_center', () => {
        it('should list data centers with length > 0', async () => {
            const dcList = await reqA('GET', '/dc/list')
            log.info('dcList', JSON.stringify(dcList, null, '  '))
            expect(dcList.dcList.length).to.be.at.least(1)
        })
    })
})