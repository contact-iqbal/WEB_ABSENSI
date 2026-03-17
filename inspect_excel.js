const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'data.xls');

try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet Names:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        // header: 1 returns an array of arrays (rows)
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        
        console.log(`\n--- Sheet: ${sheetName} ---`);
        console.log(`Rows: ${data.length}`);
        
        // If it's a numeric sheet, let's look for the 3-person pattern
        if (!isNaN(Number(sheetName))) {
            console.log('Numeric Sheet Detected. First 20 rows of raw data:');
            data.slice(0, 20).forEach((row, i) => {
                console.log(`Row ${i}:`, row.map(c => String(c).substring(0, 15)).join(' | '));
            });
        } else {
            console.log('Non-numeric Sheet. First 5 rows:');
            data.slice(0, 5).forEach((row, i) => {
                console.log(`Row ${i}:`, row.join(' | '));
            });
        }
    });
} catch (err) {
    console.error('Error reading excel:', err.message);
}
