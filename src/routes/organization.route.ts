import express from 'express';
import controller from '../controllers/organization/organization.controller';
import { Roles } from '../lib/roles';
import auth from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/joi.middleware';
import userRole from '../middlewares/userRole.middleware';
import {
    createOrganizationSchema,
    updateOrganizationSchema,
} from '../validator/organization.validation';
import { pathParamIdSchema } from '../validator/util';

const router = express.Router();

router.post('/get', auth, controller.getOrganization);
router.post(
    '/',
    auth,
    userRole(Roles.ADMIN),
    validateBody(createOrganizationSchema),
    controller.createOrganization
);
router.delete('/delete', auth, controller.deleteOrganization);
router.put(
    '/:id',
    auth,
    userRole(Roles.ADMIN),
    validateParams(pathParamIdSchema),
    validateBody(updateOrganizationSchema),
    controller.updateOrganization
);

export = router;
