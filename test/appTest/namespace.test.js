require('./common')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('DCCN Namespace Manager', () => {
    before(authenticateWithTestAcct)
    context('namespace_create', () => {
        // regular inputs
        it('should create a namespace', async () => {
            // case 1: regular inputs
            console.log("case 1: regular inputs")
            const namespace_info = require('commander')
            namespace_info
                .option('--ns_create_name <string>', 'type in a create namespace name', 'ns_create_test')
                .option('--ns_create_cpu_limit <int>', 'type in a create namespace cpu limit', 1000)
                .option('--ns_create_mem_limit <int>', 'type in a create namespace mem limit', 2000)
                .option('--ns_create_storage_limit <int>', 'type in a create namespace storage limit', 50000)
            namespace_info.parse(process.argv)
            // check the input
            try{
                expect(namespace_info.ns_create_name.length).to.be.at.least(1)
            }
            catch(e){
                throw new Error("Please type in a valid namespace_name (a string: at least length 1)")
            }

            try{
                expect(namespace_info.ns_create_cpu_limit).to.be.at.least(100)
            }
            catch(e){
                throw new Error("Please type in a valid namespace_cpu_limit (an integer: at least 100)")
            }

            try{
                expect(namespace_info.ns_create_mem_limit).to.be.at.least(256)
            }
            catch(e){
                throw new Error("Please type in a valid namespace_mem_limit (an integer: at least 256)")
            }

            try{
                expect(namespace_info.ns_create_storage_limit).to.be.at.least(2)
            }
            catch(e){
                throw new Error("Please type in a valid namespace_storage_limit (an integer: at least 2)")
            }

            const namespace = await reqA('POST', '/namespace/create', {
                ns_name: namespace_info.ns_create_name,
                ns_cpu_limit: namespace_info.ns_create_cpu_limit,
                ns_mem_limit: namespace_info.ns_create_mem_limit,
                ns_storage_limit: namespace_info.ns_create_storage_limit
            })
            expect(namespace.ns_id.length).to.be.at.least(1)
            await sleep(8000)
            
            // delete the namespace created
            path = '/namespace/delete/' + namespace.ns_id
            await reqA('DELETE', path)
            console.log("case 1 pass !")
            // case 1 done !

            // case 2: zero inputs
            console.log("case 2: zero inputs")
            var flag = 0
            try{
                await reqA('POST', '/namespace/create', {
                ns_name: 'ns_create_test_zero_input',
                ns_cpu_limit: 0,
                ns_mem_limit: 0,
                ns_storage_limit: 0
                })
            }
            catch(e) {
                flag = 1              
            }
            if (flag == 0) {
                throw new Error("should not create a namespace with zero inputs")
            }
            console.log("case 2 pass !")
            // case 2 done !
        }).timeout(200000)
    })

    context('list_namespaces', () => {
        it('should list namespaces', async () => {
            const nsList = await reqA('GET', '/namespace/list')
            log.info('nsList', JSON.stringify(nsList, null, '  '))
            expect(nsList.ns_reports.length).to.be.at.least(0)
        }).timeout(200000)
    })

    context('get_namespace_list', () => {
        it('should get an namespace list', async () => {
            const namespaceList = await reqA('GET', '/namespace/list')
            expect(namespaceList.ns_reports.length).to.be.at.least(1)
        }).timeout(200000)
    })
    
    context('namespace_update', () => {
        it('should update a namespace', async () => {
            // create a new namespace for update
            const namespace = await reqA('POST', '/namespace/create', {
                ns_name: 'ns_update_test',
                ns_cpu_limit: 1000,
                ns_mem_limit: 2000,
                ns_storage_limit: 50000
            })

            // wait for namespace status changed
            await sleep(15000)            
            
            // update a namespace info
            const namespace_info = require('commander')
            namespace_info
                .option('--ns_update_cpu_limit <int>', 'type in an update namespace cpu limit', 2000)
                .option('--ns_update_mem_limit <int>', 'type in an update namespace mem limit', 4000)
                .option('--ns_update_storage_limit <int>', 'type in an update namespace storage limit', 100000)
            namespace_info.parse(process.argv)
            
            // check the input
            try{
                expect(namespace_info.ns_update_cpu_limit).to.be.at.least(100)
            }
            catch(e){
                throw new Error("Please type in a valid namespace_cpu_limit (an integer: at least 100)")
            }

            try{
                expect(namespace_info.ns_update_mem_limit).to.be.at.least(256)
            }
            catch(e){
                throw new Error("Please type in a valid namespace_mem_limit (an integer: at least 256)")
            }

            try{
                expect(namespace_info.ns_update_storage_limit).to.be.at.least(2)
            }
            catch(e){
                throw new Error("Please type in a valid namespace_storage_limit (an integer: at least 2)")
            }

            await reqA('POST', '/namespace/update', {
                    ns_id: namespace.ns_id,
                    ns_cpu_limit: namespace_info.ns_update_cpu_limit,
                    ns_mem_limit: namespace_info.ns_update_mem_limit,
                    ns_storage_limit: namespace_info.ns_update_storage_limit
            })
            
            // wait for namespace status changed
            await sleep(12000)

            // check the update results
            var label_updated = false
            const new_nsList = await reqA('GET', '/namespace/list')
            for (i = 0; i < new_nsList.ns_reports.length; i++){
                if(new_nsList.ns_reports[i].namespace.ns_id == namespace.ns_id){
                    label_updated = true
                    expect(new_nsList.ns_reports[i].namespace.ns_cpu_limit).to.equal(namespace_info.ns_update_cpu_limit)
                    expect(new_nsList.ns_reports[i].namespace.ns_mem_limit).to.equal(namespace_info.ns_update_mem_limit)
                    expect(new_nsList.ns_reports[i].namespace.ns_storage_limit).to.equal(namespace_info.ns_update_storage_limit)
                    break
                }
            }  
            expect(label_updated).to.equal(true)

            // wait for namespace status changed
            await sleep(10000)

            // delete the namespace created
            path = '/namespace/delete/' + namespace.ns_id
            await reqA('DELETE', path)
        }).timeout(200000)
    })

    context('delete_namespace', () => {
        it('should delete a namespace by ns_id', async () => {
            // create a new namespace for delete
            const namespace = await reqA('POST', '/namespace/create', {
                ns_name: 'ns_delete_test',
                ns_cpu_limit: 1000,
                ns_mem_limit: 2000,
                ns_storage_limit: 50000
            })

            // wait for namespace status changed
            await sleep(10000)

            // delete the namespace
            path = '/namespace/delete/' + namespace.ns_id
            await reqA('DELETE', path)

            // wait for namespace status changed
            await sleep(10000)            

            // check delete results
            const delete_nsList = await reqA('GET', '/namespace/list')
            for (i = 0; i < delete_nsList.ns_reports.length; i++){
                if(delete_nsList.ns_reports[i].namespace.ns_id == namespace.ns_id){
                    expect(delete_nsList.ns_reports[i].ns_status).to.oneOf(['NS_CANCELING', 'NS_CANCELED'])
                    break
                }
            } 
        }).timeout(200000)
    })
})