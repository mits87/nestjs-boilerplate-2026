import { Logger } from '@nestjs/common';

import { applyE2ERuntimeStateToProcessEnv } from './containers/e2e-runtime-state';

import 'reflect-metadata';

Logger.overrideLogger([]);
applyE2ERuntimeStateToProcessEnv();
