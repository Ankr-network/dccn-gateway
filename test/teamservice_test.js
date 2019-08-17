require('./common')

var temp_team_id = "team-5bf63684-4d14-4702-855b-b9ef6114e317"
//var temp_team_id = "57a50ca4-5799-42c2-aab2-a532ec8d6965"

describe('team Manager', () => {
    before(authenticateWithTestAcct)

    // context('team create', () => {
    //     it('team create', async () => {
    //         const result = await reqA('POST', '/team/create', {name:"dev-test-team"})
    //         log.info('team create', JSON.stringify(result, null, '  '))
    //         expect(result.team_id).to.be.a('string')
    //         temp_team_id = result.team_id
    //     })
    //
    // })

    // context('team list', () => {

    //     it('should teamlist with length > 0', async () => {
    //         const list = await reqA('GET', '/team/list', {uid:"57a50ca4-5799-42c2-aab2-a532ec8d6965"})
    //         log.info('team List', JSON.stringify(list, null, '  '))
    //         expect(list.teams.length).to.be.at.least(1)

    //     })
    // })

    // context('team update', () => {
    
    //     it('team update', async () => {
    //         const result = await reqA('POST', '/team/update', {name:"create_new_ok2", id:temp_team_id})
    //         log.info('team create', JSON.stringify(result, null, '  '))
    //         //expect(result.team_id).to.be.a('string')
    //         //temp_team_id = result.team_id
    //     })
    
    // })

    //yousong.zhang@gmail.com 's user uid =  bf4c1748-cb33-41e3-8c96-4dbcec19dba0

    context('invite team member', () => {
    
        it('invite team member', async () => {
            const list = await reqA('POST', '/teammember/invite', {emails:["yousong.zhang@gmail.com"],role_ids:["system:admin"], team_id:temp_team_id })
            log.info('invite team member', JSON.stringify(list, null, '  '))
            //expect(list.records.length).to.be.at.least()
    
        })
    
    })


    // context('teammember delete', () => {
    //     it('teammember delete', async () => {
    //         const list = await reqA('POST', '/teammember/delete', {uid:"bf4c1748-cb33-41e3-8c96-4dbcec19dba0",team_id:temp_team_id})
    //         log.info('teammember delete', JSON.stringify(list, null, '  '))
    //         //expect(list.records.length).to.be.at.least()
    //     })
    // })

    // context('teammember update', () => {
    //     it('teammember update', async () => {
    //         const list = await reqA('POST', '/teammember/update', {uid:"bf4c1748-cb33-41e3-8c96-4dbcec19dba0", team_id:temp_team_id, role_ids:["system:developer"]})
    //         log.info('teammember update', JSON.stringify(list, null, '  '))
    //         //expect(list.records.length).to.be.at.least()
    //     })
    // })

    // context('teammember commfirm', () => {
    //     it('teammember commfirm', async () => {
    //         const list = await reqA('POST', '/teammember/confirm', { team_id:temp_team_id, code:"60d880fb"})
    //         log.info('teammember commfirm', JSON.stringify(list, null, '  '))
    //         //expect(list.records.length).to.be.at.least()
    //     })
    // })


    // context('teammember list', () => {
    //     it('teammember list', async () => {
    //         const list = await reqA('GET', '/teammember/list', {team_id: temp_team_id})
    //         log.info('teammember list', JSON.stringify(list, null, '  '))
    //         //expect(list.records.length).to.be.at.least()
    //     })
    // })
    //
    //
    //
    // context('delete team', () => {
    //
    //     it('delete team', async () => {
    //         const list = await reqA('POST', '/team/delete', {team_id: temp_team_id})
    //         log.info('team delete', JSON.stringify(list, null, '  '))
    //         //expect(list.records.length).to.be.at.least()
    //     })
    //
    // })

    //
    // context('set team', () => {
    //
    //     it('set team', async () => {
    //         const list = await reqA('POST', '/team/set', {team_id: temp_team_id})
    //         log.info('team delete', JSON.stringify(list, null, '  '))
    //         //expect(list.records.length).to.be.at.least()
    //     })
    //
    // })









})