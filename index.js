import puppeteer from "puppeteer";

const url = "https://www.openingsuren.vlaanderen/zoek/retail-today/9000-gent";

const main = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);
    await page.screenshot({ path: 'screenshot.png' });
    await browser.close();   

    // const allBusinesses = await page.evaluate(( ) => {
    // });



}
console.log("script executed");
main();

