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

checkPages();
