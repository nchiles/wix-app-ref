# Disney Attractions Planner
This app contains code pulled from an old Wix project that allowed a someone to plan which attractions they want to visit at Disney World, based on wait times, ride heights, and preferences of members of their group.

# How it Worked
## Wait Times
The app calls this api which returns the json with wait time for each attraction:
```
const url = 'https://api.themeparks.wiki/v1/entity/';
    const fullUrl = `${url}${attractionId}/live`;
    (other stuff)
```
In the Wix version, attractions were entered into a Wix collection manually, but it may be possible to use this API to pull them,

### Initial User Setup
Someone signs up and adds "members" to their group. Each member has a name, age, and height. This information populates which Attraction each member can go on, by default, based on height. This is because if an attraction has a certain height restriction a user can't ride it. 

The primary member can then go through each attraction and select an interest level for each member of the party. This determines an average interest for the attraction, with considerations for height taken into account.

## Main Page
The main page is where all attractions are listed, with filter and search. 

### Filters panel
A user can filter by 1. Park, 2. If it's raining (some rides close in the rain) 3. Restrictions for each member of the party — if 2 member can ride something, they can, and the members that can't can do something else.

### Attraction List
The attraction list shows cards for all the attractions. It is filtered by the search, and or preferences the user selects.

### Attractions Card
The attractions card shows:
* an image of the attraction
* tags for notable features of the attraction (classics, dark ride, thrill ride, etc.)
* Park icon, park and subpark (land)
* Attraction name
* Icon that opens directions in Maps app based on coordinates in collection
* if Lightning Lane, what kind, cost
* Rider height requirement
* If it may close from rain
* Icons indicating which party members can/want to ride
* Overall average rating for the group
* Wait time
* More info (was supposed to open a panel with more info on the ride. Was never connected)

## Important Note
This was not fully planned or properly executed, technically. There were many restriction and roadbloacks due to Wix. We are free to make any changes and improvements.