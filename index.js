// import puppeteer from "puppeteer";

// const url = "https://www.openingsuren.vlaanderen/zoek/retail-today/9000-gent";

// const main = async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     await page.goto(url);
//     await page.screenshot({ path: 'screenshot.png' });
//     await browser.close();   

//     const allBusinesses = await page.evaluate(( ) => {
//         const articles = document.querySelectorAll('')
//     });



// }
// console.log("script executed");
// main();
import puppeteer from "puppeteer";

const url = "https://www.openingsuren.vlaanderen/zoek/retail-today/9000-gent";

const main = async () => {
    const browser = await puppeteer.launch({ headless: true }); // Zet headless op false als je de browser wilt zien
    const page = await browser.newPage();
    
    // Ga naar de pagina
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    // Scrape de bedrijfsinformatie
    const allBusinesses = await page.evaluate(() => {
        const businesses = [];
        
        // Selecteer alle bedrijven
        const companyElements = document.querySelectorAll('.list-row .company-list');

        // Loop door elk bedrijf en verzamel de gewenste info
        companyElements.forEach(company => {
            const name = company.querySelector('h3 a') ? company.querySelector('h3 a').innerText : null;

            // Selecteer het adres
            const addressElement = company.querySelector('.company-list-info.left .company-list-detail');
            const address = addressElement 
                ? addressElement.innerText.replace(/\n/g, ', ').trim() // Verwijder line breaks in het adres
                : null;

           // Zoek naar telefoonnummer (tweede .company-list-detail binnen .company-list-info.left)
           const phoneElement = company.querySelectorAll('.company-list-info.left .company-list-detail')[1];
           const phone = phoneElement ? phoneElement.innerText.trim() : null;

            businesses.push({ name, address, phone: phone || null });
        });

        return businesses;
    });

    console.log(allBusinesses);

    await browser.close();
};

console.log("Script is gestart!");
await main();
