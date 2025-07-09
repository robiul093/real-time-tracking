const socket = io();

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position) => {
        const {latitude, longitude} = position.coords;
        console.log("Latitude =>", latitude, "Longitude =>", longitude)
        socket.emit("send-location", {latitude, longitude})
    }, (error) => {
        console.log("Error", error)
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    })
}


const map = L.map("map").setView([0, 0], 17);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",).addTo(map)

const markers = {}

socket.on("receive-location", (data) => {
    const {id, latitude, longitude} = data;
    map.setView([latitude, longitude])
    if(markers[id]){
        markers[id].setLatLng([latitude, longitude])
    }
    else{
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
})

socket.on("user-disconnected", function(id) {
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id]
    }
})