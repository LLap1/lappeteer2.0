#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const apps = fs
  .readdirSync(appsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== 'todo.md')
  .map(dirent => dirent.name)
  .sort();


function generateOpenShiftProjectName(app, env) {
  return `overlays-${env}-${app}`;
}

function generateBuildJob(app, env) {
  const branch = env === 'integ' ? 'dev' : 'main';
  return `build-${app}-${env}:
  stage: build
  extends: .build-image
  variables:
    ENV: '${env}'
    VERSION: '\${CI_PIPELINE_IID}'
    MICROSERVICE: '${app}'
  rules:
    - if: '\$CI_COMMIT_BRANCH == "${branch}"'
      changes:
        - apps/${app}/**/*
        - packages/**/*`;
}

function generateDeployJob(app, env) {
  const branch = env === 'integ' ? 'dev' : 'main';
  const openshiftProjectName = generateOpenShiftProjectName(app, env);
  return `deploy-${app}-${env}:
  stage: deploy
  extends: .deploy-image
  variables:
    ENV: '${env}'
    MICROSERVICE: '${app}'
    OPENSHIFT_PROJECT_NAME: ${openshiftProjectName}
    OPENSHIFT_HOST: 'https://api.\${DEPLOYMENT_MAIN_ENV}:6443'
    APP_VERSION: '\${CI_PIPELINE_IID}'
  rules:
    - if: '\$CI_COMMIT_BRANCH == "${branch}"'
      changes:
        - apps/${app}/**/*
        - packages/**/*`;
}

function generateGitLabCI() {
  const header = `default:
  tags:
    - '\${RUNNERS_TAG}'

stages:
  - build
  - deploy

include:
  - local: /ci-templates/build-template.yml
  - local: /ci-templates/deploy-template.yml

`;

  const buildJobs = [];
  const deployJobs = [];

  apps.forEach(app => {
    ['integ', 'prod'].forEach(env => {
      buildJobs.push(generateBuildJob(app, env));
      deployJobs.push(generateDeployJob(app, env));
    });
  });

  return header + buildJobs.join('\n\n') + '\n\n' + deployJobs.join('\n\n') + '\n';
}

const ciContent = generateGitLabCI();
const ciFilePath = path.join(__dirname, '..', '.gitlab-ci.yml');

fs.writeFileSync(ciFilePath, ciContent, 'utf8');
console.log(`Generated GitLab CI configuration for ${apps.length} apps:`);
apps.forEach(app => console.log(`  - ${app}`));
console.log(`\nTotal jobs generated: ${apps.length * 4} (${apps.length * 2} build + ${apps.length * 2} deploy)`);

