import wixData from 'wix-data';
import { currentMember } from "wix-members-frontend";
import { attractionBaseModel } from "public/sharedData.js";
import { sortAttractions } from "public/filter.js";

export async function fetchBaseAttractions() {
    const attractionsQuery = await wixData.query("AttractionsNew").limit(1000).find();

    return attractionsQuery.items.map(attraction => ({
        ...attractionBaseModel, // Use the shared model as the base structure
        _id: attraction._id,
        attractionId: attraction.attractionId,
        attractionName: attraction.attractions,
        attractionImage: attraction.attractionImage || "",
        attractionDesc: attraction.description,
        rideTypeTags: attraction.rideType || [],
        parkIcon: attraction.parkIcon,
        parkName: attraction.park || "Unknown Park",        
        subparkName: attraction.subPark || "Unknown Subpark",
        minHeight: attraction.heightRequirement || "0",
        minAge: attraction.minimumAge || "All Ages",
        lightningLaneInfo: attraction.lightingLane || "",
        lightningLanePrice: attraction.lanePrice || "",
        ratings: [], // Placeholder for future enrichment
        interestText: attraction.interestText || "Unknown Interest",
        rainSafe: attraction.rainSafe
    }));
}

/**
 * Fetches rider data for the current member.
 * @param {Object} currentFilters - The current filter object to update with rider preferences.
 * @returns {Promise<Array>} - A promise resolving to an array of rider data.
 */
export async function getRiderData(currentFilters) {
    try {
        const member = await currentMember.getMember();
        const memberQuery = await wixData.query("Members").eq("_owner", member._id).find();

        if (memberQuery.items.length === 0) {            
            console.warn("No member found.");
            return [];
        }

        const memberId = memberQuery.items[0]._id;

        // Fetch riders for the current member
        const ridersQuery = await wixData.query("Riders").eq("member", memberId).find();
        const riders = ridersQuery.items;

        // Default all riders to "No Preference"
        riders.forEach(rider => {
            currentFilters.riders[rider._id] = "noPreference";
        });

        // console.log("Fetched Riders for Member:", riders);
        return riders;
    } catch (error) {
        console.error("Error fetching rider data:", error);
        return [];
    }
}

/**
 * Fetches rider-specific data for a given attraction.
 * @param {string} attractionId - The ID of the attraction.
 * @returns {Promise<Array>} - An array of rider data objects.
 */
export async function getRiderDataForAttraction(attractionId) {
    try {
        const riderAttractionQuery = await wixData.query("RiderAttraction")
            .eq("attractionReference", attractionId) // Match riders to the attraction
            .find();
        const riderData = await Promise.all(
            riderAttractionQuery.items.map(async (riderAttraction) => {
                const riderDetails = await wixData.get("Riders", riderAttraction.riderReference);
                return {
                    id: riderAttraction._id, // Line item ID
                    riderId: riderDetails._id, // Unique ID from Riders collection
                    name: riderDetails?.name || "Unknown",
                    canRide: riderAttraction.canRide || false,
                    rating: riderAttraction.rating || null,
                };
            })
        );

        return riderData;
    } catch (error) {
        console.error(`Error fetching rider data for attraction ${attractionId}:`, error);
        return [];
    }
}

export async function fetchPreferencesAttractions() {
    const baseData = await fetchBaseAttractions();
    const enrichedData = await Promise.all(
        baseData.map(async (attraction) => {
            const riderData = await getRiderDataForAttraction(attraction._id);
            return {
                ...attraction,
                riderData,
                lightningLane: attraction.lightningLaneInfo || "None"
            };
        })
    );
    // console.log("Enriched Preferences Data:", enrichedData);
    return sortAttractions(enrichedData);
}


export function getRiderIcon(canRide) {
    let riderYesIcon = 'https://static.wixstatic.com/shapes/a99c0f_bb271d52ec8b4a149481a6089dd3634e.svg';
    let riderMaybeIcon = 'https://static.wixstatic.com/shapes/a99c0f_6ba026e175bf4f089e36adfa64f1ee2b.svg';
    let riderNoIcon = 'https://static.wixstatic.com/shapes/a99c0f_623cd493223f47558561933da09f248e.svg';
    return canRide ? riderYesIcon : riderNoIcon;
}