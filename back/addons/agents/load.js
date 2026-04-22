import agents from './addon.js';

import './core/register/emits.js';
import './core/register/middlewares.js';

import './core/register/schemas/dynamic.js';
import './core/register/schemas/static.js';

import './item/catch/removed.js';
import './core/pipelines/connect.js';
import './core/pipelines/disconnect.js';
import './core/pipelines/bash.js';
import './core/pipelines/metrics/dynamic.js';
import './core/pipelines/metrics/static.js';

import './core/events/middlewares/connect.js';
import './core/events/emits/disconnect.js';

import './items/commands/bash.js';

import './items/servers/grpc.js';

export default agents;
