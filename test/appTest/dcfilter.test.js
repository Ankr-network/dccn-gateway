require('./common')

describe('DCCN Data Center Manager', () => {
    before(authenticateWithTestAcct)
    context('list_data_center', () => {
        /*
        it('should list data centers with length > 0', async () => {
            const dcList = await reqA('POST', '/dc/listwithfilter', {
                dclist_filter: {
                    filtermap: {
                        'dcinstancetype':'ReservedInstance',
                        'countrycode' : '',
                        'latitude' : '',
                        'longitude' : ''
                    }
                }
            })
            console.log('dcList ReservedInstance', JSON.stringify(dcList, null, '  '))
            expect(dcList.dcList.length).to.be.at.least(1)
        });

        it('should list data centers with length > 0', async () => {
            const dcList = await reqA('POST', '/dc/listwithfilter', {
                dclist_filter: {
                    filtermap: {
                        'dcinstancetype':'SpotInstance',
                        'countrycode' : 'US',
                        'latitude' : '37.774930',
                        'longitude' : '-122.419416'
                    }
                }
            })
            console.log('dcList SpotInstance', JSON.stringify(dcList, null, '  '))
            expect(dcList.dcList.length).to.be.at.least(1)
        });
         */

        //"OndemandInstance", "US", "36.7" , "-120.419416", "US"
        //"SpotInstance","US", "" , "", "US"
        //"AllInstance", "US", "36.7" , "-120.419416", "IN"
        //"","US", "36.7" , "-120.419416", "US"
        it('should list data centers with length > 0', async () => {
            const dcList = await reqA('POST', '/dc/listwithfilter', {
                dclist_filter: {
                    filtermap: {
                        'dcinstancetype':'',
                        'countrycode' : '',
                        'latitude' : '36.7',
                        'longitude' : '-120.419416',
                        'filtercountrycode' : ''
                    }
                }
            })
            console.log('OndemandInstance dcList', JSON.stringify(dcList, null, '  '))
            //expect(dcList.dcList.length).to.be.at.least(1)
        })
    })
})