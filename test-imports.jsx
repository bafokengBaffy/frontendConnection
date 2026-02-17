// Test file to verify imports work correctly
import applicationService from './applicationService.jsx';
import { submitApplication } from './applicationService.jsx';

console.log('applicationService:', applicationService);
console.log('submitApplication:', submitApplication);

// Test that they exist
if (applicationService && applicationService.submitApplication) {
    console.log('? applicationService.submitApplication exists');
} else {
    console.error('? applicationService.submitApplication does not exist');
}

if (submitApplication) {
    console.log('? submitApplication function exists');
} else {
    console.error('? submitApplication function does not exist');
}