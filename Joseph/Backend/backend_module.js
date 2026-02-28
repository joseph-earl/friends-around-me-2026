// import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hufnrzrqsezgbffprjso.supabase.co"; // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1Zm5yenJxc2V6Z2JmZnByanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDY3MjEsImV4cCI6MjA4NTEyMjcyMX0.Itpm6REdAyOw_-9rw2CuibDzogN43Rq_E8rM6zJXVFw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * SEARCH FUNCTIONS OVERVIEW
 *
 * These functions search the Supabase database for records that match your search text.
 * They work like a search bar - you type in part of a name, and they find all records
 * that contain that text anywhere in the name. The search is case-insensitive, so
 * "YORK", "york", and "York" all work the same way.
 *
 * All functions return an array of objects (or null if there's an error). You can loop
 * through the results using forEach and access properties using dot notation:
 *
 * @example
 * const results = await getCities('york');
 * results.forEach(item => {
 *   console.log(item.name);  // Access the name property
 *   console.log(item.country);  // Access the country property
 * });
 */

export async function getCities(text) {
  /**
   * Searches for cities by name using partial matching
   * @param {string} text - Search term (matches anywhere in city name, case-insensitive)
   * @returns {Promise<Array|null>} Array of city objects, or null if error occurs
   *
   * @example
   * const cities = await getCities('york');
   * // Returns cities like "New York", "York", "Yorkshire", etc.
   *
   * cities.forEach(city => {
   *   console.log(city.name);      // City name
   *   console.log(city.country);   // Country name
   * });
   */
  const { data, error } = await supabase
    .from("cities")
    .select()
    .ilike("name", `%${text}%`);

  if (error) {
    console.error("Error fetching data:", error);
    return null;
  }

  return data;
}

export async function getHighschool(text) {
  /**
   * Searches for high schools by name using partial matching
   * @param {string} text - Search term (matches anywhere in school name, case-insensitive)
   * @returns {Promise<Array|null>} Array of high school objects, or null if error occurs
   *
   * @example
   * const schools = await getHighschool('lincoln');
   * schools.forEach(school => {
   *   console.log(school.name);  // Access school properties
   * });
   */
  const { data, error } = await supabase
    .from("highschool")
    .select()
    .ilike("name", `%${text}%`);

  if (error) {
    console.error("Error fetching data:", error);
    return null;
  }

  return data;
}

export async function getLanguages(text) {
  /**
   * Searches for languages by name using partial matching
   * @param {string} text - Search term (matches anywhere in language name, case-insensitive)
   * @returns {Promise<Array|null>} Array of language objects, or null if error occurs
   *
   * @example
   * const languages = await getLanguages('span');
   * // Returns "Spanish", "Hispanic", etc.
   */

  const { data, error } = await supabase
    .from("languages")
    .select()
    .ilike("name", `%${text}%`);

  if (error) {
    console.error("Error fetching data:", error);
    return null;
  }

  return data;
}

/**
 * Retrieves a user record by ID.
 * @param {number|string} user_id - The ID of the user to retrieve.
 * @returns {Promise<Object|null>} The user object, or null if not found.
 */
export async function getUserData(user_id) {
  if (user_id == null) return null;

  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("id", user_id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data;
}

export async function getAllOtherUserData(user_id) {
  /**
   * Retrieves all user data except for the specified user
   * @param {number|string} user_id - The ID of the user to exclude from results
   * @returns {Promise<Array|null>} Array of user objects (excluding the specified user), or null if error occurs
   */
  const { data, error } = await supabase
    .from("users")
    .select()
    .neq("id", user_id); // Get all rows NOT equal to this user_id

  if (error) {
    console.error("Error fetching data:", error);
    return null;
  }

  return data;
}

export async function submitUserData(userData, userID = null) {
  const fields = {
    full_name: userData.full_name,
    highschool_name: userData.highschool_name,
    highschool_lat: userData.highschool_lat,
    highschool_lon: userData.highschool_lon,
    mis1_name: userData.mis1_name,
    mis1_lat: userData.mis1_lat,
    mis1_lon: userData.mis1_lon,
    mis2_name: userData.mis2_name,
    mis2_lat: userData.mis2_lat,
    mis2_lon: userData.mis2_lon,
  };

  let data, error;

  // if our user ID isn't null, update the row and return
  if (userID != null) {
    ({ data, error } = await supabase.from("users").update(fields).eq("id", userID).select());

    if (error) {
      console.error("Error inserting data:", error);
      return null;
    }
    console.log("Data successfully inserted");
    return data[0].id;
  }

  // if not, then check the data for a matching name, and either update matching row or insert new row
  ({ data, error } = await supabase
    .from("users")
    .eq("full_name", fields.full_name)
    .select());

  if (error) {
    console.error("Error checking for matching data:", error);
    return null;
  } else if (data.length === 0) {
    ({ data, error } = await supabase
      .from("users")
      .insert(fields)
      .select());

    if (error) {
      console.error("Error inserting data:", error);
      return null;
      }

    console.log(`successfully inserted data at row ${data.id}`)
    return data.id
  } else {
    ({ data, error } = await supabase
      .from("users")
      .update(fields)
      .eq("full_name", fields.full_name)
      .select());

    if (error) {
      console.error(`Error updating data for user ${fields.user}`, error);
      return null;
    }

    console.log(`successfully updated data at row ${data.id}`)
    return data.id
  }
  

  
}

export async function makeLocationConnections(userID) {
  /**
   * Finds the closest geographic connection between a user and all other users
   * @param {number} userID - The ID of the user to compare against all others
   * @returns {Array<{name: string, distance: number, connection: string}>}
   *   List of objects sorted by closest distance, each containing the other user's
   *   name, the closest distance in miles, and a human-readable connection string.
   *   Returns an array with a single error string if the user has no locations.
   */

  const user = await getUserData(userID);

  console.log("user:", user);
  const data1 = await getAllOtherUserData(userID);
  console.log("all others:", data1);

  // Build a map of the user's available locations
  const userLocations = {};
  if (user.highschool_lat != null && user.highschool_lon != null) {
    userLocations.highschool = {
      name: user.highschool_name,
      lat: user.highschool_lat,
      lon: user.highschool_lon,
    };
  }
  if (user.mis1_lat != null && user.mis1_lon != null) {
    userLocations.mis1 = {
      name: user.mis1_name,
      lat: user.mis1_lat,
      lon: user.mis1_lon,
    };
  }
  if (user.mis2_lat != null && user.mis2_lon != null) {
    userLocations.mis2 = {
      name: user.mis2_name,
      lat: user.mis2_lat,
      lon: user.mis2_lon,
    };
  }

  if (Object.keys(userLocations).length === 0) {
    return ["No locations given."];
  }

  // Labels describing each location type for the connection string
  const locationLabels = {
    highschool: "went to high school",
    mis1: "served a mission",
    mis2: "served a mission",
  };

  const data = await getAllOtherUserData(userID);
  const results = [];

  data.forEach((person) => {
    // Build a map of the other person's available locations
    const personLocations = {};
    if (person.highschool_lat != null && person.highschool_lon != null) {
      personLocations.highschool = {
        name: person.highschool_name,
        lat: person.highschool_lat,
        lon: person.highschool_lon,
      };
    }
    if (person.mis1_lat != null && person.mis1_lon != null) {
      personLocations.mis1 = {
        name: person.mis1_name,
        lat: person.mis1_lat,
        lon: person.mis1_lon,
      };
    }
    if (person.mis2_lat != null && person.mis2_lon != null) {
      personLocations.mis2 = {
        name: person.mis2_name,
        lat: person.mis2_lat,
        lon: person.mis2_lon,
      };
    }

    if (Object.keys(personLocations).length === 0) return;

    // Compare every combination of user and person locations to find the closest
    let closestDistance = Infinity;
    let closestConnection = "";

    for (const [userLocKey, userLoc] of Object.entries(userLocations)) {
      for (const [personLocKey, personLoc] of Object.entries(personLocations)) {
        const distance = Math.round(
          haversine(userLoc.lat, userLoc.lon, personLoc.lat, personLoc.lon),
        );

        if (distance < closestDistance) {
          closestDistance = distance;

          // Build a human-readable connection string
          // e.g. "Graduated in Provo 15 miles from where you served a mission"
          const personAction =
            personLocKey === "highschool" ? "graduated" : "served a mission";
          const userAction = locationLabels[userLocKey];
          closestConnection = `${personAction} in ${personLoc.name} ${distance} miles from where you ${userAction}`;
        }
      }
    }

    results.push({
      name: person.full_name,
      distance: closestDistance,
      connection: closestConnection,
    });
  });

  // Sort by closest distance first
  return results.sort((a, b) => a.distance - b.distance);
}

// export function makeLocationConnections(userID) {
//   user = getUserData(userID);
//   user_locations = {}
//   if (user.highschool_lat != null && user.highschool_lon != null) {
//     user_locations.highschool = {name:user.highschool_name, lat:user.highschool_lat, lon:user.highschool_lon}
//   }
//   if (user.mis1_lat != null && user.mis1_lat == null) {
//     user_locations.mis1 = {lat:user.mis1_lat, lat:user.mis1_lon}
//   }
//   if (user.mis1_lat != null && user.mis1_lat == null) {
//     user_locations.mis1 = {lat:user.mis1_lat, lat:user.mis1_lon}
//   }

//   // if no locations, return
//   if (user_locations.keys(user_locations).length === 0) {
//     return ["No locations given."]
//   }

//   data = getAllOtherUserData(userID);
//   data.forEach(person => {
//     distances = {};
//     for ()
//     if (person.highschool_lat != null && person.highschool_lon != null) {
//       haversine()
//       distances[] = {name:user.highschool_name, lat:user.highschool_lat, lon:user.highschool_lon}
//     }
//   if (user.mis1_lat != null && user.mis1_lat == null) {
//     user_locations.mis1 = {lat:user.mis1_lat, lat:user.mis1_lon}
//   }
//   if (user.mis1_lat != null && user.mis1_lat == null) {
//     user_locations.mis1 = {lat:user.mis1_lat, lat:user.mis1_lon}
//   }
//     for ()
//   })

// }

export function makeLanguageConnections() {}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles

  // Convert to radians
  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in miles
}
