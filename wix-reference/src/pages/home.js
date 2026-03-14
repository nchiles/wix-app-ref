//Home
import { fetchWaitTimeData } from "backend/waitTimes.jsw";
import wixUsers from 'wix-users';
import wixWindowFrontend from 'wix-window-frontend';
import { filters, sortAttractions, setupSearchFilter, setupRainFilter, setupParkFilter, setupRiderFilter } from 'public/filter.js'
import { fetchBaseAttractions, getRiderDataForAttraction, getRiderData, getRiderIcon } from "public/utils.js";

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
        // $w('#loadingIndicator').hide();
        wixWindowFrontend.openLightbox("signUpLightbox").then(async () => {
            await initializeHomePage();
        });
    } else {
        await initializeHomePage();
    }
});

//itemData from utlis.js fetchBaseAttractions() 
$w("#attractionsRepeater").onItemReady(($item, itemData) => {
    $item("#attractionImage").src = itemData.attractionImage;
    $item("#parkIcon").src = itemData.parkIcon;
    $item("#parkName").text = itemData.parkName || "Unknown Park";
    $item("#subparkName").text = itemData.subparkName || "Unknown Subpark";
    $item("#rideTypeTags").options = itemData.rideTypeTags.map(tag => ({ label: tag, value: tag }));
    $item("#attractionName").text = itemData.attractionName;
    $item("#lightningLaneText").text = itemData.lightningLaneInfo;
    $item("#heightAgeText").text = `${itemData.minAge || "All Ages"} | ${itemData.minHeight || "Any Height"} or taller`;
    $item("#rainStatusText").text = itemData.rainSafe === true ? "Stays open" : "May close";
    // $item("#rainStatusIcon").src = itemData.rainSafe;
    $item("#ratingsDisplay").rating = itemData.averageRating || null;
    $item("#interestText").text = itemData.interestText || "Unknown";
    $item('#waitTimeText').html = itemData.waitTime === null
        ? `<h6>${itemData.status}</h6>`
        : `<h6>${itemData.waitTime} Minute Wait</h6>`;
    $item('#hiddenLightningLanePrice').text = itemData.lightningLanePrice || ""; 
    // Get wait time on button click
    $item("#waitTimeButton").onClick(async () => {
        $item("#waitTimeText").text = "Checking...";
        const updatedWaitTimeData = await fetchWaitTimeData(itemData.attractionId);
        $item("#waitTimeText").html = updatedWaitTimeData.waitTime === null
            ? `<h6>${updatedWaitTimeData.status}</h6>`
            : `<h6>${updatedWaitTimeData.waitTime} Minute Wait</h6>`;
        $item("#hiddenLightningLanePrice").text = updatedWaitTimeData.lightningLanePrice || "";
    });  

    // Bind rider-specific data
    const riderCols = [
        { col: $item("#riderCol1"), icon: $item("#riderIcon1"), name: $item("#riderName1") },
        { col: $item("#riderCol2"), icon: $item("#riderIcon2"), name: $item("#riderName2") },
        { col: $item("#riderCol3"), icon: $item("#riderIcon3"), name: $item("#riderName3") },
        { col: $item("#riderCol4"), icon: $item("#riderIcon4"), name: $item("#riderName4") },
    ];

    riderCols.forEach(({ col, icon, name }, index) => {
        const riderData = itemData.riderData?.[index];
        if (riderData) {
            col.show();
            icon.src = getRiderIcon(riderData.canRide);
            name.text = riderData.name || "Unknown";
        } else {
            col.hide();
        }
    });
});

async function initializeHomePage() {
    try {
        // Fetch and bind rider data for riders repeater in filter sidebar
        const riderData = await getRiderData(filters);
        showAddRidersContent(riderData)
        $w("#riderRepeater").data = riderData;

        // Fetch attractions data for Home
        const attractionsData = await fetchHomeAttractions();
        $w("#attractionsRepeater").data = attractionsData

        // Set up filters
        setupSearchFilter("#searchInput", "#attractionsRepeater", attractionsData, filters);
        setupRainFilter(["#rainButton", "#noRainButton", "#rainClearButton"], "#attractionsRepeater", attractionsData, filters);
        setupParkFilter(["#mkButton", "#ecButton", "#akButton", "#hsButton", "#parkClearButton"], "#attractionsRepeater", attractionsData, filters);
        setupRiderFilter("#riderRepeater", "#attractionsRepeater", attractionsData, filters);
    } catch (error) {
        console.error("Error initializing home page:", error);
    }
}

export async function fetchHomeAttractions() {
    const baseData = await fetchBaseAttractions();

    // Enrich data
    const enrichedData = await Promise.all(
        baseData.map(async (attraction) => {
            const waitTimeData = await fetchWaitTimeData(attraction.attractionId);
            const riderData = await getRiderDataForAttraction(attraction._id);
            const { averageRating, interestText } = calculateAverageRatingAndInterest(
                riderData.map(rider => rider.rating || 0)
            );

            return {
                ...attraction,
                ...waitTimeData,
                riderData,
                ratings: riderData.map(rider => rider.rating || 0),
                averageRating,
                interestText,
                lightningLane: attraction.lightningLaneInfo || "None"
            };
        })
    );

    // Sort using centralized function
    return sortAttractions(enrichedData);
}


function calculateAverageRatingAndInterest(ratings) {
    // Filter out null and 0 ratings
    const validRatings = ratings.filter(rating => rating && rating > 0);

    // Calculate the average rating
    const avgRating = validRatings.length
        ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
        : 0;

    // Determine interest text based on average rating
    let interestText = "No preferences set"; // Default
    if (avgRating > 4) interestText = "Must Ride";
    else if (avgRating > 3) interestText = "Do it";
    else if (avgRating >= 2) interestText = "Worth Trying";
    else if (avgRating >= 1) interestText = "If There's Time";
    else if (avgRating > 0) interestText = "Meh";

    return {
        averageRating: avgRating,
        interestText,
    };
}

function showAddRidersContent(riders) {
    if (riders.length > 0) {
        $w('#addRidersContent').hide();   
    } else {
        $w('#addRidersContent').show();
    }
}
