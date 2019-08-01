require('./common')

describe('DCCN User Manager', () => {
    before(authenticateWithTestAcct)


    for (var i = 0; i < 1000; i++){
        try{
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

        }
        catch(e){
            if(e == null){
                throw e
            }
        }
        
    
    }
})