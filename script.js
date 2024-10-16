let map;
let infoWindow;
let directionsService;
let directionsRenderer;

function initMap() {
    const myloc = { lat: 40.38127583822331, lng: 49.86776630483177 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: myloc,
    });

    new google.maps.Marker({
        position: myloc,
        map: map,
        title: "You are here",
        icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new google.maps.Size(50, 50)
        },
    });

    infoWindow = new google.maps.InfoWindow();

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    fetchNearbyPlaces(myloc);
}

function fetchNearbyPlaces(location) {
    const service = new google.maps.places.PlacesService(map);
    const request = {
        location: location,
        radius: '500',
        type: 'museum'
    };

    service.nearbySearch(request, processResults);
}

function processResults(results, status, pagination) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (let i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }

        if (pagination && pagination.hasNextPage) {
            setTimeout(() => {
                pagination.nextPage();
            }, 2000);
        }
    } else {
        console.error('Places request failed due to ' + status);
    }
}

function createMarker(place) {
    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
    });

    marker.addListener('click', () => {
        map.setZoom(15);
        map.setCenter(place.geometry.location);

        const infoWindowContent = `
            <div style="
                width: 200px; 
                display: flex; 
                flex-direction: column; 
                justify-content: space-between; 
                height: auto;
            ">
                <div>
                    <h3 style="margin: 0; font-size: 16px;">${place.name}</h3>
                    <p style="margin: 5px 0; font-size: 14px;">${place.vicinity}</p>
                </div>
                <button id="start-route-btn" style="
                    align-self: flex-end;
                    padding: 5px 10px;
                    background-color: #4CAF50;
                    color: white;
                    margin-right: 10px;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                    margin-top: 10px;
                    padding-right: 10px;
                ">Start Route</button>
            </div>
        `;

        infoWindow.setContent(infoWindowContent);
        infoWindow.open(map, marker);

        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
            document.getElementById("start-route-btn").addEventListener('click', () => {
                drawRoute(place);
            });
        });
    });
}


function drawRoute(place) {
    const myloc = { lat: 40.38127583822331, lng: 49.86776630483177 };
    const destination = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
    };

    const request = {
        origin: myloc,
        destination: destination,
        travelMode: 'DRIVING'
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
        } else {
            console.error('Directions request failed due to ' + status);
        }
    });
}

window.initMap = initMap;
