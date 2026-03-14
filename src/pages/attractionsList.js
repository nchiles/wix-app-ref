import wixWindow from 'wix-window';
import { getWaitTime } from 'backend/waitTimes.jsw';
import { filter, searchFilter } from 'public/filter.js'

$w.onReady(function () {
	$w("#dynamicDataset").onReady( () => {
		
		$w("#repeater2").onItemReady(($item, itemData, index) => {	
			//SET RIDER NAMES					
			$w("#nameOneClearButton").label = "Luca";
			$w("#nameTwoClearButton").label = "Theo";
			$w("#nameTwoText").text = "Luca";
			$w("#nameTwoText").text = "Theo";

			//SET SUBPARK TAGS
			let mk = 'Magic Kingdom';
			let ec = 'EPCOT';
			let ak = 'Animal Kingdom';
			let hs = 'Hollywood Studios';
			let mkColor = 'color:#c35f5f;background:#fce9e9;';			
			let ecColor = 'color:#426892;background:#d4e0ec;';			
			let akColor = 'color:#597859;background:#dfeddf;';			
			let hsColor = 'color:#c19309;background:#f9f5e3;';



			// let park;
			// let pillShape = 'border-radius:2px;font-size:.65rem;padding:0.2rem 0.6rem;';
			// switch(itemData.park[0]) {
			// 	case mk:
			// 		park = `<span style='${mkColor}'>${itemData.park} - ${itemData.subPark}</span>`;					
			// 		break;
			// 	case ec:
			// 		park = `<span style='${ecColor}'>${itemData.park} - ${itemData.subPark}</span>`;					
			// 		break;
			// 	case ak:
			// 		park = `<span style='${akColor}'>${itemData.park} - ${itemData.subPark}</span>`;					
			// 		break;
			// 	case hs:
			// 		park = `<span style='${pillShape}'>${itemData.park} - ${itemData.subPark}</span>`;					
			// 		break;
			// 	default:
			// 		park = `<span style='color:black;'>${itemData.park} - ${itemData.subPark}</span>`;
			// }
			
			// $item('#parkContainer').style.backgroundColor = '#f5f5f5';
			// $item('#parkSubpark').html = `<span style='font-size:.65rem;color:#979797;letter-spacing:-.2;'>${park}</span>`;

			//SET PARK ICON
			if (itemData.park[0] == 'EPCOT') {
				$item('#parkIcon').src = 'https://static.wixstatic.com/shapes/a99c0f_456629fa38dd4e7095c8da523654a1e0.svg'
			} 
			if (itemData.park[0] == 'Hollywood Studios') {
				$item('#parkIcon').src = 'https://static.wixstatic.com/shapes/a99c0f_8fe685a9f19b4c999057e518ebb190d1.svg'
			}
			if (itemData.park[0] == 'Animal Kingdom') {
				$item('#parkIcon').src = 'https://static.wixstatic.com/shapes/a99c0f_8fe685a9f19b4c999057e518ebb190d1.svg'
			}
			
			//SET ATTRACTION NAME
			// $item('#attraction').html = `<h3><a href='${itemData.url}' target='_blank'>${itemData.attractions}</a></h3>`;


			//SET LIGHTNING LANE
			const setLightningLane = (() => {
				return itemData.individualLightningLane !== true ? $item('#lightningRow').collapse() : $item('#lightningRow').expand();
			})		
				
			setLightningLane();
			
			$item('#vectorImage4').onClick(() => {		
				wixWindow.openLightbox("lightningLaneHelpLightbox", {
					"pageSend1": itemData.attractions,
					"pageSend2": $item('#hiddenLightningLanePrice').text,					
				})
				.catch(error => {
					console.log(error);						
				})			
			})

			//SET RIDER INFO
			let minAge = itemData.minimumAge === 'All Ages' ? itemData.minimumAge : itemData.minimumAge;
			let minHeight = itemData.height === 'Any Height' ? itemData.height : itemData.height + ' and taller.';			
			$item('#rider').html = `<p>${minAge}; ${minHeight}</p>`;

			//SET RIDE TYPE TAGS
			let newOptions = [];
			let tagsArr = itemData.rideType;
			tagsArr.forEach((tag) => {
				newOptions.push({'label': tag, 'value':tag},);
			});
			$item("#rideType").options = newOptions;	


			//SET RIDER ICONS
			let riderYesIcon = 'https://static.wixstatic.com/shapes/a99c0f_bb271d52ec8b4a149481a6089dd3634e.svg';
			let riderMaybeIcon = 'https://static.wixstatic.com/shapes/a99c0f_6ba026e175bf4f089e36adfa64f1ee2b.svg';
			let riderNoIcon = 'https://static.wixstatic.com/shapes/a99c0f_623cd493223f47558561933da09f248e.svg';

			if (itemData.nameOneCanRide[0] === "No") {
				$item('#nameOneIcon').src = riderNoIcon;
			} else if (itemData.nameOneCanRide[0] === "Maybe") {
				$item('#nameOneIcon').src = riderMaybeIcon;
			} else {
				$item('#nameOneIcon').src = riderYesIcon;
			}

			if (itemData.nameTwoCanRide[0] === "No") {
				$item('#nameTwoIcon').src = riderNoIcon;
			} else if (itemData.nameOneCanRide[0] === "Maybe") {
				$item('#nameTwoIcon').src = riderMaybeIcon;
			} else {
				$item('#nameTwoIcon').src = riderYesIcon;
			}
			
			//SET RAIN ICONS
			let rainClosed = 'https://static.wixstatic.com/shapes/a99c0f_9cb64df40add49bb970a2337e93ea4c7.svg';
			let rainOpen = 'https://static.wixstatic.com/shapes/a99c0f_6c544f17ce474dbda19dda10c1dc5100.svg'; 
			if (itemData.rainSafe === true) {
				$item('#rainStatusIcon').src = rainOpen;
				$item('#rainStatusText').html = '<p>Stays open</p>'
			} else {
				$item('#rainStatusIcon').src = rainClosed;
				$item('#rainStatusText').html = '<p>May close</p>'
			}	

			//SET INTEREST LEVEL
			let interestText;
			switch(itemData.interest) {
				case 0:
					interestText = 'NAW'
					break;
				case 1:
					interestText = 'If you\'re bored '
					break;
				case 2:
					interestText = 'Meh'
					break;
				case 3:
					interestText = 'If there\'s time';
					break;
				case 4:
					interestText = 'Do it';
					break;
				case 5:
					interestText = 'Must ride';
					break;
				default:
					interestText = 'Interest Level';
			}	
			
			$item('#interestText').text = interestText;


			//API CALLS		
			getWaitTime(itemData.attractionId).then(res => {
				// console.log(res.queue)				
				let time = res?.queue?.STANDBY?.waitTime ?? null; //if wait time doesn't exist return null							
				let status = res.status;
				let lightningLanePrice = '$'+((res?.queue?.PAID_RETURN_TIME?.price?.amount/100).toString()) ?? '$14-$22';
				// console.log(lightningLanePrice);
				$item('#waitTime').html = time === null ? `<h6>${status}</h6` : `<h6>${time} Minute Wait</h6>`;
				$item('#hiddenLightningLanePrice').text = lightningLanePrice;
			})
			.catch(error => {
				console.log(error);
			});

			//set letsGo button to https://maps.apple.com/?q=itemData.location
			let url = 'https://maps.apple.com/?daddr=';			
			$item("#letsGo2").link = url + itemData.location + '&dirflg=w';

		})
		
		//DEFAULT FILTER STATES
		let parkState = ['Magic Kingdom', 'EPCOT', 'Animal Kingdom', 'Hollywood Studios'];
		let rainState = false;
		let nameOneState = ['Yes', 'Maybe', 'No'];
		let nameTwoState = ['Yes', 'Maybe', 'No'];

		//PARK BUTTONS
		let mkButton = $w('#mkButton');
		let ecButton = $w('#ecButton');
		let akButton = $w('#akButton');
		let hsButton = $w('#hsButton');

		//WEATHER BUTTONS
		let sunButton = $w('#sunButton');
		let rainButton = $w('#rainButton');

		//NAME ONE BUTTONS
		let nameOneClearButton = $w('#nameOneClearButton');
		let nameOneYesButton = $w('#nameOneYesButton');
		let nameOneMaybeButton = $w('#nameOneMaybeButton');
		let nameOneNoButton = $w('#nameOneNoButton');

		//NAME TWO BUTTONS
		let nameTwoClearButton = $w('#nameTwoClearButton');
		let nameTwoYesButton = $w('#nameTwoYesButton');
		let nameTwoMaybeButton = $w('#nameTwoMaybeButton');
		let nameTwoNoButton = $w('#nameTwoNoButton');


		//BUTTON ARRAYS TO PASS TO STYLING
		let parkButtons = [mkButton, ecButton, akButton, hsButton];
		let rainButtons = [sunButton, rainButton];
		let nameOneButtons = [nameOneYesButton, nameOneMaybeButton, nameOneNoButton];
		let nameTwoButtons = [nameTwoYesButton, nameTwoMaybeButton, nameTwoNoButton];

		//STYLE ON CLICK TO KEEP STATE APPEARANCE
		function styleButtons(clickedButton, buttonArr) {					
			buttonArr.forEach((button) => {
				if (clickedButton === button) {
					button.style.borderWidth = "2px";
					button.style.borderColor = "#2270df";
					button.style.backgroundColor = "rgba(34, 113, 223,0.1)";
				} else {
					button.style.borderWidth = "0px";
					button.style.borderColor = "#fff";
					button.style.backgroundColor = "#fff";
				}
			})

			$w('#attractionSearchInput').value = "";
		}

		//PARK CLICKS
		mkButton.onClick((event) => {						
			styleButtons(event.target, parkButtons);
			parkState = ['Magic Kingdom'];
			// console.log('click', parkState);
			filter(parkState);
			// filter(parkState, rainState, nameOneState, nameTwoState);
		})

		ecButton.onClick((event) => {
			parkState = ['EPCOT'];
			styleButtons(event.target, parkButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})

		akButton.onClick((event) => {
			parkState = ['Animal Kingdom']
			styleButtons(event.target, parkButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})

		hsButton.onClick((event) => {
			parkState = ['Hollywood Studios']
			styleButtons(event.target, parkButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})

		//RAIN CLICKS
		sunButton.onClick((event) => {
			rainState = false;
			styleButtons(event.target, rainButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})

		rainButton.onClick((event) => {
			rainState = true;
			styleButtons(event.target, rainButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})


		//NAME ONE CLICKS
		nameOneClearButton.onClick((event) => {
			nameOneState = ['Yes', 'Maybe', 'No'];
			styleButtons(event.target, nameOneButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})

		nameOneYesButton.onClick((event) => {
			nameOneState = ['Yes'];
			styleButtons(event.target, nameOneButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})

		nameOneMaybeButton.onClick((event) => {
			nameOneState = ['Maybe'];
			styleButtons(event.target, nameOneButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})

		nameOneNoButton.onClick((event) => {
			nameOneState = ['No'];
			styleButtons(event.target, nameOneButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})

		//NAME TWO CLICKS
		nameTwoClearButton.onClick((event) => {
			nameTwoState = ['Yes', 'Maybe', 'No'];
			styleButtons(event.target, nameTwoButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})

		nameTwoYesButton.onClick((event) => {
			nameTwoState = ['Yes'];
			styleButtons(event.target, nameTwoButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})

		nameTwoMaybeButton.onClick((event) => {
			nameTwoState = ['Maybe'];
			styleButtons(event.target, nameTwoButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})

		nameTwoNoButton.onClick((event) => {
			nameTwoState = ['No'];
			styleButtons(event.target, nameTwoButtons);
			filter(parkState, rainState, nameOneState, nameTwoState);
		})

		$w("#waitTimeRefresh").onClick( (event) => {
			let $item = $w.at(event.context); //repeater item
			$item("#waitTime").text = "Checking";
			let item = $item("#dynamicDataset").getCurrentItem(); //item data
			
			getWaitTime(item.attractionId).then(res => {			
				let time = res?.queue?.STANDBY?.waitTime ?? null; //if wait time doesn't exist return null							
				let status = res.status;
				// console.log(time);
				$item('#waitTime').text = time === null ? status : time + ' Minute Wait';
			})
			.catch(error => {
				console.log(error);
			});
		});
		
		//SEARCH
		let searchIcon = 'https://static.wixstatic.com/shapes/a99c0f_764558fb572940c4a51fcc39a9b3c1a1.svg';
		let searchIconMickey = 'https://static.wixstatic.com/shapes/a99c0f_522d645cc5fd498b9abbf858995821bb.svg';
		let xmark = 'https://static.wixstatic.com/shapes/a99c0f_e15f35ed3d7b47a590ec00e4fcd09e7e.svg';
		//set icon
		$w('#attractionSearchButton').src = searchIcon;

		$w('#attractionSearchInput').onFocus(() => {
			$w('#attractionSearchButton').src = xmark;
		})

		//search attractions when typing
		$w('#attractionSearchInput').onKeyPress((event) => {
			$w('#attractionSearchButton').src = xmark
			let searchTerm = $w('#attractionSearchInput').value
			let key = event.key;
			searchFilter(searchTerm);		
			console.log(key)
			if (key === 'Enter' || key === 'Return') {
				$w('#attractionSearchInput').blur() //close ios keyboard
				$w('#attractionSearchButton').src = searchIcon;
			}
		})

		//clear input
		$w('#attractionSearchButton').onClick(() => {
			if ($w('#attractionSearchButton').src === xmark && ($w('#attractionSearchInput').value).length > 0) {
				$w('#attractionSearchInput').value = "";
				$w('#attractionSearchButton').src = searchIcon;	
				// $w('#attractionSearchInput').focus();
				$w('#attractionSearchInput').resetValidityIndication();		
				filter(parkState, rainState, nameOneState, nameTwoState);	
			} else if ($w('#attractionSearchButton').src === xmark) {
				$w('#attractionSearchInput').value = "";
				$w('#attractionSearchButton').src = searchIcon;	
			}
		})			
	})
});