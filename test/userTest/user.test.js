var user = require('./common')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

testEmail = 'GatewayTest@mailinator.com'
testPassword = 'Ankr@2019'
testChangePassword = 'Ankr@2018'

describe('DCCN User Manager', () => {
    context('change_password',() => {
        it('should send a change password request', async () => {
            // login
            await user.authenticateWithTestAcct(testEmail, testPassword)
            // change password
            await reqA('POST', '/change_password',{
                old_password: testPassword,
                new_password: testChangePassword
            })
            await sleep(5000)
            
            // check
            const loginfo = await req('POST', '/login',{
                email: testEmail,
                password: testChangePassword,
            })
            console.log('password changed successfully !')
            // roll back
            auth = 'Bearer ' + loginfo.authentication_result.access_token
            await req('POST', '/change_password',{
                old_password: testChangePassword,
                new_password: testPassword
            }, {Authorization: auth})
            console.log('roll back !')
            await sleep(55000)
        }).timeout(200000)
    })

    context('login',() => {
        it('should send a login request', async () => {
            sleep(60000)
            const loginfo = await req('POST', '/login',{
                email: testEmail,
                password: testPassword,
            })
            expect(loginfo.authentication_result.access_token.length).to.be.at.least(1)
        }).timeout(200000)
    })

    context('logout',() => {
        it('should send a logout request', async () => {
            // login at first
            const loginfo = await req('POST', '/login',{
                email: testEmail,
                password: testPassword,
            })
            auth = 'Bearer ' + loginfo.authentication_result.access_token

            // test logout
            const logoutinfo = await req('POST', '/logout',{
                refresh_token: loginfo.authentication_result.refresh_token
            }, {Authorization: auth})
            expect(logoutinfo).to.be.empty
        }).timeout(200000)
    })

    context('refresh_token',() => {
        it('should send a refresh_token request', async () => {
            // get refresh token 
            const loginfo = await req('POST', '/login',{
                email: testEmail,
                password: testPassword,
            })

            auth = 'Bearer ' + loginfo.authentication_result.access_token
            
            //refreshtoken
            const refresh_rsp = await req('POST', '/refresh',{
                refresh_token: loginfo.authentication_result.refresh_token,
            }, {Authorization: auth})
            expect(refresh_rsp.refresh_token.length).to.be.at.least(1)
        }).timeout(200000)
    })

    context('update_attribute',() => {
        it('should send an update attribute request', async () => {
            
            // need a break
            await sleep(60000)
            
            // login at first
            const loginfo = await req('POST', '/login',{
                email: testEmail,
                password: testPassword,
            })
            default_name = loginfo.user.attributes.name
            default_pubkey = loginfo.user.attributes.pubkey

            auth = 'Bearer ' + loginfo.authentication_result.access_token

            // case 1: update user nick name
            name_u = 'test_attribute'
            await req('POST', '/update_attribute', 
                {   user_attributes: [{
                    key: 'Name',
                    value: name_u}]
                }, {Authorization: auth})
            // case 2: update pub_key
            pubkey_u = '2019'
            await req('POST', '/update_attribute', 
                {   user_attributes: [{
                    key: 'PubKey',
                    value: pubkey_u}]
                }, {Authorization: auth})

            // check results, login to retrieve infos
            const loginfo_check = await reqA('POST', '/login',{
                email: testEmail,
                password: testPassword,
            })
            // check
            expect(loginfo_check.user.attributes.name).to.eql(name_u)
            expect(loginfo_check.user.attributes.pub_key).to.eql(pubkey_u)

            console.log('update successfully !')
            auth_new = 'Bearer ' + loginfo_check.authentication_result.access_token

            // need a break
            await sleep(60000)

            // roll back
            await req('POST', '/update_attribute', 
                {   user_attributes: [{
                    key: 'Name',
                    value: default_name}]
                }, {Authorization: auth_new})
            await req('POST', '/update_attribute', 
                {   user_attributes: [{
                    key: 'PubKey',
                    value: default_pubkey}]
                }, {Authorization: auth_new})
        }).timeout(200000)
    })

    context('create_address',() => {
        it('should send a create address request', async () => {
            // login at first
            const loginfo = await req('POST', '/login',{
                email: testEmail,
                password: testPassword,
            })
            auth = 'Bearer ' + loginfo.authentication_result.access_token

            // create address test
            const createadd = await req('POST', '/create_address',{
                type: "ERC20" ,
                propose: "MAINNET"
            }, {Authorization: auth})
            expect(createadd.typeaddress.length).to.be.at.least(1)
        }).timeout(200000)
    })
})