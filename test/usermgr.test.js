require('./common')

describe('DCCN User Manager', () => {
    before(authenticateWithTestAcct)


    context('login',() => {
        it('should send a login request', async () => {
            const loginfo = await reqA('POST', '/login',{
                email: 'liyifan9308@gmail.com',
                password: 'ankr1234'
            })
            log.info('login', JSON.stringify(loginfo, null, ' '))
            console.log(loginfo.user.attributes.value)
            expect(loginfo.authentication_result.access_token.length).to.be.at.least(0)
        })
    })

    context('logout',() => {
        it('should send a logout request', async () => {
            const loginfo = await reqA('POST', '/login',{
                email: 'liyifan9308@gmail.com',
                password: 'ankr1234'
            })
            const logoutinfo = await reqA('POST', '/logout',{
                refresh_token: loginfo.authentication_result.refresh_token
            })
            log.info('logout', JSON.stringify(logoutinfo, null, ' '))
            console.log(logoutinfo)
            expect(logoutinfo).to.be.empty
        })
    })

    context('refresh',() => {
        it('should send a refresh request', async () => {
            const loginfo = await reqA('POST', '/login',{
                email: 'liyifan9308@gmail.com',
                password: 'ankr1234',
            })
            //refreshtoken0: loginfo.authentication_result.refresh_token
            const refreshtoken = await reqA('POST', '/refresh',{
                refresh_token: loginfo.authentication_result.refresh_token,
            })
            const trylogout = await reqA('POST', '/logout',{
                refresh_token: loginfo.authentication_result.refresh_token
            })
            log.info('refresh', JSON.stringify(refreshtoken, null, ' '))
            expect(loginfo.authentication_result.refresh_token.length).to.be.at.least(0)
            //expect(refreshtoken).to.not.equal(refreshtoken0)
        })
    }) 

    context('change_password',() => {
        it('should send a change password request', async () => {
            const loginfo = await reqA('POST', '/login',{
                email: 'liyifan9308@gmail.com',
                password: 'ankr1234'
            })
            const changepass = await reqA('POST', '/change_password',{
                old_password: 'test12345' ,
                new_password: 'test12345678'
            })
            //const loginfo2 = await reqA('POST', '/login',{
            //    email: 'liyifan9308@gmail.com',
            //    password: 'ankr12345678'
            //})
            const changepass2 = await reqA('POST', '/change_password',{
                old_password: 'test12345678' ,
                new_password: 'test12345'
            })
            log.info('changepass', JSON.stringify(changepass, null, ' '))
        })
    })

    context('update_attribute',() => {
        it('should send an update attribute request', async () => {
            const loginfo = await reqA('POST', '/login',{
                email: 'liyifan9308@gmail.com',
                password: 'ankr1234'
            })
            //console.log(loginfo.user.attributes.extra_fields)
            const updateatt = await reqA('POST', '/update_attribute', 
                {   user_attributes: [{
                    key: 'Name',
                    value: 'ceceee'}]
                }
            )
            name0 = loginfo.user.attributes.name
            console.log(name0)
            
            const updateatt2 = await reqA('POST', '/update_attribute', 
                {   user_attributes: [{
                    key: 'PubKey',
                    value: '8'}]
                }
            )
            key0 = loginfo.user.attributes.pub_key
            console.log(key0)
            

            const updateatt3 = await reqA('POST', '/update_attribute', 
                {   user_attributes: [{
                    key: 'BepPubKey',
                    value: '1234'}]
                }
            )
            for(var i in loginfo.user.attributes.extra_field){
                if (loginfo.user.attributes.extra_field[i] == 'BepPubKey'){
                    bep0 = loginfo.user.attributes.extra_field[i].concat(getValues(obj[i], key))
                    const updateatt4 = await reqA('POST', '/update_attribute', 
                        {   user_attributes: [{
                            key: 'BepPubKey',
                            value: '5678'}]
                        }
                    )
                    for(var j in loginfo.user.attributes.extra_field){
                        if (loginfo.user.attributes.extra_field[i] == 'BepPubKey'){
                        bep1 = loginfo.user.attributes.extra_field[j].concat(getValues(obj[j], key))
                        expect(bep0).to.not.equal(bep1)
                        }
                    }
                }
            }try{
                const updateatt5 = await reqA('POST', '/update_attribute', 
                {   user_attributes: [{
                    key: 'BepToMainnetAddr',
                    value: '1234'}]
                }
            )
            }
            catch(e){
                if(e == null){
                    throw e
                }
            }
            log.info('login', JSON.stringify(updateatt, null, ' '))
            expect(loginfo.user.attributes.name).to.equal('ceceee')
            expect(key0).to.equal('8')
        })
    })

    context('create_address',() => {
        it('should send a create address request', async () => {
            const createadd = await reqA('POST', '/create_address',{
                type: "ERC20" ,
                propose: "MAINNET"
            })
            console.log(createadd)
            log.info('createadd', JSON.stringify(createadd, null, ' '))
            expect(createadd.typeaddress).to.equal('0x9162c38f6fEb4e7842ba5fe70C78e710077F294C')
        })
    })
})