require('./common')

describe('DCCN User Manager', () => {
    //before(authenticateWithTestAcct)
    flag = 0
    break_flag = 0
    
    context('login',() => {
        it('should send a login request', async () => {
            try{
                for (var i = 0; i < 8; i++){
                    const loginfo = await req('POST', '/login',{
                    email: 'ankrtestuser1@mailinator.com',
                    password: 'Ankr12345678'
                })        
                console.log(loginfo.user.attributes.value)
                expect(loginfo.authentication_result.access_token.length).to.be.at.least(0)
                if(break_flag = 1){
                    break
                }
            }
        }catch(e){
            flag = 1
            break_flag = 1
        }
        if(flag = 0){
            throw new Error('error for logging in too many times')  
            }
        })
    })  
})