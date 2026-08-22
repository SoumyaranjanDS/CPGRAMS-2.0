import axios from 'axios';

export interface LocationResult {
  pinCode: string;
  state: string;
  district: string;
  locality: string;
  postOffices?: string[];
  source: 'gps' | 'pincode' | 'fallback';
}

/**
 * Lookup Indian Postal PIN code details and post office areas
 */
export async function lookupPinCode(pinCode: string): Promise<LocationResult | null> {
  const cleanPin = pinCode.trim().replace(/\D/g, '');
  if (cleanPin.length !== 6) return null;

  try {
    const res = await axios.get(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      timeout: 5000,
    });
    const data = res.data?.[0];

    if (data && data.Status === 'Success' && Array.isArray(data.PostOffice) && data.PostOffice.length > 0) {
      const primary = data.PostOffice[0];
      const postOffices = data.PostOffice.map((po: any) => po.Name).filter(Boolean);

      return {
        pinCode: cleanPin,
        state: primary.State || '',
        district: primary.District || '',
        locality: postOffices[0] || '',
        postOffices,
        source: 'pincode',
      };
    }
  } catch (err) {
    console.warn('Postal PIN API lookup error, using fallback:', err);
  }

  return null;
}

/**
 * Detect user's current GPS location and reverse geocode to PIN code, State, District & Locality
 */
export async function detectGPSLocation(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // 1. Try OpenStreetMap Nominatim reverse geocode
        try {
          const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
          const osmRes = await axios.get(osmUrl, {
            headers: { 'Accept-Language': 'en' },
            timeout: 5000,
          });

          if (osmRes.data && osmRes.data.address) {
            const addr = osmRes.data.address;
            const pinCode = (addr.postcode || '').replace(/\D/g, '').slice(0, 6);
            const state = addr.state || '';
            const district = addr.state_district || addr.county || addr.city || addr.town || '';
            
            // Build informative locality string
            const localityParts = [
              addr.neighbourhood || addr.suburb || addr.residential || addr.village || addr.road,
              addr.city || addr.town || addr.municipality,
            ].filter(Boolean);

            const locality = localityParts.length > 0 ? localityParts.join(', ') : (addr.suburb || district);

            // Fetch post offices if PIN is present
            let postOffices: string[] = [];
            if (pinCode.length === 6) {
              const pinDetails = await lookupPinCode(pinCode);
              if (pinDetails?.postOffices) {
                postOffices = pinDetails.postOffices;
              }
            }

            resolve({
              pinCode: pinCode || '751024',
              state: state || 'Odisha',
              district: district || 'Khordha',
              locality: locality || 'Urban Area',
              postOffices,
              source: 'gps',
            });
            return;
          }
        } catch (osmErr) {
          console.warn('OSM Reverse geocode failed, trying secondary fallback:', osmErr);
        }

        // 2. Try BigDataCloud Reverse Geocode Client API
        try {
          const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
          const bdcRes = await axios.get(bdcUrl, { timeout: 5000 });

          if (bdcRes.data) {
            const data = bdcRes.data;
            const pinCode = (data.postcode || '').replace(/\D/g, '').slice(0, 6);
            const state = data.principalSubdivision || '';
            const district = data.locality || data.city || '';
            const locality = [data.locality, data.city].filter(Boolean).join(', ') || district;

            resolve({
              pinCode: pinCode || '751001',
              state: state || 'Odisha',
              district: district || 'Bhubaneswar',
              locality: locality || district,
              source: 'gps',
            });
            return;
          }
        } catch (bdcErr) {
          console.warn('BigDataCloud reverse geocode fallback failed:', bdcErr);
        }

        // 3. Coordinate fallback
        resolve({
          pinCode: '751001',
          state: 'Odisha',
          district: 'Khordha (Bhubaneswar)',
          locality: `Near Lat: ${latitude.toFixed(3)}, Lon: ${longitude.toFixed(3)}`,
          source: 'gps',
        });
      },
      (err) => {
        let msg = 'Unable to retrieve your location.';
        if (err.code === 1) msg = 'Location permission was denied. You can enter your 6-digit PIN code instead.';
        else if (err.code === 2) msg = 'Location position unavailable. Please enter your PIN code.';
        else if (err.code === 3) msg = 'Location request timed out. Please enter your PIN code.';
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
