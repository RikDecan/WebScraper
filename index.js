import puppeteer from "puppeteer";
import fs from 'fs';

const categories = JSON.parse(fs.readFileSync('categories.json', 'utf8'));

// Configuration


//  "Supermarkten"


const PARALLEL_CATEGORIES = 3;  //  5 
const PARALLEL_PAGES = 3;   
const DELAY_BETWEEN_REQUESTS = 800; // 2000
const waalsePostcodes = [
    1300, 1301, 1310, 1315, 1320, 1321, 1322, 1325, 1330, 1331, 1332, 1333, 1336, 1340, 1341, 1342, 1343, 1344, 
    1345, 1350, 1357, 1360, 1367, 1370, 1380, 1390, 1391, 1400, 1401, 1402, 1404, 1410, 1420, 1421, 1428, 1430, 
    1435, 1440, 1441, 1450, 1457, 1460, 1461, 1470, 1471, 1472, 1473, 1474, 1475, 1476, 1480, 1490, 1495, 4000, 
    4020, 4030, 4031, 4032, 4040, 4041, 4042, 4050, 4051, 4052, 4053, 4100, 4101, 4102, 4120, 4121, 4122, 4130, 
    4140, 4141, 4160, 4161, 4162, 4163, 4170, 4171, 4180, 4181, 4190, 4210, 4217, 4218, 4219, 4250, 4252, 4253, 
    4254, 4257, 4260, 4261, 4263, 4280, 4287, 4300, 4317, 4340, 4342, 4347, 4350, 4351, 4357, 4360, 4367, 4370,
    4400, 4420, 4430, 4431, 4432, 4450, 4452, 4453, 4458, 4460, 4470, 4480, 4500, 4520, 4530, 4537, 4540, 4550, 
    4557, 4560, 4570, 4577, 4590, 4600, 4601, 4606, 4607, 4608, 4610, 4620, 4621, 4623, 4624, 4630, 4631, 4632, 
    4633, 4650, 4651, 4652, 4653, 4654, 4670, 4671, 4672, 4680, 4681, 4682, 4683, 4684, 4690, 4700, 4701, 4710, 
    4711, 4720, 4721, 4730, 4731, 4732, 4750, 4760, 4761, 4770, 4780, 4781, 4782, 4783, 4784, 4790, 4800, 4801, 
    4802, 4820, 4821, 4830, 4831, 4834, 4837, 4840, 4841, 4845, 4850, 4851, 4852, 4860, 4870, 4877, 4880, 4890, 
    4900, 4910, 4920, 4950, 4960, 4970, 4980, 4983, 4987, 4990, 5000, 5001, 5002, 5003, 5004, 5010, 5020, 5021, 
    5022, 5024, 5030, 5031, 5032, 5060, 5070, 5080, 5081, 5100, 5101, 5140, 5150, 5170, 5190, 5300, 5310, 5330, 
    5332, 5333, 5334, 5336, 5340, 5350, 5351, 5353, 5354, 5360, 5361, 5362, 5363, 5364, 5370, 5377, 5380, 5390,
    5500, 5501, 5502, 5503, 5504, 5520, 5521, 5522, 5523, 5524, 5530, 5531, 5532, 5533, 5537, 5540, 5541, 5542, 
    5544, 5550, 5555, 5560, 5570, 5571, 5572, 5573, 5574, 5575, 5576, 5580, 5590, 5600, 5620, 5621, 5630, 5640, 
    5641, 5644, 5646, 5650, 5651, 5660, 5670, 5680, 5690, 6000, 6001, 6010, 6020, 6030, 6031, 6032, 6040, 6041, 
    6042, 6043, 6044, 6060, 6061, 6062, 6120, 6140, 6141, 6142, 6150, 6180, 6181, 6182, 6183, 6200, 6210, 6211, 
    6220, 6221, 6222, 6223, 6224, 6230, 6238, 6240, 6250, 6280, 6440, 6441, 6442, 6443, 6444, 6460, 6461, 6462, 
    6463, 6464, 6470, 6500, 6530, 6531, 6532, 6533, 6534, 6536, 6540, 6542, 6543, 6560, 6567, 6590, 6591, 6592, 
    6593, 6594, 6596, 6600, 6630, 6631, 6637, 6640, 6642, 6643, 6644, 6646, 6647, 6648, 6650, 6660, 6661, 6662, 
    6663, 6666, 6670, 6671, 6672, 6673, 6674, 6680, 6681, 6682, 6683, 6684, 6686, 6687, 6688, 6690, 6692, 6693, 
    6700, 6701, 6704, 6706, 6720, 6721, 6723, 6724, 6730, 6731, 6740, 6741, 6742, 6743, 6747, 6750, 6761, 6762, 
    6767, 6769, 6780, 6781, 6782, 6783, 6784, 6790, 6791, 6792, 6793, 6800, 6810, 6811, 6812, 6813, 6820, 6821, 
    6823, 6824, 6830, 6831, 6832, 6833, 6834, 6836, 6838, 6840, 6850, 6851, 6852, 6853, 6856, 6860, 6870, 6880, 
    6887, 6890, 6900, 6920, 6921, 6922, 6924, 6927, 6929, 6940, 6941, 6950, 6951, 6952, 6953, 6960, 6970, 6971, 
    6980, 6982, 6983, 6984, 6987, 6990, 6991, 6992, 6997, 7000, 7010, 7011, 7012, 7020, 7021, 7022, 7024, 7030, 
    7031, 7032, 7033, 7034, 7040, 7041, 7050, 7060, 7061, 7062, 7063, 7070, 7080, 7090, 7100, 7110, 7120, 7130, 
    7131, 7132, 7133, 7134, 7140, 7141, 7160, 7170, 7180, 7181, 7190, 7191, 7300, 7301, 7320, 7321, 7322, 7323, 
    7324, 7330, 7331, 7332, 7333, 7334, 7340, 7350, 7370, 7380, 7382, 7387, 7390, 7500, 7502, 7503, 7504, 7506, 
    7510, 7511, 7512, 7520, 7521, 7522, 7530, 7531, 7532, 7533, 7534, 7536, 7538, 7540, 7542, 7543, 7548, 7600, 
    7601, 7602, 7603, 7604, 7610, 7611, 7618, 7620, 7621, 7622, 7623, 7624, 7640, 7641, 7642, 7643, 7700, 7711, 
    7712, 7730, 7740, 7742, 7743, 7750, 7760, 7780, 7781, 7782, 7783, 7784, 7800, 7801, 7802, 7803, 7804, 7810, 
    7811, 7812, 7822, 7823, 7830, 7850, 7860, 7861, 7862, 7863, 7864, 7866, 7870, 7880, 7890, 7900, 7901, 7903, 
    7904, 7906, 7910, 7911, 7912, 7940, 7941, 7942, 7943, 7950, 7951, 7970, 7971, 7972, 7973];

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
    let page = null;
    try {
        page = await browser.newPage();
        
        // Zet page timeouts
        await page.setDefaultNavigationTimeout(30000);
        await page.setDefaultTimeout(30000);
        
        const url = pageNum === 1 
            ? `https://www.openingsuren.vlaanderen/${category}`
            : `https://www.openingsuren.vlaanderen/${category}/p${pageNum}`;
        
        const response = await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        
        if (response.status() === 403 || response.status() === 429) {
            throw new Error('IP BLOCKED');
        }

        const isBlocked = await checkForIPBlock(page);
        if (isBlocked) {
            throw new Error('IP BLOCKED');
        }

        const businesses = await page.evaluate((currentCategory) => {
            const results = [];
            const companyElements = document.querySelectorAll('.list-row .company-list');
            
            if (companyElements.length === 0) {
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
            
            await saveBusinesses([]);
            process.exit(1);
        }
        
        // Log de error maar gooi hem opnieuw zodat de retry logica hem kan afhandelen
        console.error(`Error scraping ${category} page ${pageNum}:`, error);
        throw error;
    } finally {
        if (page) {
            try {
                await page.close();
            } catch (error) {
                console.error('Error closing page:', error);
            }
        }
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

    // Filter out businesses with Walloon postal codes
    const filteredBusinesses = businesses.filter(business => {
        if (!business.address) return true; // Keep businesses without address
        
        // Check if any Walloon postal code is found in the address
        return !waalsePostcodes.some(code => 
            business.address.includes(code.toString())
        );
    });

    // Combine existing and new filtered businesses
    const allBusinesses = [...existingBusinesses, ...filteredBusinesses];
    
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
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // Voorkomt geheugen problemen
            '--disable-gpu', // Reduceert resource gebruik
        ],
        protocolTimeout: 30000,        // Verhoog protocol timeout naar 30 seconden
        timeout: 60000   // Algemene timeout van 60 seconden
    });
    
    try {
        for (let i = 0; i < categories.length; i += PARALLEL_CATEGORIES) {
            let retries = 3; // Aantal pogingen per batch categorieën
            
            while (retries > 0) {
                try {
                    const categoryPromises = categories
                        .slice(i, i + PARALLEL_CATEGORIES)
                        .map(category => processCategory(browser, category));
                    
                    await Promise.all(categoryPromises);
                    console.log(`Completed categories ${i + 1} to ${Math.min(i + PARALLEL_CATEGORIES, categories.length)} of ${categories.length}`);
                    break; // Succesvol, ga door naar volgende batch
                } catch (error) {
                    retries--;
                    console.error(`Batch error (${retries} retries left):`, error);
                    
                    if (retries > 0) {
                        console.log('Waiting 30 seconds before retrying...');
                        await new Promise(resolve => setTimeout(resolve, 30000));
                        // Probeer een nieuwe browser instantie te maken
                        await browser.close();
                        browser = await puppeteer.launch({
                            headless: true,
                            args: [
                                '--no-sandbox',
                                '--disable-setuid-sandbox',
                                '--disable-dev-shm-usage',
                                '--disable-gpu'
                            ],
                            protocolTimeout: 30000,
                            timeout: 60000
                        });
                    }
                }
            }
            
            if (retries === 0) {
                console.error('Max retries reached for current batch, moving to next batch...');
            }
            
            // Wacht even tussen batches om het systeem te laten herstellen
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        console.log('Scraping completed! All data saved to all_businesses.csv');
        
    } catch (error) {
        console.error('Fatal error occurred:', error);
    } finally {
        await browser.close();
    }
}

console.log("Starting parallel scraping process...");
main().catch(console.error);