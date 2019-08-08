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
    context('my_data_center', () => {
        it('should return the detail of my data center', async () => {
            const cluster = await reqA('GET', '/dc/mydc')
            log.info('my cluster', JSON.stringify(cluster, null, '  '))
            expect(cluster.dc_id).to.be.a('string')
            expect(cluster.dc_name).to.be.a('string')
            expect(cluster.dc_status).to.be.a('string')
        })
    })
    context('dashboard', () => {
        it('should return the information of cluster dashboard', async () => {
            const dashboard = await reqA('GET', '/dc/dashboard')
            log.info('dashboard', JSON.stringify(dashboard, null, '  '))
            expect(dashboard.total_income).to.be.a('number')
            expect(dashboard.current_usage.cpu_total).to.be.a('number')
            expect(dashboard.current_usage.memory_total).to.be.a('number')
            expect(dashboard.week.length).to.be.at.least(0)
            expect(dashboard.month.length).to.be.at.least(0)
            expect(dashboard.year.length).to.be.at.least(0)
        })
    })
    context('user_history_fees_list', () => {
        it('should list the user history fees', async () => {
            const history_fees = await reqA('GET', '/fees/history_list')
            log.info('user history fees', JSON.stringify(history_fees, null, '  '))
            expect(history_fees.records.length).to.be.at.least(0)
        })
    })
    context('month_fees_detail', () => {
        it('should return the detail of month fees', async () => {
            const month_fees = await reqA('GET', '/fees/month_detail')
            log.info('month fees', JSON.stringify(month_fees, null, '  '))
            expect(month_fees.account).to.be.a('string')
            expect(month_fees.attn).to.be.a('string')
            expect(month_fees.invoice_number).to.be.a('string')
            expect(month_fees.total).to.be.a('number')
            expect(month_fees.issue_date).to.be.a('string')
            expect(month_fees.start).to.be.a('string')
            expect(month_fees.end).to.be.a('string')
            expect(month_fees.charges).to.be.a('number')
            expect(month_fees.credits).to.be.a('number')
            expect(month_fees.tax).to.be.a('number')
            expect(month_fees.ns_fees.length).to.be.at.least(0)
        })
    })
    context('invoice_detail', () => {
        it('should return the detail of invoice', async () => {
            const invoice = await reqA('GET', '/fees/invoice_detail')
            log.info('month fees', JSON.stringify(invoice, null, '  '))
            expect(invoice.account).to.be.a('string')
            expect(invoice.attn).to.be.a('string')
            expect(invoice.invoice_number).to.be.a('string')
            expect(invoice.total).to.be.a('number')
            expect(invoice.issue_date).to.be.a('string')
            expect(invoice.start).to.be.a('string')
            expect(invoice.end).to.be.a('string')
            expect(invoice.charges).to.be.a('number')
            expect(invoice.credits).to.be.a('number')
            expect(invoice.tax).to.be.a('number')
            expect(invoice.ns_fees.length).to.be.at.least(0)
        })
    })
    context('reset_data_center', () => {
        it('should reset the cluster name, client key, etc. of a cluster', async () => {
            const reset_cluster = require('commander')
            reset_cluster
                .option('--reset_cluster_name <string>', 'type in an reset cluster name', 'reset_cluster_test')
            reset_cluster.parse(process.argv)
            // check the input
            try{
                expect(reset_cluster.reset_cluster_name.length).to.be.at.least(0)
            }
            catch(e){
                throw new Error("Please type in a valid cluster name (a string: at least length 0)")
            }
            
            const cluster = await reqA('POST', '/dc/reset' , {
                cluster_name: reset_cluster.reset_cluster_name}
                )
            log.info('my cluster after reset', JSON.stringify(cluster, null, '  '))
            expect(cluster.cluster_id).to.be.a('string')
            expect(cluster.cluster_name).to.be.a('string')
            expect(cluster.configmap).to.be.a('string')
            expect(cluster.client_key).to.be.a('string')
            expect(cluster.client_csr_cert).to.be.a('string')
            if(reset_cluster.reset_cluster_name == ''){
                expect(cluster.cluster_name).to.be.equal('unknow')
            }else{
                expect(cluster.cluster_name).to.be.equal(reset_cluster.reset_cluster_name)
            }
        })
    })
    /* a registration needs the authorization and an account can just register once 
    context('register_data_center', () => {
        it('should register a new cluster', async () => {
            const register_cluster = require('commander')
            register_cluster
                .option('--register_cluster_name <string>', 'type in an register cluster name', 'register_cluster_test')
            register_cluster.parse(process.argv)
            // check the input
            try{
                expect(register_cluster.register_cluster_name.length).to.be.at.least(0)
            }
            catch(e){
                throw new Error("Please type in a valid cluster name (a string: at least length 0)")
            }
            const cluster = await reqA('POST', '/dc/register' , {
                cluster_name: register_cluster.register_cluster_name}
                )
            expect(cluster.cluster_id).to.be.a('string')
            expect(cluster.cluster_name).to.be.a('string')
            expect(cluster.configmap).to.be.a('string')
            expect(cluster.client_key).to.be.a('string')
            expect(cluster.client_csr_cert).to.be.a('string')
            if(reset_cluster.reset_cluster_name == ''){
                expect(cluster.cluster_name).to.be.equal('unknow')
            }else{
                expect(cluster.cluster_name).to.be.equal(register_cluster.register_cluster_name)
            }
        })
    })
})*/