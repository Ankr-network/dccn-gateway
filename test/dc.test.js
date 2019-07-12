/*require('./common')

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

        context('reset_cluster', () => {
            it('should return the detail of new cluster', async () => {
                const cluster = await reqA('POST', '/dc/register' , {
                    cluster_name: 'test_name_register'}
                  )
                log.info('my cluster after reset', JSON.stringify(cluster, null, '  '))
                expect(cluster.cluster_id).to.be.a('string')
                expect(cluster.cluster_name).to.be.a('string')
                expect(cluster.configmap).to.be.a('string')
            })
        })
    
    context('my_cluster', () => {
        it('should return the detail of my cluster', async () => {
            const cluster = await reqA('GET', '/dc/mydc')
            log.info('my cluster', JSON.stringify(cluster, null, '  '))
            expect(cluster.dc_id).to.be.a('string')
            expect(cluster.dc_name).to.be.a('string')
            expect(cluster.dc_status).to.be.a('string')
        })
    })

    context('reset_cluster', () => {
        it('should return the detail of new cluster', async () => {
            const cluster = await reqA('POST', '/dc/reset', {
                cluster_name: 'reset_test_name'
            })
            log.info('my cluster after reset', JSON.stringify(cluster, null, '  '))
            expect(cluster.cluster_id).to.be.a('string')
            expect(cluster.cluster_name).to.be.a('string')
            expect(cluster.configmap).to.be.a('string')
        })
    })
    
    context('dashboard', () => {
        it('should return the information of cluster dashboard', async () => {
            const dashboard = await reqA('GET', '/dc/dashboard')
            log.info('dashboard', JSON.stringify(dashboard, null, '  '))
            expect(dashboard.total_income).to.be.a('number')
            expect(dashboard.current_usage.cpu_total).to.be.a('number')
            expect(dashboard.current_usage.memory_total).to.be.a('number')
            expect(dashboard.current_usage.storage_total).to.be.a('number')
            expect(dashboard.week[0].income).to.be.a('number')
            expect(dashboard.week[0].date).to.be.a('string')
            expect(dashboard.week[0].usage.cpu_total).to.be.a('number')
            expect(dashboard.month[0].usage.memory_total).to.be.a('number')
        })
    })
})*/
