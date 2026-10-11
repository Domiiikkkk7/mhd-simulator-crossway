// ===============================
// MHD SIMULÁTOR - DOPLNĚNÍ VOZIDEL
// ===============================

const extraVehicleCatalogAdditional = {
  'karosa_c734_20': {
    name: 'Karosa C 734.20',
    width: 41,
    height: 79,
    maxPassengers: 41,
    maxSpeed: 7.0,
    color: '#6D4C41',
    acceleration: 0.25,
    batteryLife: 190,
    year: '2000-2008'
  },
  'karosa_c733': {
    name: 'Karosa C 733',
    width: 40,
    height: 77,
    maxPassengers: 39,
    maxSpeed: 6.8,
    color: '#795548',
    acceleration: 0.24,
    batteryLife: 185,
    year: '1998-2005'
  },
  'karosa741_1908': {
    name: 'Karosa B 741.1908',
    width: 41,
    height: 80,
    maxPassengers: 41,
    maxSpeed: 7.0,
    color: '#E65100',
    acceleration: 0.25,
    batteryLife: 188,
    year: '2002-2008'
  },
  'karosa741_1924': {
    name: 'Karosa B 741.1924',
    width: 41,
    height: 80,
    maxPassengers: 41,
    maxSpeed: 7.2,
    color: '#F57C00',
    acceleration: 0.26,
    batteryLife: 195,
    year: '2008-2015'
  },
  'karosa961_1970': {
    name: 'Karosa B 961.1970',
    width: 43,
    height: 84,
    maxPassengers: 45,
    maxSpeed: 7.4,
    color: '#388E3C',
    acceleration: 0.28,
    batteryLife: 205,
    year: '2010-2018'
  }
};

if (typeof vehicleTypes !== 'undefined') {
  Object.assign(vehicleTypes, extraVehicleCatalogAdditional);
}

if (typeof window !== 'undefined') {
  window.extraVehicleCatalogAdditional = extraVehicleCatalogAdditional;
}
