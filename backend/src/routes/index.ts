import { Router } from 'express';
import { JobController } from '@controllers/JobController';
import { ReporterController } from '@controllers/ReporterController';
import { EditorController } from '@controllers/EditorController';

const router = Router();

// Controllers
const jobController = new JobController();
const reporterController = new ReporterController();
const editorController = new EditorController();

// Job routes
router.get('/jobs', jobController.getAllJobs);
router.get('/jobs/:id', jobController.getJobById);
router.post('/jobs', jobController.createJob);
router.patch('/jobs/:id/status', jobController.updateJobStatus);
router.post('/jobs/:id/assign-reporter', jobController.assignReporter);
router.get('/jobs/:id/suggested-reporters', jobController.getSuggestedReporters);
router.post('/jobs/:id/assign-editor', jobController.assignEditor);
router.get('/jobs/:id/payment', jobController.getPayment);

// Reporter routes
router.get('/reporters', reporterController.getAllReporters);
router.get('/reporters/:id', reporterController.getReporterById);
router.post('/reporters', reporterController.createReporter);
router.patch('/reporters/:id/availability', reporterController.updateAvailability);

// Editor routes
router.get('/editors', editorController.getAllEditors);
router.get('/editors/:id', editorController.getEditorById);
router.post('/editors', editorController.createEditor);
router.patch('/editors/:id/availability', editorController.updateAvailability);

export default router;
