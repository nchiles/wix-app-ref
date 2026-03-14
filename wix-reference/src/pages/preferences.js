// PREFERENCES PAGE
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixWindowFrontend from 'wix-window-frontend';
import { filters, setupSearchFilter, setupParkFilter, setupRiderFilter } from 'public/filter.js';
import { fetchPreferencesAttractions, getRiderData } from 'public/utils.js';
// import wixLocation from 'wix-location';

// $w.onReady(function () {
//     // Attach click events to your custom menu items
//     $w('#menuHome').onClick(() => {
//         showLoadingIndicator();
//         wixLocation.to('/home'); // Navigate to the Home page
//     });

//     $w('#menuPreferences').onClick(() => {
//         showLoadingIndicator();
//         wixLocation.to('/preferences'); // Navigate to the Preferences page
//     });

//     $w('#menuRiders').onClick(() => {
//         showLoadingIndicator();
//         wixLocation.to('/riders'); // Navigate to the Riders page
//     });
// });

// // Function to show the loading indicator
// function showLoadingIndicator() {
//     $w('#loadingIndicator').show(); // Replace with your spinner or overlay
// }  

$w.onReady(async function () {
    if (!wixUsers.currentUser.loggedIn) {
        wixWindowFrontend.openLightbox("signUpLightbox").then(async () => {
            await initializePreferencesPage();
        });
    } else {
        await initializePreferencesPage();
    }

    let isFilterOpen = false;

    $w("#toggleFilterButton").onClick(() => {
        if (isFilterOpen) {
            $w("#filterContainer").hide("slide", { direction: "bottom", duration: 300 });
            isFilterOpen = false;
        } else {
            $w("#filterContainer").show("slide", { direction: "top", duration: 300 });
            isFilterOpen = true;
        }
    });

    $w("#attractionsRepeater").onItemReady(($item, itemData) => {
        bindAttractionItem($item, itemData);
    });
});

async function initializePreferencesPage() {
    try {
        // Fetch and bind rider data
        const riderData = await getRiderData(filters);
        showAddRidersContent(riderData)
        $w("#riderRepeater").data = riderData;

        // Fetch and bind attractions data
        const attractionsData = await fetchPreferencesAttractions();
        $w("#attractionsRepeater").data = attractionsData;

        // Set up filters
        setupSearchFilter("#searchInput", "#attractionsRepeater", attractionsData, filters);
        setupParkFilter(["#mkButton", "#ecButton", "#akButton", "#hsButton", "#parkClearButton"], "#attractionsRepeater", attractionsData, filters);
        setupRiderFilter("#riderRepeater", "#attractionsRepeater", attractionsData, filters);

        console.log("Preferences Page Initialized.");
    } catch (error) {
        console.error("Error initializing Preferences Page:", error);
    }
}

function bindAttractionItem($item, itemData) {
    $item("#attractionImage").src = itemData.attractionImage;
    $item("#rideTypeTags").options = itemData.rideTypeTags.map(tag => ({ label: tag, value: tag }));
    $item("#parkIcon").src = itemData.parkIcon;
    $item("#parkName").text = itemData.parkName || "Unknown Park";
    $item("#subparkName").text = itemData.subparkName || "Unknown Subpark";
    $item("#attractionName").text = itemData.attractionName;
    $item("#attractionDesc").text = itemData.attractionDesc || "No description available";
    $item("#heightAgeText").text = `${itemData.minAge || "All Ages"} at least ${itemData.minHeight}" tall`;

    const riderRows = [
        $item("#riderRow1"),
        $item("#riderRow2"),
        $item("#riderRow3"),
        $item("#riderRow4"),
    ];

    const riderNameFields = [
        $item("#riderName1"),
        $item("#riderName2"),
        $item("#riderName3"),
        $item("#riderName4"),
    ];

    const canRideSwitches = [
        $item("#canRideSwitch1"),
        $item("#canRideSwitch2"),
        $item("#canRideSwitch3"),
        $item("#canRideSwitch4"),
    ];

    const ratingInputs = [
        $item("#ratingInput1"),
        $item("#ratingInput2"),
        $item("#ratingInput3"),
        $item("#ratingInput4"),
    ];

    // Collapse all rider rows by default
    riderRows.forEach(row => row.collapse());

    // Log rider data for debugging
    // console.log("Item Data Rider Data:", itemData.riderData);

    // Bind data for each rider
    itemData.riderData.forEach((rider, index) => {
        if (index < riderRows.length) {
            riderRows[index].expand();
            riderNameFields[index].text = rider.name || "Unknown";

            const canRide = !!rider.canRide; // Ensure canRide is a boolean
            // console.log(`Rider ID: ${rider.id}, canRide: ${canRide}, rating: ${rider.rating}`);

            // Set initial state for switches and ratings
            canRideSwitches[index].checked = canRide;
            ratingInputs[index].value = rider.rating || 0;

            // Correctly enable or disable the rating input
            if (canRide) {
                ratingInputs[index].enable();
            } else {
                ratingInputs[index].disable();
            }

            // Add event listener to the switch
            canRideSwitches[index].onChange(async (event) => {
                const newCanRide = event.target.checked;

                // console.log(`Switch Toggled for Rider ${rider.id}: ${newCanRide}`);

                try {
                    // Update database and UI state
                    await updateRiderPreference(rider.id, {
                        canRide: newCanRide,
                        rating: newCanRide ? rider.rating : 0, // Reset rating if cannot ride
                    });

                    rider.canRide = newCanRide;
                    rider.rating = newCanRide ? rider.rating : 0;

                    // Correctly enable or disable the rating input
                    if (newCanRide) {
                        ratingInputs[index].enable();
                    } else {
                        ratingInputs[index].disable();
                    }

                    ratingInputs[index].value = rider.rating || 0; // Update the UI
                } catch (error) {
                    console.error("Error updating canRide preference:", error);
                }
            });

            // Add event listener to the rating input
            ratingInputs[index].onChange(async (event) => {
                const updatedRating = parseInt(event.target.value, 10) || 0;

                // console.log(`Rating Changed for Rider ${rider.id}: ${updatedRating}`);

                try {
                    await updateRiderPreference(rider.id, { rating: updatedRating });

                    rider.rating = updatedRating;
                } catch (error) {
                    console.error("Error updating rider rating:", error);
                }
            });
        }
    });
}

async function updateRiderPreference(riderId, updates) {
    try {
        const existingRecord = await wixData.get("RiderAttraction", riderId);
        const updatedRecord = { ...existingRecord, ...updates };

        await wixData.update("RiderAttraction", updatedRecord);

        // console.log("Updated Rider Preference:", updatedRecord);
    } catch (error) {
        console.error("Error updating Rider Preference:", error);
    }
}

function showAddRidersContent(riders) {
    if (riders.length > 0) {
        $w('#addRidersContent').hide();   
    } else {
        $w('#addRidersContent').show();
    }
}