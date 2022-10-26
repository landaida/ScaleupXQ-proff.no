(async()=>{
    const data = $('.result .listing')
        .map((i, item)=>{
            let company = {}
            company.Company=$(item).find('h3 a').text()
            company['Org-nr']=$(item).find('.org-number').text().replace(/[^\d]/g, '')
            company['Revenue']=$(item).find('.sorted').text().split(':').at(1).replace(/[^\d]/g, '')
            company['Nr_of_employees']=$(item).find('.additional-info li:eq(1)').text().split(':').at(1).replace(/[^\d]/g, '')

            const names = $(item).find('.additional-info li:last').text().replace(/([\s\S]+?: )(.*?)( \([\s\S]+)/g, '$2').split(' ')
            company.first_name = names.at(0)
            names.length > 2 ? company.middle_name = names.at(1) : null
            company.last_name = names.at(-1)
            
            return company
    }).get()
    console.log(`data length:${data && data.length}`)
    do {
        const company = data.pop()
        console.log(company)
        console.log(`company:${JSON.stringify(company)}`)
    } while (data.length > 0)
})()