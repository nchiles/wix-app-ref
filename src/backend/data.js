import wixData from 'wix-data';

export function Riders_afterInsert(rider) {		
    // Fetch all attractions
    wixData.query("AttractionsNew")
        .limit(1000)
        .find()
        .then((attractionsResults) => {
            const attractions = attractionsResults.items;

            // Create a RiderAttraction record for each attraction
            const riderAttractions = attractions.map((attraction) => {
                return {
                    riderReference: rider._id, // Link to the rider
                    attractionReference: attraction._id, // Link to the attraction
                    canRide: rider.height >= attraction.heightRequirement, // Evaluate height
                    rating: null // Initialize with no rating
                };
            });

            // Insert all RiderAttraction records in bulk
            wixData.bulkInsert("RiderAttraction", riderAttractions)
                .then(() => {
                    console.log("RiderAttraction records created successfully.", riderAttractions);
                })
                .catch((error) => {
                    console.error("Error creating RiderAttraction records:", error);
                });
        })
        .catch((error) => {
            console.error("Error fetching attractions:", error);
        });
}

export function Riders_afterUpdate(rider) {
    // Query all RiderAttraction records for the updated rider
    wixData.query("RiderAttraction")
        .eq("riderReference", rider._id)
        .find()
        .then((results) => {
            // Fetch all attractions and map them for quick lookups
            return wixData.query("AttractionsNew")
                .limit(1000)
                .find()
                .then((attractionsResults) => {
                    const attractionsMap = attractionsResults.items.reduce((map, attraction) => {
                        map[attraction._id] = attraction;
                        return map;
                    }, {});

                    // Update each RiderAttraction record based on updated height
                    const updates = results.items.map((record) => {
                        const attraction = attractionsMap[record.attractionReference];
                        if (attraction) {
                            record.canRide = rider.height >= attraction.heightRequirement;
                        }
                        return record;
                    });

                    // Perform all updates
                    return Promise.all(updates.map((record) => wixData.update("RiderAttraction", record)));
                });
        })
        .then(() => {
            console.log("RiderAttraction records updated successfully.");
        })
        .catch((error) => {
            console.error("Error updating RiderAttraction records:", error);
        });
}

export function Riders_afterRemove(rider) {
    // Query all RiderAttraction records for the removed rider
    wixData.query("RiderAttraction")
        .limit(1000)
        .eq("riderReference", rider._id)
        .find()
        .then((results) => {
            const deletePromises = results.items.map((record) => {
                return wixData.remove("RiderAttraction", record._id);
            });

            // Wait for all deletions to complete
            return Promise.all(deletePromises);
        })
        .then(() => {
            console.log("All associated RiderAttraction records deleted.");
        })
        .catch((error) => {
            console.error("Error deleting RiderAttraction records:", error);
        });
}