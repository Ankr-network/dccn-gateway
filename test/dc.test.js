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

    context('get_network_info', () => {
        it('should return the overall network info', async () => {
            const networkInfo = await reqA('GET', '/dc/networkinfo')
            log.info('networkinfo', JSON.stringify(networkInfo, null, '  '))
            expect(networkInfo.user_count).to.be.a('number')
            expect(networkInfo.host_count).to.be.a('number')
            expect(networkInfo.ns_count).to.be.a('number')
            expect(networkInfo.container_count).to.be.a('number')
            expect(networkInfo.traffic).to.be.a('number')

            expect(networkInfo.user_count).to.at.least(1)
            expect(networkInfo.host_count).to.at.least(1)
            expect(networkInfo.ns_count).to.at.least(1)
            expect(networkInfo.container_count).to.at.least(1)
            expect(networkInfo.traffic).to.at.least(1)
        })
    })
})