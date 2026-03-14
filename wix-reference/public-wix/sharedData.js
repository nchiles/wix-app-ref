let originalAttractionsData = [];
let originalRiderData = [];

export function setOriginalAttractionsData(data) {
    originalAttractionsData = data;
}

export function getOriginalAttractionsData() {
    return originalAttractionsData;
}

export function setOriginalRiderData(data) {
    originalRiderData = data;
}

export function getOriginalRiderData() {
    return originalRiderData;
}

export const attractionBaseModel = {
    attractionId: "",      
    attractionName: "",    
    attractionImage: "",
    rideTypeTags: [],
    parkIcon:"",  
    parkName: "",
    subparkName: "",
    minHeight: null,
    minAge: "",
    lightningLaneInfo: "",
    lightningLanePrice:"",
    riderData: [],
    ratings: [],
    interestText: ""
};
