import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // User-Agents lijst om variatie in requests te brengen
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
  ];

  const testUrls = [
    "https://www.openingsuren.vlaanderen/","https://www.openingsuren.vlaanderen/advocaten",
  ];

  for (let i = 0; i < testUrls.length; i++) {
    try {
      const randomUA =
        userAgents[Math.floor(Math.random() * userAgents.length)];
      await page.setUserAgent(randomUA);

      console.log(`Request naar: ${testUrls[i]} met User-Agent: ${randomUA}`);

      // Open de pagina en meet de statuscode
      const response = await page.goto(testUrls[i], {
        waitUntil: "domcontentloaded",
      });
      const status = response.status();

      console.log(`Statuscode: ${status}`);
      if (status === 429) {
        console.log(
          "Rate request limit bereikt"
        );
        break;
      }
      const waitTime = Math.floor(Math.random() * (15000 - 5000) + 5000);
      console.log(`Wachten voor ${waitTime / 1000} seconden...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    } catch (error) {
      console.log(`Fout bij het laden van ${testUrls[i]}:`, error);
    }
  }

  await browser.close();
})();
