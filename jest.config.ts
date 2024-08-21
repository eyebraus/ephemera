import { getJestProjects } from '@nx/jest';

export default {
    codeCoverage: true,
    projects: getJestProjects(),
    reporters: [['github-actions', { silent: false }], 'summary'],
};
