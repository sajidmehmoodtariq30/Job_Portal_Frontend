// Frontend localStorage debugging script
// Run this in the browser console while on the client dashboard

console.log('🔍 Debugging Frontend localStorage...');
console.log('='.repeat(50));

console.log('📦 All localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`  ${key}:`, localStorage.getItem(key));
}

console.log('\n🔑 Specific client-related keys:');
const clientKeys = ['client_data', 'client_id', 'clientId', 'userId', 'client_uuid', 'client_email'];
clientKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  ${key}:`, value ? value : 'NOT FOUND');
});

console.log('\n📋 Parsed client_data:');
try {
    const clientData = localStorage.getItem('client_data');
    if (clientData) {
        const parsed = JSON.parse(clientData);
        console.log('  ✅ Successfully parsed:', parsed);
        console.log('  🆔 Client UUID:', parsed.uuid);
        console.log('  📧 Client Email:', parsed.email);
        console.log('  📛 Client Name:', parsed.name);
    } else {
        console.log('  ❌ No client_data found in localStorage');
    }
} catch (error) {
    console.log('  ❌ Error parsing client_data:', error.message);
}

console.log('\n🔄 Current page:', window.location.pathname);

console.log('\n🔧 Manual test - Check if quotes API works:');
const clientData = localStorage.getItem('client_data');
if (clientData) {
    try {
        const parsed = JSON.parse(clientData);
        const clientId = parsed.uuid;
        console.log(`  Try this API call: fetch('/api/quotes?clientId=${clientId}')`);
        console.log(`  Or run: fetch('http://localhost:5000/api/quotes?clientId=${clientId}').then(r => r.json()).then(console.log)`);
    } catch (e) {
        console.log('  Cannot generate API test due to parsing error');
    }
} else {
    console.log('  Cannot generate API test - no client data found');
}
