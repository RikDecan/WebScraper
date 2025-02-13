import puppeteer from "puppeteer";
import fs from 'fs';

// Read categories from JSON file
const categories = JSON.parse(fs.readFileSync('categories.json', 'utf8'));

// Configuration
const PARALLEL_CATEGORIES = 5;  // Number of categories to process in parallel
const PARALLEL_PAGES = 3;       // Number of pages per category to process in parallel
const DELAY_BETWEEN_REQUESTS = 3000; // 2 seconds

async function checkForIPBlock(page) {
    try {
        // Check if page contains typical block messages
        const blocked = await page.evaluate(() => {
            const pageText = document.body.innerText.toLowerCase();
            return pageText.includes('blocked') || 
                   pageText.includes('access denied') ||
                   pageText.includes('too many requests') ||
                   pageText.includes('ip address has been blocked');
        });

        // Also check for HTTP status
        const response = await page.evaluate(() => {
            return {
                status: window.performance.getEntriesByType('navigation')[0].responseStatus,
                redirected: window.performance.getEntriesByType('navigation')[0].redirectCount > 0
            };
        });

        return blocked || response.status === 403 || response.status === 429;
    } catch (error) {
        console.error('Error checking for IP block:', error);
        return false;
    }
}
async function checkPages(category) {
    let low = 1, high = 1000;
    
    while (low < high) {
        let mid = Math.floor((low + high + 1) / 2);
        let response = await fetch(`https://www.openingsuren.vlaanderen/${category}/p${mid}`);
        
        if (response.redirected) {
            high = mid - 1;
        } else {
            low = mid;
        }
    }
    
    return low;
}

async function scrapeCategory(browser, category, pageNum) {
    const page = await browser.newPage();
    try {
        const url = pageNum === 1 
            ? `https://www.openingsuren.vlaanderen/${category}`
            : `https://www.openingsuren.vlaanderen/${category}/p${pageNum}`;
        
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
        
        // Check HTTP status
        if (response.status() === 403 || response.status() === 429) {
            throw new Error('IP BLOCKED');
        }

        // Check for IP block
        const isBlocked = await checkForIPBlock(page);
        if (isBlocked) {
            throw new Error('IP BLOCKED');
        }

        const businesses = await page.evaluate((currentCategory) => {
            const results = [];
            const companyElements = document.querySelectorAll('.list-row .company-list');
            
            if (companyElements.length === 0) {
                // If no elements found, might indicate a block
                throw new Error('No data found - possible IP block');
            }
            
            companyElements.forEach(company => {
                const name = company.querySelector('h3 a')?.innerText || null;
                const addressElement = company.querySelector('.company-list-info.left .company-list-detail');
                const address = addressElement 
                    ? addressElement.innerText.replace(/\n/g, ', ').trim() 
                    : null;
                const phoneElement = company.querySelectorAll('.company-list-info.left .company-list-detail')[1];
                const phone = phoneElement?.innerText.trim() || null;
                
                results.push({ name, address, phone, category: currentCategory });
            });
            
            return results;
        }, category);

        if (!businesses || businesses.length === 0) {
            throw new Error('No data retrieved - possible IP block');
        }
        
        return businesses;
    } catch (error) {
        if (error.message.includes('IP BLOCKED') || 
            error.message.includes('possible IP block')) {
            console.error('\n⚠️ IP BLOCK DETECTED! ⚠️');
            console.error('The script will now save current progress and exit.');
            console.error('Please wait several hours before trying again.\n');
            
            // Save any remaining data
            await saveBusinesses([]);
            
            // Exit the process
            process.exit(1);
        }
        console.error(`Error scraping ${category} page ${pageNum}:`, error);
        return [];
    } finally {
        await page.close();
    }
}

async function saveBusinesses(businesses) {
    // Read existing data if file exists
    let existingBusinesses = [];
    if (fs.existsSync('all_businesses.csv')) {
        const content = fs.readFileSync('all_businesses.csv', 'utf8');
        const lines = content.split('\n').slice(1); // Skip header
        existingBusinesses = lines.filter(line => line.trim()).map(line => {
            const [name, address, phone, category] = line.split(';');
            return { name, address, phone, category };
        });
    }

    // Combine existing and new businesses
    const allBusinesses = [...existingBusinesses, ...businesses];
    
    const csvHeader = 'Name;Address;Phone;Category\n';
    const csvRows = allBusinesses.map(business => {
        return `${business.name};${business.address};${business.phone || 'null'};${business.category}`;
    }).join('\n');
    
    fs.writeFileSync('all_businesses.csv', csvHeader + csvRows);
}

async function processCategory(browser, category) {
    console.log(`Starting category: ${category}`);
    const totalPages = await checkPages(category);
    console.log(`Found ${totalPages} pages for ${category}`);
    
    // Process pages in chunks
    for (let i = 1; i <= totalPages; i += PARALLEL_PAGES) {
        const pagePromises = [];
        for (let j = 0; j < PARALLEL_PAGES && i + j <= totalPages; j++) {
            const pageNum = i + j;
            pagePromises.push(scrapeCategory(browser, category, pageNum));
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }
        
        const results = await Promise.all(pagePromises);
        const businesses = results.flat();
        await saveBusinesses(businesses);
        
        console.log(`${category}: Processed pages ${i} to ${Math.min(i + PARALLEL_PAGES - 1, totalPages)} of ${totalPages}`);
    }
}

async function main() {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        // Process categories in chunks
        for (let i = 0; i < categories.length; i += PARALLEL_CATEGORIES) {
            const categoryPromises = categories
                .slice(i, i + PARALLEL_CATEGORIES)
                .map(category => processCategory(browser, category));
            
            await Promise.all(categoryPromises);
            console.log(`Completed categories ${i + 1} to ${Math.min(i + PARALLEL_CATEGORIES, categories.length)} of ${categories.length}`);
        }
        
        console.log('Scraping completed! All data saved to all_businesses.csv');
        
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await browser.close();
    }
}

console.log("Starting parallel scraping process...");
main().catch(console.error);