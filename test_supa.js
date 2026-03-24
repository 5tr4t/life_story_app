const SUPABASE_URL = 'https://vxtoqmisqhvuhbhttgfj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WHIIjqWmeWFWT3e1d6wtNg_qVgeMrae';

async function check() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/memoirs?select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
check();
