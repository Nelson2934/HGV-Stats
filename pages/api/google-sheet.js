export default async function handler(req, res) {
  // CORS headers to allow requests from your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Get the sheet URL from query params or use the hardcoded one
  const sheetUrl = req.query.url || 
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZz9HOgez1FqC2AQuhODU9Us6oB37onZQAzvRdGc51zyWSA6RFHnycVVjEtFPtr4kOfioqm7brIbtm/pub?output=csv';
  
  try {
    console.log('Fetching sheet:', sheetUrl);
    const response = await fetch(sheetUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log('CSV data fetched successfully, first 100 chars:', csvText.substring(0, 100));
    
    // Send CSV text back to client
    res.status(200).json({ csv: csvText });
  } catch (error) {
    console.error('Error fetching Google Sheet:', error);
    res.status(500).json({ error: error.message });
  }
}
