/* map initialization */
const baseCoords = [48.858253927608224, 2.29450309969435]

const map = L.map('map', {
  zoomControl: false,
  maxBoundsViscosity: 1,
}).setView([baseCoords[0], baseCoords[1]], 5)

const southWest = L.latLng(-90, -172)
const northEast = L.latLng(90, 193)
const bounds = L.latLngBounds(southWest, northEast)

map.setMaxBounds(bounds)

const myIcon = L.icon({
  iconUrl: './public/img/icon-location.svg',
  iconSize: [46, 55],
  iconAnchor: [23, 55],
  popupAnchor: [-3, -76],
})

const marker = L.marker([baseCoords[0], baseCoords[1]], { icon: myIcon })

L.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
  minZoom: 3,
  maxZoom: 18,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  worldCopyJump: true,
}).addTo(map)

/* end of map initialization */
const input = document.querySelector('#search-input')
const button = document.querySelector('#button')
const infoBoxData = document.querySelectorAll('.info-box__data')
const htmlIpAddress = document.querySelector('#ip-address')
const htmlLocation = document.querySelector('#location')
const htmlTimezone = document.querySelector('#timezone')
const htmlIsp = document.querySelector('#isp')
const errorContainer = document.querySelector('#error-container')
const errorMessage = document.querySelector('#error-message')
const closeError = document.querySelector('#error-close')

const regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/

function handleSuccess(data) {
  const time = data.timezone.replaceAll('/', ', ').replaceAll('_', ' ')

  htmlIpAddress.textContent = data.ip // data.ip
  htmlLocation.textContent = `${data.city}, ${data.region_code} ${data.postal} ${data.country_code}`
  htmlTimezone.textContent = time
  htmlIsp.textContent = data.org

  const newLatLng = new L.LatLng(data.latitude, data.longitude)
  marker.setLatLng(newLatLng)
  map.setView(newLatLng)
  if (!map.hasLayer(marker)) {
    marker.addTo(map)
  }

  infoBoxData.forEach((box) => {
    box.style.setProperty('visibility', 'visible')
  })
}

function handleError(type) {
  if (type === 'ip') {
    errorMessage.textContent = "Couldn't find this address IP try another."
  } else if (type === 'format') {
    errorMessage.textContent = 'Only IPv4 (xxx.xxx.xxx.xxx) format is accepted.'
  } else if (type === 'network') {
    errorMessage.textContent = 'Network error, please try again later!'
  } else if (type === 'empty') {
    errorMessage.textContent = 'Enter an IP adress'
  } else {
    errorMessage.textContent = 'Unknow error, please try again later!'
  }
  errorContainer.style.display = 'flex'
}

function handleSubmit() {
  if (input.value === '') {
    handleError('empty')
    return
  }
  if (!regex.test(input.value)) {
    handleError('format')
    return
  }

  errorContainer.style.display = 'none'

  fetch(`https://ipapi.co/${input.value}/json/`)
    .then((response) => response.json())
    .then((data) => (data.error ? handleError('ip') : handleSuccess(data)))
    .catch(() => handleError('network'))
}

button.addEventListener('click', handleSubmit)
input.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return
  handleSubmit()
})

closeError.addEventListener('click', () => {
  errorContainer.style.display = 'none'
})
