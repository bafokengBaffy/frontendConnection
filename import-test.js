// Import test file
import jobService from './jobService.js';
import { jobService as jobServiceNamed } from './jobService.js';
import cloudinaryService from './cloudinaryService.js';

console.log('=== Import Test Results ===');
console.log('jobService (default):', typeof jobService);
console.log('jobService (named):', typeof jobServiceNamed);
console.log('cloudinaryService:', typeof cloudinaryService);

// Test jobService methods
if (jobService && typeof jobService.getActiveJobs === 'function') {
    console.log('? jobService.getActiveJobs is a function');
} else {
    console.error('? jobService.getActiveJobs is not a function');
}

if (jobServiceNamed && typeof jobServiceNamed.getActiveJobs === 'function') {
    console.log('? jobServiceNamed.getActiveJobs is a function');
} else {
    console.error('? jobServiceNamed.getActiveJobs is not a function');
}

if (cloudinaryService && typeof cloudinaryService.uploadFile === 'function') {
    console.log('? cloudinaryService.uploadFile is a function');
} else {
    console.error('? cloudinaryService.uploadFile is not a function');
}

console.log('=== Test Complete ===');