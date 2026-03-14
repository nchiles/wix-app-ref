import wixData from 'wix-data';
import { currentMember } from 'wix-members';

export let getMemberId = (() => {
	return currentMember.getMember()
	.then((member) => {				
		// console.log("current member "+ JSON.stringify(member))
		let id = member._id;
		return id;
	})
})

export let getMemberFromMembersCollection = ((memberId) => {	
	return wixData.query("Members")
	.eq("_owner", memberId)
	.find()
	.then((results) => {
		// console.log('getMemberItemResults', results.items)
		if(results.items.length > 0) {
			// console.log("members collection member: " + JSON.stringify(results.items[0]));
			return results.items[0];
		} else {
			console.log("member not found in Members collection")
		}
	})
	.catch((err) => {
		console.log(err);
		return err
	});    
});

export let getRidersFromRidersCollection = ((memberItem) => {
    return wixData.query("Riders")
    .eq("_owner", memberItem._owner) //Members collection item and riders collection item have same owner
    .find()
    .then((results) => {
        // console.log(results.items)
        return results.items;
    })
})

export let insertAttractionRating = ((collection, field, memberItemId, attractionId) => {
	// membersCollection, membersCollectionField, membersCollectionItemId, attractionIdToInsert
	wixData.insertReference(collection, field, memberItemId, attractionId)
	.then(() => {
		console.log("Reference inserted");
	})
	.catch((error) => {
		console.log(error);
	});
})

export let removeReferencedMember = ((itemData, memberItem) => {
	//loop through 1-5 to set interestN var	
	//itemData is from attractionsNew collection
	const forLoop = async _ => {
		// console.log('start');	
		for (let n = 1; n < 6; n++) {
			// console.log('start')
			// console.log(n)
			let interestField = `interest${n.toString()}`;
			let attractionItemId = itemData._id;
			//if interest reference field in AttractionsNew has id of current member					
			if (itemData[interestField].some(e => e._id === memberItem._id)) {	
				// remove member from interest ref field
				await wixData.removeReference("AttractionsNew", interestField, attractionItemId, memberItem._id)
				.then(() => {
					console.log("Reference removed");								
				})
				.catch((error) => {
					console.log(error);
					return 
				});	
			}						
		}
		// console.log('end')	
	}
	return forLoop()	
})

export let getRidersFromMember = ((memberId) => {
	return wixData.query("Members")
	.eq("_owner", memberId)
	.find()
	.then((results) => {		
		if(results.items.length > 0) {			
			let memberItem = results.items[0];
			console.log(memberItem)
			let riderOne = memberItem.rider1.name;
			let riderTwo = memberItem.rider2;
			let riders = [riderOne, riderTwo];
			return riders;
		} else {
			console.log("member not found in Members collection")
		}
	})
	.catch((err) => {
		console.log(err);
		return err
	});    
})

export let removeReferencedRider = ((itemData, riderItem) => {	
	//loop through 1-3 to set interestN var	
	//itemData is from attractionsNew collection
	const forLoop = async _ => {
		console.log('start');	
		for (let n = 1; n < 4; n++) {			
			console.log(n)
			console.log(itemData)
			let canRideField;
			if (n === 1) {
				// x === 'yes'
				canRideField = `yesRide`;
			} else if (n === 2) {
				// x === 'maybe'
				canRideField = `maybeRide`;
			} else if (n === 3) {
				// x === 'no'
				canRideField = `noRide`;
			} else {
				console.log('x not matching yesnomaybe')
				return
			}
			// let canRideField = `${x}Ride`;
			console.log(canRideField)
			console.log(itemData.canRideField)
			let attractionItemId = itemData._id;
			//if interest reference field in AttractionsNew has id of selected rider item					
			if (itemData[canRideField].some(e => e._id === riderItem._id)) {	
				// remove rider from can ride ref fields
				await wixData.removeReference("AttractionsNew", canRideField, attractionItemId, riderItem._id)
				.then(() => {
					console.log("Reference removed");								
				})
				.catch((error) => {
					console.log(error);
					return 
				});	
			}						
		}
		console.log('end')	
	}
	return forLoop()	
})

export let getSpecificRiderFromRidersCollection = ((memberItem, prefix) => {
	return wixData.query("Riders")
    .eq("_owner", memberItem._owner) //Members collection item and riders collection item have same owner
	.startsWith('riderId', prefix)
    .find()
    .then((results) => {
        // console.log(results.items)
        return results.items;
    })
})

export let insertRiderCanRide = ((collection, field, memberItemId, attractionId) => {
	// membersCollection, membersCollectionField, membersCollectionItemId, attractionIdToInsert
	wixData.insertReference(collection, field, memberItemId, attractionId)
	.then(() => {
		console.log("Reference inserted");
	})
	.catch((error) => {
		console.log(error);
	});
})