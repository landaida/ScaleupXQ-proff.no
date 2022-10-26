class App {
    constructor({url}={}) {
        this.proxy = process.env.proxy
        this.cookies = process.env.cookies
        this.url = url
    }

    async initializePage() {
        const puppeteer = require('puppeteer')
        const options = {headless: false, devtools:true, args:[]}
        // options.args.push('--disable-web-security')
        this.proxy && this.proxy.server ? options.args.push(`--proxy-server=${this.proxy.server}:${this.proxy.port}`) : null
        const browser = await puppeteer.launch(options)
        this.page = (await browser.pages())[0]
        // this.page = await browser.newPage();
        this.proxy && this.proxy.username ? await this.page.authenticate({ username:this.proxy.username, password: this.proxy.password }) : null
        this.cookies ? await this.page.setCookie(...cookies) : null
        // await this.handleRequestInterception()
    }

    async handleRequestInterception() {
        await this.page.setRequestInterception(true)
        this.page.on('request', (request)=>{
            request.continue()
        })
    }

    async randomWait({max=5000, min=300}={}) {
        await new Promise(resolve=>{setTimeout(resolve, Math.random() * (max - min) + min)})
    }

    async addJquery() {
        const jQueryIsUndefined = await this.page.evaluate(()=>typeof jQuery === 'undefined')
        if(jQueryIsUndefined){
          await this.page.waitForFunction(()=>document.querySelectorAll('head').length > 0)
          log.info('before add jquery')
          await this.page.addScriptTag({path: require.resolve('jquery')})
          log.info('after add jquery')
        }
    }

    async scrap () {
        await this.initializePage()

        await this.page.goto(this.url, {timeout:60000})

        await this.page.waitForSelector('.result')

        await this.addJquery()

        await this.randomWait({max:1000,min:10000})

        const agreeBtnExists = await this.page.evaluate(()=>$('button:contains(ENIG)').length > 0)
        log.info(`agreeBtnExists:${agreeBtnExists}`)
        agreeBtnExists ? await this.page.evaluate(()=>$('button:contains(ENIG)').trigger('click')) : null

        const companies = []
        let nextPage
        do {
            const companiesList = await this.page.evaluate(()=>{
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
                return data
            })
            companiesList && companiesList.length > 0 ? companies.push(...companiesList) : null
            nextPage = await this.page.evaluate(()=>$('.next.arrow:visible').length > 0)
            log.info(`nextPage:${nextPage}`)

            log.info(`companies length:${companies && companies.length}`)
            
            await this.randomWait()
            
            nextPage ? await this.page.click('.next.arrow') : null
            
            await this.randomWait()

        } while (nextPage);

        log.info(`companies:${JSON.stringify(companies)}`)

        try { await this.page.browser().close(); this.page = null; } catch (error) {}

        return companies
    }
}
module.exports = App