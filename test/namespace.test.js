require('./common')

describe('DCCN Namespace Manager', () => {
    before(authenticateWithTestAcct)

    context('namespace_create', () => {
        // regular inputs
        it('should create a namespace', async () => {
            const namespace_info = require('commander')
            namespace_info
                .option('--ns_create_name <string>', 'type in a create namespace name', 'ns_create_test')
                .option('--ns_create_cpu_limit <int>', 'type in a create namespace cpu limit', 1000)
                .option('--ns_create_mem_limit <int>', 'type in a create namespace mem limit', 2048)
                .option('--ns_create_storage_limit <int>', 'type in a create namespace storage limit', 8)
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
            
            // wait for namespace status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)
            
            // delete the namespace created
            path = '/namespace/delete/' + namespace.ns_id
            await reqA('DELETE', path)
        }).timeout(20000)

        // zero inputs
        it('cannot create a namespace with zero inputs, should throw an error', async () => {
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
        })
    })

    context('list_namespaces', () => {
        it('should list namespaces', async () => {
            const nsList = await reqA('GET', '/namespace/list')
            log.info('nsList', JSON.stringify(nsList, null, '  '))
            expect(nsList.ns_reports.length).to.be.at.least(0)
        })
    })

    context('get_namespace_list', () => {
        it('should get an namespace list', async () => {
            const namespaceList = await reqA('GET', '/namespace/list')
            expect(namespaceList.ns_reports.length).to.be.at.least(1)
        })
    })
    
    context('namespace_update', () => {
        it('should update a namespace', async () => {
            // create a new namespace for update
            const namespace = await reqA('POST', '/namespace/create', {
                ns_name: 'ns_update_test',
                ns_cpu_limit: 1000,
                ns_mem_limit: 2048,
                ns_storage_limit: 8
            })

            // wait for namespace status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)            
            
            // update a namespace info
            const namespace_info = require('commander')
            namespace_info
                .option('--ns_update_cpu_limit <int>', 'type in an update namespace cpu limit', 100)
                .option('--ns_update_mem_limit <int>', 'type in an update namespace mem limit', 256)
                .option('--ns_update_storage_limit <int>', 'type in an update namespace storage limit', 2)
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
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)

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
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)

            // delete the namespace created
            path = '/namespace/delete/' + namespace.ns_id
            await reqA('DELETE', path)
        }).timeout(30000)
    })

    context('delete_namespace', () => {
        it('should delete a namespace by ns_id', async () => {
            // create a new namespace for delete
            const namespace = await reqA('POST', '/namespace/create', {
                ns_name: 'ns_delete_test',
                ns_cpu_limit: 1000,
                ns_mem_limit: 2048,
                ns_storage_limit: 8
            })

            // wait for namespace status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)

            // delete the namespace
            path = '/namespace/delete/' + namespace.ns_id
            await reqA('DELETE', path)

            // wait for namespace status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(8000)            

            // check delete results
            const delete_nsList = await reqA('GET', '/namespace/list')
            for (i = 0; i < delete_nsList.ns_reports.length; i++){
                if(delete_nsList.ns_reports[i].namespace.ns_id == namespace.ns_id){
                    expect(delete_nsList.ns_reports[i].ns_status).to.equal('NS_CANCELED')
                    break
                }
            } 
        }).timeout(30000)
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