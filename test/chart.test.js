require('./common')

describe('DCCN Chart Manager', () => {
    before(authenticateWithTestAcct)
    context('chart_list', () => {
        it('should list stable charts with length > 0', async () => {
            // case 1: list stable charts
            console.log("case 1: list stable charts ")
            const chartList1 = await reqA('GET', '/chart/list')
            log.info('chartList', JSON.stringify(chartList1, null, '  '))
            expect(chartList1.charts.length).to.be.least(1)
            console.log("case 1 pass !")
            // case 1 done !

            //case 2: list user charts
            console.log("case 2: list user charts")
            const chartList2 = await reqA('GET', '/chart/list', {chart_repo: 'user'})
            log.info('chartList', JSON.stringify(chartList2, null, '  '))
            expect(chartList2.charts.length).to.be.least(0)
            console.log("case 2 pass !")
            // case 2 done !
        })
    })

    context('chart_detail', () => {
        it('should list charts details by ', async () => {
            // case 1: regular charts
            console.log("case 1: regular charts")
            const chartList1 = await reqA('GET', '/chart/list')
            expect(chartList1.charts.length).to.be.least(1)
            const chart = chartList1.charts[0]
            repo = chart.chart_repo
            name = chart.chart_name
            ver = chart.chart_latest_version
            path = '/chart/detail/' + repo + '/' + name + '/' + ver
            const chart_detail1 = await reqA('GET', path)
            expect(chart_detail1.chart_version_details.length).to.be.at.least(1)
            console.log("case 1 pass !")
            // case 1 done !

            // case 2: Zilliqa
            console.log("case 2: Zilliqa")
            path = '/chart/detail/stable/zilliqa/0.1.0'
            const chart_detail2 = await reqA('GET', path)         
            expect(chart_detail2.custom_values.length).to.be.at.least(1)
            console.log("case 2 pass !")
            // case 2 done !
        }).timeout(4000)
    })

    context('chart_download', () => {
        it('should download a chart file', async () => {
            const chartList = await reqA('GET', '/chart/list')
            expect(chartList.charts.length).to.be.least(1)
            const chart = chartList.charts[0]
            repo = chart.chart_repo
            name = chart.chart_name
            ver = chart.chart_latest_version
            path = '/chart/download/' + repo + '/' + name + '/' + ver
            const file = await reqA('GET', path)
            expect(file.chart_file.length).to.be.at.least(1)
        })
    }).timeout(4000)

    context('chart_upload', () => {
        it('should upload a chart file', async () => {
            const chartList = await reqA('GET', '/chart/list')
            expect(chartList.charts.length).to.be.least(1)
            const chart = chartList.charts[0]
            const repo = chart.chart_repo
            const name = chart.chart_name
            const ver = chart.chart_latest_version
            const download_path = '/chart/download/' + repo + '/' + name + '/' + ver
            const file = await reqA('GET', download_path)   
            
            const chart_info = require('commander')
            chart_info
                .option('--upload_name <string>', 'type in an upload chart name', 'upload_chart_test')
                .option('--upload_ver <string>', 'type in an upload chart version', '6.6.6')
            chart_info.parse(process.argv)
            
            // check inputs
            try{
                expect(chart_info.upload_name.length).to.be.at.least(1)        
            }
            catch(e){
                throw new Error("Please type in a valid chart_name (a string: at least length 1)")
            }

            try{
                expect(chart_info.upload_ver.length).to.be.at.least(1)        
            }
            catch(e){
                throw new Error("Please type in a valid chart_ver (a string: at least length 1)")
            }

            const upload_path = '/chart/upload/' + 'user' + '/' + chart_info.upload_name + '/' + chart_info.upload_ver
            await reqA('POST', upload_path,{
                chart_file: file.chart_file
            })
            const new_chartList = await reqA('GET', '/chart/list', {chart_repo: 'user'})
            var label_upload = false
            for (i = 0; i < new_chartList.charts.length; i++){
                if(new_chartList.charts[i].chart_name == chart_info.upload_name){
                    label_upload = true
                    expect(new_chartList.charts[i].chart_latest_version).to.equal(chart_info.upload_ver)
                    break
                }
            }  
            expect(label_upload).to.equal(true)
            delete_path = '/chart/delete/' + 'user' + '/' + chart_info.upload_name + '/' + chart_info.upload_ver
            await reqA('DELETE', delete_path)
        })
    })

    context('chart_delete', () => {
        it('should delete chart by chart info', async () => {
            const chartList = await reqA('GET', '/chart/list')
            expect(chartList.charts.length).to.be.least(1)
            const chart = chartList.charts[0]
            const repo = chart.chart_repo
            const name = chart.chart_name
            const ver = chart.chart_latest_version
            const download_path = '/chart/download/' + repo + '/' + name + '/' + ver
            const file = await reqA('GET', download_path)   
            const upload_name = 'delete_charts_test_01'
            const upload_ver = '9.9.9'
            const upload_path = '/chart/upload/' + 'user' + '/' + upload_name + '/' + upload_ver
            await reqA('POST', upload_path,{
                chart_file: file.chart_file
            })
            var label = false
            delete_path = '/chart/delete/' + 'user' + '/' + upload_name + '/' + upload_ver
            await reqA('DELETE', delete_path)
            const new_chartList = await reqA('GET', '/chart/list', {chart_repo: 'user'})
            for (i = 0; i < new_chartList.charts.length; i++){
                if(new_chartList.charts[i].chart_name == upload_name){
                    label = true
                    break
                }
            }  
            expect(label).to.equal(false)
        })
    })

    
    context('chart_saveas', () => {
        it('should save_as chart', async () => {
        // wait for app status changed
            function sleep(delay) {
                var start = (new Date()).getTime()
                while((new Date()).getTime() - start < delay) {
                    continue
                }
            }
            sleep(15000)

            const chartList = await reqA('GET', '/chart/list')
            expect(chartList.charts.length).to.be.least(1)
            const chart = chartList.charts[0]
            const repo = chart.chart_repo
            const name = chart.chart_name
            const ver = chart.chart_latest_version
            const download_path = '/chart/download/' + repo + '/' + name + '/' + ver
            const file = await reqA('GET', download_path) 

            const chart_info = require('commander')
            chart_info
                .option('--saveas_name <string>', 'type in a saveas chart name', 'saveas_chart_test')
                .option('--saveas_ver <string>', 'type in a saveas chart version', '8.8.8')
            chart_info.parse(process.argv)
            var label = false
            await reqA('PUT', '/chart/saveas', {
                source: {
                    chart_repo: repo,
                    chart_ver: ver,
                    chart_name: name
                },
                destination: {
                    saveas_ver: chart_info.saveas_ver,
                    saveas_name: chart_info.saveas_name
                },
                values_yaml: file.chart_file
            })
            const new_chartList = await reqA('GET', '/chart/list', {chart_repo: 'user'})
            for (i = 0; i < new_chartList.charts.length; i++){
                if(new_chartList.charts[i].chart_name == chart_info.saveas_name){
                    label = true
                    expect(new_chartList.charts[i].chart_latest_version).to.equal(chart_info.saveas_ver)
                    break
                }
            }           
            expect(label).to.equal(true)
            delete_path = '/chart/delete/' + 'user' + '/' + chart_info.saveas_name + '/' + chart_info.saveas_ver
            await reqA('DELETE', delete_path)
        }).timeout(40000)
    })
})