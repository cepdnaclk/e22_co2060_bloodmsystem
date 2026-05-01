/**
 * ─── Hospital Search Utility (Nominatim + Overpass) ─────────────
 * Uses FREE OpenStreetMap APIs — no API key needed!
 *
 * Primary: Nominatim search — type-ahead like Google autocomplete
 *   → User types "emb" → finds "Embilipitiya Base Hospital"
 *
 * Fallback: Overpass API — bulk fetch all hospitals in a bounding box
 * ──────────────────────────────────────────────────────────────────
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * LIVE SEARCH: Search hospitals by name as the user types.
 * Uses Nominatim (OpenStreetMap's free geocoding/search API).
 *
 * Example: searchHospitalsByName("emb", "Ratnapura")
 *   → Returns: [{ name: "Embilipitiya Base Hospital", lat: 6.33, lon: 80.85, ... }]
 *
 * @param {string} query     - What the user has typed (e.g. "emb", "ratnapura config")
 * @param {string} district  - Selected district name to bias the search
 * @returns {Promise<Array<{id, name, lat, lon, address}>>}
 */
export const searchHospitalsByName = async (query, district = '') => {
    if (!query || query.length < 2) return [];

    // Build search: "[query] hospital [district]" in Sri Lanka
    const searchText = `${query} hospital ${district}`.trim();

    try {
        const params = new URLSearchParams({
            q: searchText,
            format: 'json',
            countrycodes: 'lk',               // restrict to Sri Lanka
            limit: '15',
            addressdetails: '1',
            extratags: '1',
        });

        const response = await fetch(`${NOMINATIM_URL}?${params}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'HOPEDROP-BloodBank/1.0',   // Nominatim requires a User-Agent
            },
        });

        if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);

        const data = await response.json();

        return data
            .filter((item) => {
                // Keep results that are hospitals / clinics / healthcare
                const type = item.type || '';
                const category = item.class || '';
                const name = (item.display_name || '').toLowerCase();
                return (
                    category === 'amenity' ||
                    type === 'hospital' ||
                    type === 'clinic' ||
                    type === 'doctors' ||
                    name.includes('hospital') ||
                    name.includes('medicalOfficers') ||
                    name.includes('health')
                );
            })
            .map((item) => ({
                id: item.place_id,
                name: item.name || item.display_name.split(',')[0],
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                address: item.display_name,
                shortAddress: [
                    item.address?.suburb,
                    item.address?.city || item.address?.town || item.address?.village,
                    item.address?.state_district,
                ].filter(Boolean).join(', '),
                type: item.type || 'hospital',
            }));
    } catch (error) {
        console.error('Nominatim search error:', error);
        return [];
    }
};

/**
 * BULK FETCH: Get ALL hospitals in a district using Overpass API.
 * Uses a bounding box around the district center (30km radius).
 *
 * @param {number[]} center - [lat, lon] of the district center
 * @param {number} radiusKm - Search radius in km (default: 30)
 * @returns {Promise<Array<{id, name, lat, lon, address}>>}
 */
export const searchHospitalsInArea = async (center, radiusKm = 30) => {
    if (!center || center.length < 2) return [];

    const [lat, lon] = center;
    // Convert km to approximate degrees (1 degree ≈ 111 km)
    const delta = radiusKm / 111;
    const south = lat - delta;
    const north = lat + delta;
    const west = lon - delta;
    const east = lon + delta;

    const query = `
        [out:json][timeout:25];
        (
            node["amenity"="hospital"](${south},${west},${north},${east});
            way["amenity"="hospital"](${south},${west},${north},${east});
            relation["amenity"="hospital"](${south},${west},${north},${east});
        );
        out center;
    `;

    try {
        const response = await fetch(OVERPASS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(query)}`,
        });

        if (!response.ok) throw new Error(`Overpass returned ${response.status}`);

        const data = await response.json();

        return data.elements
            .map((el) => {
                const elLat = el.lat || el.center?.lat;
                const elLon = el.lon || el.center?.lon;
                const name = el.tags?.name || 'Unnamed Hospital';
                if (!elLat || !elLon) return null;

                return {
                    id: el.id,
                    name,
                    lat: elLat,
                    lon: elLon,
                    address: el.tags?.['addr:street'] || '',
                    shortAddress: el.tags?.['addr:city'] || el.tags?.['addr:district'] || '',
                    type: el.tags?.healthcare || 'hospital',
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Overpass API error:', error);
        return [];
    }
};

/**
 * Client-side filter for an already-fetched list.
 */
export const filterHospitals = (hospitals, searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) return hospitals;
    const term = searchTerm.toLowerCase();
    return hospitals.filter(
        (h) =>
            h.name.toLowerCase().includes(term) ||
            (h.address || '').toLowerCase().includes(term) ||
            (h.shortAddress || '').toLowerCase().includes(term)
    );
};
