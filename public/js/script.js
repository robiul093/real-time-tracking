const socket = io();

let userName = prompt("Enter your name:");
if (!userName) userName = "Anonymous";

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Latitude =>", latitude, "Longitude =>", longitude);
      socket.emit("send-location", { latitude, longitude, userName });
    },
    (error) => {
      console.log("Error", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

const map = L.map("map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const markers = {};
const trails = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude, userName } = data;
  map.setView([latitude, longitude]);
  if (!markers[id]) {
    markers[id] = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(id === socket.id ? userName : `${socket.id}`)
      .openPopup();
  } else {
    markers[id].setLatLng([latitude, longitude]);
  }

  if (id === socket.id) {
    map.setView([latitude, longitude], 17);
  }

  if (!trails[id]) trails[id] = [];

  trails[id].push([latitude, longitude]);

  if (trails[id].length > 1) {
    if (trails[id].polyline) {
      trails[id].polyline.setLatLngs(trails[id]);
    } else {
      trails[id].polyline = L.polyline(trails[id], { color: "blue" }).addTo(
        map
      );
    }
  }
});

socket.on("update-users", (userList) => {
  const list = document.getElementById("userList");
  list.innerHTML = "";
  userList.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    list.appendChild(li);
  });
});

socket.on("user-disconnected", function (id) {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }

  if (trails[id] && trails[id].polyline) {
    map.removeLayer(trails[id].polyline);
  }

  delete trails[id];
});
