// Import verification script
// Run this to check if all imports are working correctly

import jobService from './jobService.js';
import applicationService from './applicationService.jsx';
import cloudinaryService from './cloudinaryService.js';

console.log('=== IMPORT VERIFICATION ===');

const services = [
  { name: 'jobService', instance: jobService },
  { name: 'applicationService', instance: applicationService },
  { name: 'cloudinaryService', instance: cloudinaryService },
];

let allGood = true;

services.forEach((service) => {
  if (service.instance && typeof service.instance === 'object') {
    console.log(
      `? ${service.name}: OK (object with ${Object.keys(service.instance).length} methods)`
    );
  } else {
    console.error(`? ${service.name}: NOT OK (${typeof service.instance})`);
    allGood = false;
  }
});

// Test specific methods
console.log('\n=== METHOD VERIFICATION ===');

// Test jobService methods
if (jobService && typeof jobService.getActiveJobs === 'function') {
  console.log('? jobService.getActiveJobs: OK');
} else {
  console.error('? jobService.getActiveJobs: Missing');
  allGood = false;
}

// Test applicationService methods
if (applicationService && typeof applicationService.submitApplication === 'function') {
  console.log('? applicationService.submitApplication: OK');
} else {
  console.error('? applicationService.submitApplication: Missing');
  allGood = false;
}

// Test cloudinaryService methods
if (cloudinaryService && typeof cloudinaryService.uploadFile === 'function') {
  console.log('? cloudinaryService.uploadFile: OK');
} else {
  console.error('? cloudinaryService.uploadFile: Missing');
  allGood = false;
}

console.log('\n=== SUMMARY ===');
if (allGood) {
  console.log('? All imports and methods are working correctly!');
} else {
  console.log('? Some imports or methods have issues.');
}

export { jobService, applicationService, cloudinaryService };
