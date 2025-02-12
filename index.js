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
import fs from 'fs'; 

const url = "https://www.openingsuren.vlaanderen/zoek/retail-today/9000-gent";

const main = async () => {
    const browser = await puppeteer.launch({ headless: true }); 
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    const allBusinesses = await page.evaluate(() => {
        const businesses = [];
        
        const companyElements = document.querySelectorAll('.list-row .company-list');

        companyElements.forEach(company => {
            const name = company.querySelector('h3 a') ? company.querySelector('h3 a').innerText : null;

            const addressElement = company.querySelector('.company-list-info.left .company-list-detail');
            const address = addressElement 
                ? addressElement.innerText.replace(/\n/g, ', ').trim() 
                : null;

            const phoneElement = company.querySelectorAll('.company-list-info.left .company-list-detail')[1];
            const phone = phoneElement ? phoneElement.innerText.trim() : null;

            businesses.push({ name, address, phone: phone || null });
        });

        return businesses;
    });

    const csvHeader = 'Name; Address; Phone\n';
    const csvRows = allBusinesses.map(business => {
        return `${business.name}; ${business.address}; ${business.phone ? business.phone : 'null'}`;
    }).join('\n');

    const csvData = csvHeader + csvRows;

    fs.writeFileSync('businesses.csv', csvData);

    console.log('CSV bestand is aangemaakt!');

    await browser.close();
};

const checkPages = async () => {
    let low = 1, high = 1000;

    while (low < high) {
        let mid = Math.floor((low + high + 1) / 2);
        let response = await fetch(`https://www.openingsuren.vlaanderen/kledingwinkels/p${mid}`);
        
        if (response.redirected) {
            high = mid - 1; // Page doesn't exist, move left
        } else {
            low = mid; // Page exists, move right
        }
    }

    console.log(`Total number of pages: ${low}`);
};

console.log("script executed");
await main();



checkPages();
