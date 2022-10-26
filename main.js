process.env.uuid = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2)
log = require('./Log').build();

(async()=>{
    const url = `https://proff.no/laglister?rf=30000&rt=1016055511&i=p48196&i=p47371&i=p47372&i=p1523&sa`
    try {
        const App = require('./App')
        const app = new App({url})
        const companies = await app.scrap()

        const { parse } = require('json2csv');

        try {
            const csv = parse(companies);
            const fs = require('fs').promises
            // await fs.writeFile(`output ${new Date().toISOString()}.csv`, csv, 'utf8')
            await fs.writeFile(`output.csv`, csv, 'utf8')
        } catch (err) {
            log.info(err);
        }

    } catch (error) {
        log.info(error)
    }
    process.exit()
})()