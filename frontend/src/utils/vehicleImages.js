import { api } from '../services/api.js'

const MODEL_TO_IMAGE = {
  'swift': '/vehicles/Maruti_Swift.jpg',
  'baleno': '/vehicles/Maruti_Baleno.jpg',
  'dzire': '/vehicles/Maruti_Dzire.jpg',
  'swift dzire': '/vehicles/Maruti_Dzire.jpg',
  'ertiga': '/vehicles/Maruti_Ertiga.jpg',
  'creta': '/vehicles/Hyundai_Creta.jpg',
  'i20': '/vehicles/Hyundai_i20.jpg',
  'i10': '/vehicles/Hyundai_i20.jpg',
  'grand': '/vehicles/Hyundai_i20.jpg',
  'verna': '/vehicles/Hyundai_Verna.jpg',
  'city': '/vehicles/Honda_City.jpg',
  'amaze': '/vehicles/Honda_Amaze.jpg',
  'innova': '/vehicles/Toyota_Innova.jpg',
  'fortuner': '/vehicles/Toyota_Innova.jpg',
  'xuv500': '/vehicles/Mahindra_XUV500.jpg',
  'nexon': '/vehicles/Tata_Nexon.jpg',
  'harrier': '/vehicles/Tata_Nexon.jpg',
  'polo': '/vehicles/Volkswagen_Polo.jpg',
  'ecosport': '/vehicles/Ford_Ecosport.jpg',
  '3 series': '/vehicles/BMW_3_Series.jpg',
  '911': '/vehicles/Porsche_911.jpg',
  '911 carrera': '/vehicles/Porsche_911.jpg',
  'kwid': '/vehicles/Renault_KWID.jpg',
  'c-class': '/vehicles/Mercedes_C_Class.jpg',
  'a4': '/vehicles/Audi_A4.jpg',
  'seltos': '/vehicles/Kia_Seltos.jpg',
}

const BRAND_FALLBACK_IMAGES = {
  'maruti': '/vehicles/Maruti_Swift.jpg',
  'maruti suzuki': '/vehicles/Maruti_Swift.jpg',
  'hyundai': '/vehicles/Hyundai_Creta.jpg',
  'honda': '/vehicles/Honda_City.jpg',
  'toyota': '/vehicles/Toyota_Innova.jpg',
  'tata': '/vehicles/Tata_Nexon.jpg',
  'mahindra': '/vehicles/Mahindra_XUV500.jpg',
  'volkswagen': '/vehicles/Volkswagen_Polo.jpg',
  'ford': '/vehicles/Ford_Ecosport.jpg',
  'bmw': '/vehicles/BMW_3_Series.jpg',
  'porsche': '/vehicles/Porsche_911.jpg',
  'audi': '/vehicles/Audi_A4.jpg',
  'mercedes': '/vehicles/Mercedes_C_Class.jpg',
  'mercedes-benz': '/vehicles/Mercedes_C_Class.jpg',
  'renault': '/vehicles/Renault_KWID.jpg',
}

export function getVehiclePhotoUrl(vehicle) {
  if (!vehicle) return '/vehicles/Maruti_Swift.jpg'

  // If vehicle has uploaded photo IDs in marketplace
  if (vehicle.photo_ids && vehicle.photo_ids.length > 0 && vehicle.id) {
    return api.marketplacePhotoUrl(vehicle.id, vehicle.photo_ids[0])
  }

  // Model-based genuine photo matching
  const modelStr = String(vehicle.model || '').toLowerCase().trim()
  for (const [key, path] of Object.entries(MODEL_TO_IMAGE)) {
    if (modelStr.includes(key)) {
      return path
    }
  }

  // Brand-based genuine photo matching
  const brandStr = String(vehicle.brand || '').toLowerCase().trim()
  for (const [key, path] of Object.entries(BRAND_FALLBACK_IMAGES)) {
    if (brandStr.includes(key)) {
      return path
    }
  }

  return '/vehicles/Maruti_Swift.jpg'
}
