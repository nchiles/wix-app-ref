import wixData from 'wix-data';
import wixWindowFrontend from "wix-window-frontend";
import { currentMember } from "wix-members-frontend";

$w.onReady(() => {    
    $w("#updateRiderSubmit").onClick(() => {
        currentMember
            .getMember()
            .then((member) => {
                // Query the Members collection using the current user's ID
                console.log("member", member)
                console.log("memberid", member._id)                
                return wixData.query('Members')
                    .eq('_owner', member._id) // Use the current member's _id to query
                    .find();
            })
            .then((results) => {
                console.log("results", results)
                if (results.items.length > 0) {
                    const memberCollectionId = results.items[0]._id; // Get the member collection _id
                    
                    // Prepare the rider object with the correct member ID
                    let rider = {
                        name: $w("#updateRiderName").value,
                        ageString: $w("#updateRiderAge").value,
                        height: $w("#updateRiderHeight").value,
                        member: memberCollectionId // Use the correct member ID
                    };
        
                    // Insert rider into riders collection
                    return wixData.insert("Riders", rider);
                } else {
                    throw new Error("Member not found.");
                }
            })
            .then((result) => {
                const riderId = result._id; // Get the new rider's ID
                console.log("New rider's ID: ", riderId);
                updateMemberWithRider(riderId); // update Member with the rider reference
            })
            .catch((error) => {
                console.error("Error: ", error);
            });
    });
});

$w.onReady(function () {
    // Add a change listener to the slider
    $w("#updateRiderHeight").onChange((event) => {
        const heightInInches = event.target.value; // Get the slider value
        const heightInFeetAndInches = convertToFeetAndInches(heightInInches); // Convert it

        // Display the converted height below the slider
        $w("#heightDisplay").text = heightInFeetAndInches;
    });
});

// Helper function to convert inches to feet and inches
function convertToFeetAndInches(inches) {
    const feet = Math.floor(inches / 12); // Get the number of whole feet
    const remainingInches = inches % 12; // Get the remaining inches
    return `${feet}' ${remainingInches}"`; // Format as feet and inches
}


// Function to update the Member's multi-reference field
function updateMemberWithRider(riderId) {    
    currentMember
        .getMember()
        .then((member) => {
            // Query the Members collection using the current user's ID and insert reference                     
            return wixData.query('Members')
                .eq('_owner', member._id) // Use the current member's _id to query
                .find()
                .then((results) => {                
                    if (results.items.length > 0) {
                        let member = results.items[0];
                        
                        wixData.queryReferenced("Members", member._id, "riders")
                            .then((ridersArray) => {
                                if (ridersArray.items.length < 4) {                                    
                                    // Update the Member's record with the updated riders array
                                    wixData.insertReference("Members", "riders", member._id, riderId)
                                        .then(() => {
                                            console.log("Reference inserted");
                                            // Add code that checks all ride heights and gives false for less than rider height

                                            wixWindowFrontend.lightbox.close();
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                        });
                                } else {
                                    console.log("too many riders")
                                }
                            })
                        .catch((err) => {
                            console.log(err);
                        });                                               
                    }
            })
        })    
}
